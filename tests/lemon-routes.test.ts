import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ user: { id: "6deaa048-e50c-49ab-b6d8-6d3bd1345a74", email: "buyer@example.test", email_confirmed_at: "2026-09-01" } as Record<string, string> | null,
  writes: [] as Array<{table: string; value: Record<string, unknown>}>, filters: [] as unknown[][],
  intake: { id: "50c75a91-4662-4975-bec1-674dd0bab343", age: 25 } as Record<string, unknown> | null,
  rpc: vi.fn(), provider: true, worker: true, intakeCheck: vi.fn(), intent: null as Record<string,unknown> | null }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: h.user }, error: null }) } }) }));
vi.mock("@/lib/tjai/free-provider", () => ({ isFreeGroqConfigured: () => h.provider }));
vi.mock("@/lib/tjai/worker-dispatch", () => ({ isTjaiWorkerConfigured: () => h.worker }));
vi.mock("@/lib/tjai/intake-validation", () => ({ validateAdultIntake: h.intakeCheck }));
vi.mock("@/lib/supabase-server", () => ({ getSupabaseServerClient: () => ({ rpc: h.rpc, from: (table: string) => {
  const q = { select: () => q, eq: (...args: unknown[]) => { h.filters.push([table,...args]); return q; }, gte: (...args: unknown[]) => { h.filters.push([table,...args]); return q; },
    insert: (value: Record<string, unknown>) => { h.writes.push({ table, value }); return q; },
    single: async () => ({ data: { id: "258c4040-5c04-4ec3-a66c-2a00c1b03b9c", ...h.writes.at(-1)?.value }, error: null }),
    maybeSingle: async () => ({ data: table === "tjai_intake_drafts" ? h.intake : h.intent, error: null }) };
  return q;
} }) }));
import { POST as createOrder } from "@/app/api/checkout/create-order/route";
import { GET as availability } from "@/app/api/checkout/availability/route";
import { POST as prepareSession } from "@/app/api/checkout/prepare-session/route";
import { POST as webhook } from "@/app/api/webhooks/lemonsqueezy/route";

