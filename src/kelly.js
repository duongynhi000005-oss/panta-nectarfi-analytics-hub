/**
 * Kelly Criterion & Expected Value (EV) Engine for Binary Prediction Markets.
 * Tailored for Panta Market YES/NO position sizing and risk management.
 */

/**
 * Calculates the full Kelly Criterion fraction for a binary market.
 * Formula: f* = (b * p - q) / b
 * where:
 *   b = net fractional odds = (1 - marketPrice) / marketPrice
 *   p = estimated true probability (0 to 1)
 *   q = 1 - p
 * 
 * @param {number} estimatedProb - Trader's estimated true probability (0.00 to 1.00)
 * @param {number} marketPrice - Current market price of the outcome token (0.01 to 0.99)
 * @returns {number} Optimal bankroll fraction to wager (-1.0 to 1.0; negative means bet opposite or pass)
 */
export function calculateKellyFraction(estimatedProb, marketPrice) {
  if (marketPrice <= 0 || marketPrice >= 1) {
    throw new Error("Market price must be between 0 and 1 exclusive.");
  }
  if (estimatedProb < 0 || estimatedProb > 1) {
    throw new Error("Estimated probability must be between 0 and 1 inclusive.");
  }

  // Net odds received per dollar wagered
  const b = (1 - marketPrice) / marketPrice;
  const p = estimatedProb;
  const q = 1 - p;

  const fStar = (b * p - q) / b;
  return Number(fStar.toFixed(6));
}

/**
 * Calculates suggested bet size in USD based on bankroll and safety multiplier.
 * 
 * @param {number} bankroll - Total trading capital in USD
 * @param {number} kellyFraction - Full Kelly fraction
 * @param {number} fractionMultiplier - Safety multiplier (e.g. 0.25 for Quarter Kelly, 0.5 for Half Kelly)
 * @param {number} maxCapPercent - Maximum portfolio allocation cap (default 20%)
 * @returns {number} Suggested bet amount in USD
 */
export function calculateRecommendedBetSize(
  bankroll,
  kellyFraction,
  fractionMultiplier = 0.5,
  maxCapPercent = 0.20
) {
  if (bankroll <= 0 || kellyFraction <= 0) {
    return 0;
  }

  const scaledFraction = kellyFraction * fractionMultiplier;
  const cappedFraction = Math.min(scaledFraction, maxCapPercent);
  const betAmount = bankroll * cappedFraction;

  return Math.max(0, Number(betAmount.toFixed(2)));
}

/**
 * Computes Expected Value (EV) per dollar risked.
 * Formula: EV = p * (1 - marketPrice) - (1 - p) * marketPrice = p - marketPrice
 * 
 * @param {number} estimatedProb - Estimated probability of winning (0 to 1)
 * @param {number} marketPrice - Market share price (0 to 1)
 * @returns {number} Net expected value per dollar risked
 */
export function calculateExpectedValue(estimatedProb, marketPrice) {
  if (marketPrice <= 0 || marketPrice >= 1) {
    throw new Error("Market price must be between 0 and 1 exclusive.");
  }
  return Number((estimatedProb - marketPrice).toFixed(6));
}

/**
 * Computes Expected Return on Investment (ROI) in percentage.
 * Formula: ROI% = ((p - marketPrice) / marketPrice) * 100
 * 
 * @param {number} estimatedProb
 * @param {number} marketPrice
 * @returns {number} Percentage expected ROI
 */
export function calculateExpectedRoiPercent(estimatedProb, marketPrice) {
  if (marketPrice <= 0 || marketPrice >= 1) {
    throw new Error("Market price must be between 0 and 1 exclusive.");
  }
  const roi = ((estimatedProb - marketPrice) / marketPrice) * 100;
  return Number(roi.toFixed(2));
}
