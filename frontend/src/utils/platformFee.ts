// Listing is free. This is the only fee LibMarket charges: a small commission
// taken out of what the seller receives when an item actually sells.
export const PLATFORM_FEE_RATE = 0.01; // 1%

export function calculateSellerPayout(saleAmount: number | string | undefined | null) {
  const amount = Number(saleAmount) || 0;
  const fee = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100;
  const netPayout = Math.round((amount - fee) * 100) / 100;
  return { fee, netPayout };
}