beforeEach(() => {
  vi.stubEnv("ALLOW_TEST_CHECKOUT", "true");
  vi.stubEnv("NODE_ENV", "test"); vi.stubEnv("VERCEL_ENV", "preview"); vi.stubEnv("PAYMENT_PROVIDER", "lemonsqueezy");
  vi.stubEnv("LEMON_MODE", "test"); vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://tjfit.example.test");
  vi.stubEnv("LEMON_TEST_API_KEY", "fake-test-key"); vi.stubEnv("LEMON_TEST_WEBHOOK_SECRET", "fake-secret"); vi.stubEnv("LEMON_TEST_STORE_ID", "12");
  vi.stubEnv("LEMON_TEST_PRODUCT_MAP_JSON", JSON.stringify({ "tjai-pass": { productId: "6", variantId: "8" }, "home-starter": {productId:"7",variantId:"9"} }));
  vi.stubEnv("LEMON_LIVE_WEBHOOK_SECRET", ""); vi.stubEnv("LEMON_LIVE_STORE_ID", "");
  h.user = { id: "6deaa048-e50c-49ab-b6d8-6d3bd1345a74", email: "buyer@example.test", email_confirmed_at: "2026-09-01" };
  h.intake = { id: "50c75a91-4662-4975-bec1-674dd0bab343", age: 25, answers_json: {s1_age:25}, locale:"en" }; h.writes.length=0; h.filters.length=0; h.provider=true; h.worker=true;
  h.intent=null; h.intakeCheck.mockReset().mockReturnValue({ok:true,age:25,locale:"en",answers:h.intake.answers_json});
  h.rpc.mockReset().mockResolvedValue({ data: { status: "test_paid" }, error: null });
});
afterEach(() => vi.unstubAllEnvs());
const request = (body: unknown) => new NextRequest("https://tjfit.example.test/api/checkout/create-order", { method: "POST", body: JSON.stringify(body) });
describe("server-owned purchase intents", () => {
  it.each(["", "false"])("keeps configured test buying closed without explicit activation: %s", async (flag) => {
    vi.stubEnv("ALLOW_TEST_CHECKOUT", flag);
    expect(await (await availability()).json()).toEqual({ available: false, testMode: false, programSlugs: [] });
    expect((await createOrder(request({ programSlug: "home-starter", locale: "en" }))).status).toBe(503);
    expect(h.writes).toHaveLength(0);
  });
  it("binds the authenticated account and approved USD amount, ignoring client identity/prices/mode", async () => {
    const response = await createOrder(request({ programSlug:"home-starter",locale:"en",userId:"attacker",amount_minor:1,test_mode:false }));
    expect(response.status).toBe(200);
    expect(h.writes[0].value).toMatchObject({ user_id:h.user?.id,email:h.user?.email,amount_minor:1000,currency:"USD",test_mode:true,product_id:"7",variant_id:"9" });
    expect((await response.json()).clientFlow.action).toBe("redirect_lemon");
  });
  it("requires an owned adult intake before creating a pass intent", async () => {
    expect((await createOrder(request({ programSlug:"tjai-pass",locale:"en" }))).status).toBe(400);
    expect(h.writes).toHaveLength(0);
    const response = await createOrder(request({ programSlug:"tjai-pass",locale:"en",intakeId:h.intake?.id }));
    expect(response.status).toBe(200);
    expect(h.filters).toContainEqual(["tjai_intake_drafts","user_id",h.user?.id]);
    expect(h.filters).toContainEqual(["tjai_intake_drafts","age",18]);
    expect(h.writes[0].value.amount_minor).toBe(1999);
  });
  it.each(["provider", "worker"] as const)("does not sell a live pass when %s is unavailable; bundles remain independent", async (dependency) => {
    vi.stubEnv("LEMON_MODE", "live"); vi.stubEnv("LEMON_LIVE_ENABLED", "true");
    vi.stubEnv("LEMON_LIVE_API_KEY", "fake-live-key"); vi.stubEnv("LEMON_LIVE_WEBHOOK_SECRET", "fake-live-secret");
    vi.stubEnv("LEMON_LIVE_STORE_ID", "12"); vi.stubEnv("LEMON_LIVE_PRODUCT_MAP_JSON", process.env.LEMON_TEST_PRODUCT_MAP_JSON!);
    h[dependency]=false;
    expect((await createOrder(request({programSlug:"tjai-pass",locale:"en",intakeId:h.intake?.id}))).status).toBe(503);
    expect(h.writes).toHaveLength(0);
    expect((await (await availability()).json()).programSlugs).toEqual(["home-starter"]);
    expect((await createOrder(request({programSlug:"home-starter",locale:"en"}))).status).toBe(200);
  });
  it("allows a test-only pass receipt flow without enabling real AI generation", async () => {
    h.provider=false; h.worker=false;
    expect((await createOrder(request({programSlug:"tjai-pass",locale:"en",intakeId:h.intake?.id}))).status).toBe(200);
    expect(h.writes[0].value.test_mode).toBe(true);
    expect((await (await availability()).json()).programSlugs).toContain("tjai-pass");
  });
  it("does not create a new Gumroad charge or accept another user's intake", async () => {
    vi.stubEnv("PAYMENT_PROVIDER","gumroad");
    expect((await createOrder(request({programSlug:"home-starter",locale:"en"}))).status).toBe(503);
    vi.stubEnv("PAYMENT_PROVIDER","lemonsqueezy"); const intakeId=h.intake?.id; h.intake=null;
    expect((await createOrder(request({programSlug:"tjai-pass",locale:"en",intakeId}))).status).toBe(403);
    expect(h.writes).toHaveLength(0);
  });
  it("revalidates an older adult draft before creating a pass intent", async () => {
    h.intakeCheck.mockReturnValue({ok:false,error:"nutrition_targets_unsupported"});
    const result=await createOrder(request({programSlug:"tjai-pass",locale:"en",intakeId:h.intake?.id}));
    expect(result.status).toBe(409); expect(await result.json()).toEqual({error:"intake_needs_review"});
    expect(h.intakeCheck).toHaveBeenCalledWith(h.intake?.answers_json,h.intake?.locale);
    expect(h.writes).toHaveLength(0);
  });
  it("revalidates owned intake before returning even a previously prepared pass checkout URL", async () => {
    h.intent={id:"258c4040-5c04-4ec3-a66c-2a00c1b03b9c",user_id:h.user?.id,email:h.user?.email,
      program_slug:"tjai-pass",product_kind:"tjai_pass",amount_minor:1999,test_mode:true,
      store_id:"12",product_id:"6",variant_id:"8",status:"pending",expires_at:new Date(Date.now()+60000).toISOString(),
      intake_id:h.intake?.id,checkout_url:"https://tjfit.lemonsqueezy.com/checkout/test-session"};
    h.intakeCheck.mockReturnValue({ok:false,error:"nutrition_targets_unsupported"});
    const response=await prepareSession(request({orderId:h.intent.id}));
    expect(response.status).toBe(409); expect(await response.json()).toEqual({error:"intake_needs_review"});
    expect(h.filters).toContainEqual(["tjai_intake_drafts","user_id",h.user?.id]);
    expect(h.intakeCheck).toHaveBeenCalledWith(h.intake?.answers_json,h.intake?.locale);
    expect(h.writes).toHaveLength(0);
  });
  it("rejects anonymous, unverified-email, free products, and discount mutations", async () => {
    h.user=null; expect((await createOrder(request({}))).status).toBe(401);
    h.user={id:"user",email:"buyer@example.test"}; expect((await createOrder(request({programSlug:"home-starter",locale:"en"}))).status).toBe(403);
    expect((await createOrder(request({programSlug:"fat-loss",locale:"en"}))).status).toBe(400);
    expect((await createOrder(request({programSlug:"home-starter",locale:"en",discountCode:"FREE"}))).status).toBe(400);
    expect(h.writes).toHaveLength(0);
  });
});

