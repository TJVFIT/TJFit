export const TJFIT_COINS_PER_PROGRAM_PURCHASE = 10;
export const TJFIT_COINS_PER_USD = 10;

export type DiscountOffer = {
  key: string;
  title: string;
  coinCost: number;
  discountPercent: number;
};

export function generateDiscountCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `TJFIT-${timestamp}-${random}`;
}
