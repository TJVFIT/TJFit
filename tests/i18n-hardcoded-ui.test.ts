import { describe, expect, it } from "vitest";
import { scanSource } from "../scripts/i18n/check-hardcoded-ui";

const texts = (source: string) => scanSource(source).map((hit) => hit.text);

describe("AST hardcoded UI scanner", () => {
  it("finds bare JSX, one-word labels, uppercase words, lowercase copy and Unicode", () => {
    expect(texts('<><h1>SAVE</h1><button>Go</button><p>loading</p><p>مرحبا</p><p>Gönder</p></>'))
      .toEqual(["SAVE", "Go", "loading", "مرحبا", "Gönder"]);
  });

  it("finds visible attributes without parsing CSS, SVG geometry or paths as copy", () => {
    expect(texts('<><input placeholder="Tags (comma separated)" aria-label="Tags" className="bg-[rgba(0,0,0,.2)] text-white" type="text" accept="image/*" /><svg viewBox="0 0 400 200"><path d="M 10 20 L 30 40" stroke="currentColor" /><text>Chart legend</text></svg><a href="/about" title="About us">{copy.link}</a></>'))
      .toEqual(["Tags (comma separated)", "Tags", "Chart legend", "About us"]);
  });

  it("ignores locale dictionaries, lookup keys, API selects, imports and dynamic CSS", () => {
    expect(texts('import { x } from "@/copy"; const copy = { en: { label: "Start here" }, ar: { label: "ابدأ هنا" } }; const column = db.select("id,label,name"); export const UI = <p className={ok ? "text-white" : "text-muted"}>{copy[locale].label}{labels["loading"]}{t("Some key")}</p>;'))
      .toEqual([]);
  });

  it("finds conditional results and fallback copy, not comparison operands", () => {
    expect(texts('<p>{status === "loading" ? "Please wait" : copy.ready}{name ?? "Member"}{error && "Try again"}</p>'))
      .toEqual(["Please wait", "Member", "Try again"]);
  });

  it("finds template chunks, concatenations, array text and callback return text", () => {
    expect(texts('<p>{`Hello ${name}, welcome back`}{count + " members"}{["First", "Second"]}{items.map(item => item.ok ? "Ready" : "Pending")}</p>'))
      .toEqual(["Hello", ", welcome back", "members", "First", "Second", "Ready", "Pending"]);
  });

  it("allows complete locale choices but reports partial English-only fallbacks", () => {
    expect(texts('<p>{locale === "tr" ? "Yenile" : locale === "ar" ? "تحديث" : locale === "es" ? "Actualizar" : locale === "fr" ? "Actualiser" : "Refresh"}</p>')).toEqual([]);
    expect(texts('<p>{locale === "tr" ? "Yenile" : "Refresh"}</p>')).toEqual(["Yenile", "Refresh"]);
    expect(texts('<p>{loc === "tr" ? "Kapat" : loc === "ar" ? "إغلاق" : loc === "es" ? "Cerrar" : loc === "fr" ? "Fermer" : "Dismiss"}</p>')).toEqual([]);
  });

  it("finds error/toast messages including event handlers, not server logs or API errors", () => {
    expect(texts('console.error("Internal error"); throw new Error("Invalid query"); setError("Please sign in"); toast.error(ok ? copy.saved : "Save failed"); const UI = <button onClick={() => setError("Retry please")}>{copy.retry}</button>;'))
      .toEqual(["Please sign in", "Save failed", "Retry please"]);
  });

  it("does not mistake handlers and technical attribute expressions for copy", () => {
    expect(texts('<div data-state={open ? "open" : "closed"} className={`border ${active ? "text-white" : "text-muted"}`} onClick={() => track("View clicked")}>{copy.title}</div>')).toEqual([]);
  });

  it("scans button input values while ignoring data input values", () => {
    expect(texts('<><input value="Training" /><input type="submit" value="Save changes" /><input type="button" value={busy ? "Saving" : copy.save} /></>')).toEqual(["Save changes", "Saving"]);
  });

  it("ignores universal identifiers, amounts and unit separators but not brand descriptions", () => {
    expect(texts('<p>TJFit ·<span>$10 USD</span><span>kg ·</span><span>TJAI</span><span>TJAI coaching</span><span>support@example.com</span></p>')).toEqual(["TJAI coaching"]);
  });

  it("handles JSX entities and whitespace without inventing entity words", () => {
    expect(texts('<p>&quot;{name}&quot; &nbsp; &#x2192; <span>  Hello\n   there </span></p>')).toEqual(["Hello there"]);
  });

  it("does not interpret script/style content as visible copy", () => {
    expect(texts('<><script>{`window.message = "Ready now"`}</script><style>{`p::before { content: "Hello"; }`}</style><p>Visible</p></>')).toEqual(["Visible"]);
  });

  it("reports stable one-based positions on real literal nodes", () => {
    const hits = scanSource('const UI = (\n  <input\n    placeholder="Search here"\n  />\n);');
    expect(hits).toEqual([{ line: 3, column: 17, text: "Search here", context: "placeholder" }]);
  });
});
