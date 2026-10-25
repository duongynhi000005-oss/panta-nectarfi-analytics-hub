import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getImpliedProbability,
  calculatePayout,
  detectArbitrage
} from "../src/probability.js";

test("getImpliedProbability converts share price to percentage", () => {
  assert.equal(getImpliedProbability(0.65), 65.0);
  assert.equal(getImpliedProbability(0.05), 5.0);
  assert.equal(getImpliedProbability(0.99), 99.0);
});

test("calculatePayout calculates gross, net profit and multiplier", () => {
  // $100 invested at $0.25/share
  // sharesCount = 400
  // Gross Payout = $400
  // Net Profit = $300
  // Multiplier = 4.0x
  const payout = calculatePayout(100, 0.25);
  assert.equal(payout.sharesCount, 400);
  assert.equal(payout.grossPayout, 400);
  assert.equal(payout.netProfit, 300);
  assert.equal(payout.profitMultiplier, 4.0);
});

test("detectArbitrage recognizes underpriced sum of outcomes", () => {
  // If YES is $0.40 and NO is $0.50 (Sum = $0.90) with 1% fee -> total cost = 0.909 < 1.00 -> Arbitrage!
  const arb = detectArbitrage(0.40, 0.50, 1.0);
  assert.equal(arb.isArbitrage, true);
  assert.ok(arb.profitMarginPercent > 9.0);

  // If YES is $0.55 and NO is $0.50 (Sum = $1.05) -> No Arbitrage
  const noArb = detectArbitrage(0.55, 0.50, 1.0);
  assert.equal(noArb.isArbitrage, false);
});
