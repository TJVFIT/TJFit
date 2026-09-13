"use client";

const SCRIPT_URL = "https://app.lemonsqueezy.com/js/lemon.js";
const SCRIPT_ID = "tjfit-lemon-checkout";
const LOAD_TIMEOUT_MS = 8000;

type LemonBrowser = Window & {
  createLemonSqueezy?: () => void;
  LemonSqueezy?: { Url: { Open: (url: string) => void } };
};

let scriptLoad: Promise<void> | null = null;

function checkoutUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.port
    || !/^[a-z0-9-]+\.lemonsqueezy\.com$/.test(url.hostname)
    || !url.pathname.startsWith("/checkout/") || url.pathname === "/checkout/") {
    throw new Error("Invalid Lemon Squeezy checkout URL");
  }
  return url.href;
}

function loadScript(target: LemonBrowser): Promise<void> {
  if (typeof target.LemonSqueezy?.Url?.Open === "function"
    || typeof target.createLemonSqueezy === "function") return Promise.resolve();
  if (scriptLoad) return scriptLoad;

  scriptLoad = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing && existing.src !== SCRIPT_URL) {
      reject(new Error("Unexpected checkout script"));
      return;
    }
    const script = existing ?? document.createElement("script");
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      if (error) {
        if (!existing) script.remove();
        reject(error);
      } else resolve();
    };
    const onLoad = () => finish();
    const onError = () => finish(new Error("Checkout script unavailable"));
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    timer = setTimeout(() => finish(new Error("Checkout script timed out")), LOAD_TIMEOUT_MS);
    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      script.async = true;
      try { document.head.appendChild(script); } catch { onError(); }
    }
  }).catch(error => {
    scriptLoad = null;
    throw error;
  });
  return scriptLoad;
}

/**
 * Opens only a checkout URL supplied by the server. The result describes the
 * presentation attempt, never payment or access. Only server verification may
 * grant access; no Lemon.js success event is consumed here.
 * https://docs.lemonsqueezy.com/help/lemonjs/using-with-frameworks-libraries
 */
export async function openLemonCheckout(value: string): Promise<"overlay" | "redirect"> {
  const url = checkoutUrl(value);
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Checkout requires a browser");
  }
  const target = window as LemonBrowser;
  try {
    await loadScript(target);
    target.createLemonSqueezy?.();
    if (typeof target.LemonSqueezy?.Url?.Open !== "function") {
      throw new Error("Checkout overlay unavailable");
    }
    target.LemonSqueezy.Url.Open(url);
    return "overlay";
  } catch {
    window.location.assign(url);
    return "redirect";
  }
}
