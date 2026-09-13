import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export type UIStringHit = { line: number; column: number; text: string; context: string };

// Copy and accessibility props only: CSS, paths, SVG geometry, types and handlers
// are syntax/data, never copy just because they appear beside a rendered label.
const COPY_ATTRIBUTES = new Set([
  "alt", "title", "placeholder", "aria-label", "aria-description", "aria-valuetext",
  "label", "description", "caption", "heading", "subheading", "subtitle",
  "emptyMessage", "errorMessage", "loadingText", "buttonText", "helperText", "children"
]);

// Exact, language-independent names/units. Never exempt arbitrary uppercase,
// one-word, lowercase, or CSS-looking text: SAVE and loading are still copy.
const UNIVERSAL_TEXT = new Set([
  "TJFit", "TJFIT", "TJAI", "TJCOIN", "TJCoins", "TJC", "TJ",
  "Gumroad", "Lemon Squeezy", "Shopify", "Google", "Apple", "Instagram", "YouTube",
  "Facebook", "WhatsApp", "TikTok", "Telegram", "X", "Supabase", "Groq",
  "kg", "g", "cm", "mm", "km", "m", "lb", "lbs", "kcal", "ml", "L", "bpm",
  "USD", "TRY", "EUR", "GBP", "TL", "PDF", "CSV", "PNG", "JPEG", "JPG"
]);

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isCopy(value: string) {
  const text = normalize(value);
  const words = text.replace(/[\p{N}\p{P}\p{S}]/gu, " ").trim().split(/\s+/);
  if (!/\p{L}/u.test(text) || UNIVERSAL_TEXT.has(text) || words.every((word) => UNIVERSAL_TEXT.has(word))) return false;
  // Literal addresses/URLs are identifiers; descriptive link text is scanned.
  if (/^(?:https?:\/\/|mailto:|tel:)/i.test(text)) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return false;
  return true;
}

