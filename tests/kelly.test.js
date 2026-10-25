import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateKellyFraction,
  calculateRecommendedBetSize,
  calculateExpectedValue,
  calculateExpectedRoiPercent
} from "../src/kelly.js";

test("calculateKellyFraction: positive edge returns positive fraction", () => {
  // If market price is $0.50 (implied 50%) but true probability is 70%
  // b = (1 - 0.5) / 0.5 = 1
  // f* = (1 * 0.7 - 0.3) / 1 = 0.40 (40% bankroll)
  const fStar = calculateKellyFraction(0.70, 0.50);
  assert.equal(fStar, 0.4);
});

test("calculateKellyFraction: negative edge returns negative fraction (pass/bet opposite)", () => {
  // If market price is $0.80 but true probability is only 50%
  const fStar = calculateKellyFraction(0.50, 0.80);
  assert.ok(fStar < 0);
});

test("calculateRecommendedBetSize applies safety multiplier and portfolio cap", () => {
  const bankroll = 1000;
  const fStar = 0.40; // 40% full Kelly

  // Half Kelly: 40% * 0.5 = 20% -> $200
  const halfKelly = calculateRecommendedBetSize(bankroll, fStar, 0.5, 0.30);
  assert.equal(halfKelly, 200);

  // Portfolio Cap: If max cap is 15%, should cap at $150
  const cappedBet = calculateRecommendedBetSize(bankroll, fStar, 0.5, 0.15);
  assert.equal(cappedBet, 150);

  // Negative Kelly returns 0
  assert.equal(calculateRecommendedBetSize(bankroll, -0.2), 0);
});

test("calculateExpectedValue & ROI calculation", () => {
  // True probability = 60%, Market price = $0.40
  // EV = 0.60 - 0.40 = +0.20 per dollar risked
  const ev = calculateExpectedValue(0.60, 0.40);
  assert.equal(ev, 0.20);

  // ROI% = (0.20 / 0.40) * 100 = +50.0%
  const roi = calculateExpectedRoiPercent(0.60, 0.40);
  assert.equal(roi, 50.0);
});

test("invalid price inputs throw descriptive errors", () => {
  assert.throws(() => calculateKellyFraction(0.5, 1.2), /between 0 and 1 exclusive/);
  assert.throws(() => calculateExpectedValue(0.5, 0.0), /between 0 and 1 exclusive/);
});