const payload = () => ({meta:{event_name:"order_created",custom_data:{tjfit_intent:"258c4040-5c04-4ec3-a66c-2a00c1b03b9c"}},data:{type:"orders",id:"54",attributes:{store_id:12,test_mode:true,user_email:"buyer@example.test",currency:"USD",subtotal:1000,total:1000,tax:0,tax_inclusive:false,discount_total:0,refunded_amount:0,status:"paid",refunded:false,first_order_item:{order_id:54,product_id:7,variant_id:9,price:1000,test_mode:true}}}});
function signed(value: unknown, secret="fake-secret") { const raw=JSON.stringify(value); return new NextRequest("https://tjfit.example.test/api/webhooks/lemonsqueezy",{method:"POST",body:raw,headers:{"x-signature":createHmac("sha256",secret).update(raw).digest("hex")}}); }
describe("raw signed webhook route", () => {
  it("uses one atomic RPC with verified fields and never passes client user IDs", async () => {
    expect((await webhook(signed(payload()))).status).toBe(200);
    expect(h.rpc).toHaveBeenCalledTimes(1);
    expect(h.rpc.mock.calls[0][0]).toBe("apply_lemon_order_event");
    expect(h.rpc.mock.calls[0][1].p_event).toMatchObject({storeId:"12",variantId:"9",amountMinor:1000,testMode:true});
    expect(h.rpc.mock.calls[0][1].p_event).not.toHaveProperty("userId");
  });
  it("does not acknowledge payment storage failures", async () => {
    h.rpc.mockResolvedValue({data:null,error:{message:"missing migration"}});
    expect((await webhook(signed(payload()))).status).toBe(503);
  });
  it("rejects wrong signatures, cross-mode secrets, and wrong stores before touching storage", async () => {
    expect((await webhook(signed(payload(),"wrong"))).status).toBe(401);
    const wrongMode=payload(); wrongMode.data.attributes.test_mode=false;
    expect((await webhook(signed(wrongMode))).status).toBe(400);
    const wrongStore=payload(); wrongStore.data.attributes.store_id=99;
    expect((await webhook(signed(wrongStore))).status).toBe(400);
    expect(h.rpc).not.toHaveBeenCalled();
  });
  it("bounds the raw body before signature or JSON work", async () => {
    const response = await webhook(new NextRequest("https://tjfit.example.test/api/webhooks/lemonsqueezy",{method:"POST",body:"x".repeat(65537)}));
    expect(response.status).toBe(413); expect(h.rpc).not.toHaveBeenCalled();
  });
});
