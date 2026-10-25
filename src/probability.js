/**
 * Probability Mathematics & Binary Market Mechanics.
 * Analyzes market implied odds, payout ratios, and arbitrage spreads on Panta Market.
 */

/**
 * Calculates implied probability from contract price.
 * On Panta Market, a contract trading at $0.65 implies a 65% market probability.
 * 
 * @param {number} sharePrice - Price between $0.01 and $0.99
 * @returns {number} Implied probability percentage (1% to 99%)
 */
export function getImpliedProbability(sharePrice) {
  if (sharePrice <= 0 || sharePrice >= 1) {
    throw new Error("Share price must be between 0 and 1 exclusive.");
  }
  return Number((sharePrice * 100).toFixed(2));
}

/**
 * Computes the gross and net profit for winning a binary prediction outcome.
 * If contract costs $C and resolves to $1.00:
 *   Gross Payout = shares * 1.00
 *   Net Profit = shares * (1.00 - C)
 * 
 * @param {number} investmentUsd - Amount risked in USD
 * @param {number} sharePrice - Price paid per share
 * @returns {{ sharesCount: number, grossPayout: number, netProfit: number, profitMultiplier: number }}
 */
export function calculatePayout(investmentUsd, sharePrice) {
  if (investmentUsd <= 0 || sharePrice <= 0 || sharePrice >= 1) {
    throw new Error("Invalid investment or share price parameters.");
  }

  const sharesCount = investmentUsd / sharePrice;
  const grossPayout = sharesCount * 1.0;
  const netProfit = grossPayout - investmentUsd;
  const profitMultiplier = grossPayout / investmentUsd;

  return {
    sharesCount: Number(sharesCount.toFixed(4)),
    grossPayout: Number(grossPayout.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    profitMultiplier: Number(profitMultiplier.toFixed(3)),
  };
}

/**
 * Detects binary outcome arbitrage opportunities.
 * In an efficient binary market, Price(YES) + Price(NO) should equal $1.00 (plus maker/taker fee).
 * If Price(YES) + Price(NO) < 1.00, buying both guarantees risk-free profit.
 * 
 * @param {number} yesPrice - Price of YES token
 * @param {number} noPrice - Price of NO token
 * @param {number} feePercent - Trading fee percentage (e.g. 1.0 for 1%)
 * @returns {{ isArbitrage: boolean, totalCost: number, profitMarginPercent: number }}
 */
export function detectArbitrage(yesPrice, noPrice, feePercent = 1.0) {
  const feeMultiplier = 1 + (feePercent / 100);
  const totalCost = (yesPrice + noPrice) * feeMultiplier;
  const isArbitrage = totalCost < 1.0;
  const profitMarginPercent = isArbitrage ? ((1.0 - totalCost) / totalCost) * 100 : 0;

  return {
    isArbitrage,
    totalCost: Number(totalCost.toFixed(4)),
    profitMarginPercent: Number(profitMarginPercent.toFixed(2)),
  };
}
