// Liberian Dollar to USD exchange rate
// As of 2024, approximate rate: 1 USD = 190-195 LRD
// This should be updated regularly or fetched from an API
export const USD_TO_LRD_RATE = 190;

export interface Price {
  lrd: number;
  usd: number;
}

/**
 * Convert USD to LRD
 */
export const usdToLrd = (usd: number): number => {
  return Math.round(usd * USD_TO_LRD_RATE);
};

/**
 * Convert LRD to USD
 */
export const lrdToUsd = (lrd: number): number => {
  return Math.round((lrd / USD_TO_LRD_RATE) * 100) / 100;
};

/**
 * Format price with both currencies
 * Primary display: LRD, Secondary: USD
 */
export const formatDualPrice = (usdPrice: number): string => {
  const lrd = usdToLrd(usdPrice);
  return `L$${lrd.toLocaleString()} (~$${usdPrice.toFixed(2)})`;
};

/**
 * Format LRD only
 */
export const formatLRD = (lrd: number): string => {
  return `L$${lrd.toLocaleString()}`;
};

/**
 * Format USD only
 */
export const formatUSD = (usd: number): string => {
  return `$${usd.toFixed(2)}`;
};

/**
 * Create price object from USD
 */
export const createPriceFromUSD = (usd: number): Price => {
  return {
    lrd: usdToLrd(usd),
    usd: usd
  };
};

/**
 * Create price object from LRD
 */
export const createPriceFromLRD = (lrd: number): Price => {
  return {
    lrd: lrd,
    usd: lrdToUsd(lrd)
  };
};

/**
 * Get compact dual price format
 * For use in cards and small spaces
 */
export const formatCompactDualPrice = (usdPrice: number): { primary: string; secondary: string } => {
  const lrd = usdToLrd(usdPrice);
  return {
    primary: `L$${lrd.toLocaleString()}`,
    secondary: `~$${usdPrice.toFixed(2)}`
  };
};

/**
 * Format price based on the currency it was listed in
 */
export const formatPriceWithCurrency = (price: number | string | null | undefined, currency: string = 'USD'): { primary: string; secondary: string } => {
  // Handle null, undefined, or string inputs safely
  const numericPrice = typeof price === 'string' ? parseFloat(price) : (typeof price === 'number' ? price : 0);
  
  let usd: number;
  let lrd: number;

  if (currency === 'USD') {
    usd = numericPrice;
    lrd = usdToLrd(numericPrice);
    return {
      primary: `L$${lrd.toLocaleString()}`,
      secondary: `~$${usd.toFixed(2)}`
    };
  } else {
    lrd = numericPrice;
    usd = lrdToUsd(numericPrice);
    return {
      primary: `L$${lrd.toLocaleString()}`,
      secondary: `~$${usd.toFixed(2)}`
    };
  }
};