function jsxText(value: string) {
  // JSX entities are parsed as characters by React. An entity such as &quot;
  // contains letters in source but contributes no translatable word on screen.
  return value.replace(/&(?:#(?:x[\da-f]+|\d+)|amp|lt|gt|quot|apos|nbsp|copy|reg|hellip|middot|ndash|mdash);/gi, " ");
}

function isCompleteLocaleChoice(node: ts.ConditionalExpression, source: ts.SourceFile) {
  const locales = new Set(["en", "tr", "ar", "es", "fr"]);
  let current: ts.Expression = node;
  let selector: string | undefined;
  while (ts.isConditionalExpression(current)) {
    const condition = current.condition;
    if (!ts.isBinaryExpression(condition) || ![ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken].includes(condition.operatorToken.kind)) return false;
    const key = ts.isStringLiteral(condition.right) ? condition.right : ts.isStringLiteral(condition.left) ? condition.left : null;
    const target = key === condition.right ? condition.left : condition.right;
    if (!key || !locales.delete(key.text) || !/^(?:[\w$]+\.)?(?:locale|loc)$/.test(target.getText(source))) return false;
    if (selector && selector !== target.getText(source)) return false;
    selector = target.getText(source);
    current = current.whenFalse;
  }
  // Four explicit locale branches plus the remaining fallback cover all five.
  return locales.size <= 1;
}

/** Scan syntax at copy sinks, not every string in a file. This intentionally does
 * not resolve imported/local variables or evaluate translation dictionaries. */
export function scanSource(content: string, fileName = "component.tsx"): UIStringHit[] {
  const source = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const hits: UIStringHit[] = [];
  const seen = new Set<number>();
  const add = (node: ts.Node, value: string, context: string) => {
    if (!isCopy(value) || seen.has(node.getStart(source))) return;
    const offset = node.getStart(source);
    const position = source.getLineAndCharacterOfPosition(offset);
    seen.add(offset);
    hits.push({ line: position.line + 1, column: position.character + 1, text: normalize(value), context });
  };

  // Follow possible displayed values, not conditions, lookup keys, call arguments,
  // callback parameters or dictionary entries, which are not rendered by themselves.
  const rendered = (node: ts.Expression, context: string): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      add(node, node.text, context);
    } else if (ts.isTemplateExpression(node)) {
      add(node.head, node.head.text, context);
      for (const span of node.templateSpans) {
        rendered(span.expression, context);
        add(span.literal, span.literal.text, context);
      }
    } else if (ts.isConditionalExpression(node)) {
      if (isCompleteLocaleChoice(node, source)) return;
      rendered(node.whenTrue, context);
      rendered(node.whenFalse, context);
    } else if (ts.isBinaryExpression(node)) {
      const operator = node.operatorToken.kind;
      if (operator === ts.SyntaxKind.PlusToken || operator === ts.SyntaxKind.BarBarToken || operator === ts.SyntaxKind.QuestionQuestionToken) {
        rendered(node.left, context);
        rendered(node.right, context);
      } else if (operator === ts.SyntaxKind.AmpersandAmpersandToken) {
        rendered(node.right, context);
      }
    } else if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node) || ts.isSatisfiesExpression(node)) {
      rendered(node.expression, context);
    } else if (ts.isArrayLiteralExpression(node)) {
      node.elements.forEach((element) => { if (ts.isExpression(element)) rendered(element, context); });
    } else if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "map") {
      const callback = node.arguments[0];
      if (callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))) {
        if (ts.isBlock(callback.body)) {
          callback.body.statements.forEach((statement) => {
            if (ts.isReturnStatement(statement) && statement.expression) rendered(statement.expression, context);
          });
        } else rendered(callback.body, context);
      }
    }
  };

  const visit = (node: ts.Node): void => {
    if (ts.isJsxElement(node) && ["script", "style"].includes(node.openingElement.tagName.getText(source))) return;
    if (ts.isJsxText(node)) {
      add(node, jsxText(node.text), "JSX text");
    } else if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(source);
      let visible = COPY_ATTRIBUTES.has(name);
      // Only button-like input values are copy; text/number input values are data.
      if (name === "value" && ts.isJsxAttributes(node.parent)) {
        const owner = node.parent.parent;
        const type = node.parent.properties.find((prop) => ts.isJsxAttribute(prop) && prop.name.getText(source) === "type");
        visible = owner.tagName.getText(source) === "input" && !!type && ts.isJsxAttribute(type) && !!type.initializer && ts.isStringLiteral(type.initializer) && ["submit", "reset", "button"].includes(type.initializer.text);
      }
      if (visible && node.initializer) {
        if (ts.isStringLiteral(node.initializer)) add(node.initializer, jsxText(node.initializer.text), name);
        else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) rendered(node.initializer.expression, name);
      }
      // Event handlers can contain error/toast calls, but their literal arguments
      // must not be mistaken for visible attribute values.
      if (node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) ts.forEachChild(node.initializer.expression, visit);
      return;
    } else if (ts.isJsxExpression(node) && node.expression) {
      rendered(node.expression, "JSX expression");
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const direct = ts.isIdentifier(callee) && ["setError", "setErrorMessage", "alert", "confirm", "toast"].includes(callee.text);
      const toast = ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.expression.text === "toast";
      if ((direct || toast) && node.arguments[0]) rendered(node.arguments[0], callee.getText(source));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return hits.sort((a, b) => a.line - b.line || a.column - b.column);
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const file = path.join(dir, item.name);
    return item.isDirectory() ? walk(file) : /\.tsx?$/.test(item.name) ? [file] : [];
  });
}

export function main(root = process.cwd()) {
  const files = ["src/app", "src/components"].flatMap((dir) => {
    const absolute = path.join(root, dir);
    return fs.existsSync(absolute) ? walk(absolute) : [];
  });
  const violations = files.flatMap((file) => scanSource(fs.readFileSync(file, "utf8"), file).map((hit) => ({ file: path.relative(root, file), ...hit })));
  if (!violations.length) {
    console.log("i18n hardcoded UI scan passed.");
    return;
  }
  console.error("Found " + violations.length + " potential hardcoded UI strings (AST copy sinks):");
  for (const hit of violations) console.error("- " + hit.file + ":" + hit.line + ":" + hit.column + " [" + hit.context + "] -> " + JSON.stringify(hit.text));
  process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

