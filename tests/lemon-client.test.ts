import { afterEach, describe, expect, it, vi } from "vitest";
import { createLemonCheckout, isLemonCheckoutUrl, type DigitalIntent } from "@/lib/payments/lemon/client";
import type { LemonConfig } from "@/lib/payments/lemon/config";

afterEach(() => vi.unstubAllGlobals());
const config: LemonConfig = {testMode:true,storeId:"12",apiKey:"fake",siteUrl:"https://tjfit.example.test",products:{"tjai-pass":{productId:"6",variantId:"8"}}};
const intent: DigitalIntent = {id:"258c4040-5c04-4ec3-a66c-2a00c1b03b9c",user_id:"local-user",email:"buyer@example.test",program_slug:"tjai-pass",product_kind:"tjai_pass",amount_minor:1999,store_id:"12",product_id:"6",variant_id:"8",test_mode:true,locale:"en",intake_id:"50c75a91-4662-4975-bec1-674dd0bab343",status:"pending",expires_at:"2026-09-13T00:00:00Z",checkout_id:null,checkout_url:null};
function fixture(category="one_time") {
  return vi.fn(async (url: string, init: RequestInit) => {
    const route=url.split("/v1/")[1];
    const resource = (type:string,id:string,attributes:Record<string,unknown>) => ({data:{type,id,attributes}});
    const body = route.startsWith("stores/") ? resource("stores","12",{currency:"USD"}) : route.startsWith("products/") ? resource("products","6",{store_id:12,test_mode:true,status:"published"}) : route.startsWith("variants/") ? resource("variants","8",{product_id:6,test_mode:true,status:"pending"}) : route.startsWith("prices?") ? {data:[{type:"prices",attributes:{variant_id:8,category,scheme:"standard",unit_price:1999,usage_aggregation:null}}]} : resource("checkouts","provider-checkout",{store_id:12,variant_id:8,test_mode:true,custom_price:1999,url:"https://tjfit.lemonsqueezy.com/checkout/custom/test",preview:{currency:"USD",subtotal:1999,discount_total:0}});
    return new Response(JSON.stringify(body),{status:200});
  });
}
describe("Lemon hosted checkout adapter", () => {
  it("verifies price/store/variant before creation, with only opaque custom data", async () => {
    const fetcher=fixture(); vi.stubGlobal("fetch",fetcher);
    const result=await createLemonCheckout(config,intent);
    expect(result.url).toContain("tjfit.lemonsqueezy.com/checkout/");
    const call=fetcher.mock.calls.find(([,init])=>init.method==="POST");
    const body=JSON.parse(call![1].body as string);
    expect(body.data.attributes.checkout_data.custom).toEqual({tjfit_intent:intent.id});
    expect(body.data.attributes.custom_price).toBe(1999);
    expect(body.data.attributes.product_options.enabled_variants).toEqual([8]);
    expect(body.data.attributes.checkout_options.discount).toBe(false);
    expect(body.data.attributes.test_mode).toBe(true);
  });
  it("never creates a one-time pass checkout against a subscription price", async () => {
    const fetcher=fixture("subscription"); vi.stubGlobal("fetch",fetcher);
    await expect(createLemonCheckout(config,intent)).rejects.toThrow();
    expect(fetcher.mock.calls.some(([,init])=>init.method==="POST")).toBe(false);
  });
  it.each(["https://evil.test/checkout/x","https://tjfit.lemonsqueezy.com.evil.test/checkout/x","http://tjfit.lemonsqueezy.com/checkout/x","https://user@tjfit.lemonsqueezy.com/checkout/x"])("rejects unsafe checkout redirect %s",url=>expect(isLemonCheckoutUrl(url)).toBe(false));
});
