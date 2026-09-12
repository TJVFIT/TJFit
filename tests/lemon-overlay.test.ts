import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const url = "https://tjfit.lemonsqueezy.com/checkout/custom/test-checkout?embed=1";
class Script extends EventTarget {
  id = "";
  src = "";
  async = false;
  remove = vi.fn();
}

function browserFixture() {
  const scripts: Script[] = [];
  const target: {
    location: { assign: ReturnType<typeof vi.fn> };
    createLemonSqueezy?: () => void;
    LemonSqueezy?: { Url: { Open: ReturnType<typeof vi.fn> } };
  } = { location: { assign: vi.fn() } };
  const appendChild = vi.fn((script: Script) => { scripts.push(script); return script; });
  vi.stubGlobal("window", target);
  vi.stubGlobal("document", {
    getElementById: () => null,
    createElement: () => new Script(),
    head: { appendChild }
  });
  return { target, scripts, appendChild };
}

beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("Lemon checkout browser boundary", () => {
  it.each([
    "javascript:alert(1)", "http://tjfit.lemonsqueezy.com/checkout/buy/a",
    "https://lemonsqueezy.com.evil.test/checkout/a", "https://evil-lemonsqueezy.com/checkout/a",
    "https://user:password@tjfit.lemonsqueezy.com/checkout/a", "https://tjfit.lemonsqueezy.com:8443/checkout/a",
    "https://tjfit.lemonsqueezy.com/account", "https://tjfit.lemonsqueezy.com/checkout/"
  ])("rejects unsafe destinations before loading or navigating: %s", async value => {
    const fixture = browserFixture();
    const { openLemonCheckout } = await import("@/lib/payments/lemon/browser");
    await expect(openLemonCheckout(value)).rejects.toThrow();
    expect(fixture.appendChild).not.toHaveBeenCalled();
    expect(fixture.target.location.assign).not.toHaveBeenCalled();
  });

  it("initializes and opens the official API without reloading an available script", async () => {
    const { target, appendChild } = browserFixture();
    const open = vi.fn();
    target.createLemonSqueezy = vi.fn(() => { target.LemonSqueezy = { Url: { Open: open } }; });
    const { openLemonCheckout } = await import("@/lib/payments/lemon/browser");
    expect(await openLemonCheckout(url)).toBe("overlay");
    expect(target.createLemonSqueezy).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(url);
    expect(appendChild).not.toHaveBeenCalled();
    expect(target.location.assign).not.toHaveBeenCalled();
  });

  it("shares the official script load and adds no payment-success event handler", async () => {
    const { target, scripts, appendChild } = browserFixture();
    const { openLemonCheckout } = await import("@/lib/payments/lemon/browser");
    const first = openLemonCheckout(url);
    const second = openLemonCheckout(url);
    expect(appendChild).toHaveBeenCalledOnce();
    expect(scripts[0].src).toBe("https://app.lemonsqueezy.com/js/lemon.js");
    const open = vi.fn();
    target.createLemonSqueezy = vi.fn(() => { target.LemonSqueezy = { Url: { Open: open } }; });
    scripts[0].dispatchEvent(new Event("load"));
    expect(await first).toBe("overlay");
    expect(await second).toBe("overlay");
    expect(open).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("redirects on a blocked script and permits a later retry", async () => {
    const { target, scripts, appendChild } = browserFixture();
    const { openLemonCheckout } = await import("@/lib/payments/lemon/browser");
    const result = openLemonCheckout(url);
    scripts[0].dispatchEvent(new Event("error"));
    expect(await result).toBe("redirect");
    expect(target.location.assign).toHaveBeenCalledWith(url);
    expect(scripts[0].remove).toHaveBeenCalledOnce();
    const retry = openLemonCheckout(url);
    expect(appendChild).toHaveBeenCalledTimes(2);
    scripts[1].dispatchEvent(new Event("error"));
    await retry;
  });

  it("redirects after the loading deadline and ignores a late load event", async () => {
    const { target, scripts } = browserFixture();
    const { openLemonCheckout } = await import("@/lib/payments/lemon/browser");
    const result = openLemonCheckout(url);
    await vi.advanceTimersByTimeAsync(8000);
    expect(await result).toBe("redirect");
    const open = vi.fn();
    target.LemonSqueezy = { Url: { Open: open } };
    scripts[0].dispatchEvent(new Event("load"));
    expect(open).not.toHaveBeenCalled();
    expect(target.location.assign).toHaveBeenCalledOnce();
  });

  it("redirects when a loaded script exposes no overlay API", async () => {
    const { target, scripts } = browserFixture();
    const { openLemonCheckout } = await import("@/lib/payments/lemon/browser");
    const result = openLemonCheckout(url);
    scripts[0].dispatchEvent(new Event("load"));
    expect(await result).toBe("redirect");
    expect(target.location.assign).toHaveBeenCalledWith(url);
  });

  it("redirects when the official overlay throws", async () => {
    const { target } = browserFixture();
    target.LemonSqueezy = { Url: { Open: vi.fn(() => { throw new Error("blocked"); }) } };
    const { openLemonCheckout } = await import("@/lib/payments/lemon/browser");
    expect(await openLemonCheckout(url)).toBe("redirect");
    expect(target.location.assign).toHaveBeenCalledWith(url);
  });
});
