import { isFreeGroqConfigured } from "@/lib/tjai/free-provider";
import { isTjaiWorkerConfigured } from "@/lib/tjai/worker-dispatch";

/** Test receipts never grant live access; live passes require generation release gates. */
export function isTjaiPassCheckoutReady(testMode: boolean): boolean {
  return testMode || (isFreeGroqConfigured() && isTjaiWorkerConfigured());
}
