import { test } from "node:test";
import assert from "node:assert/strict";
import { validateMarketProposal } from "../src/market_validator.js";

test("validateMarketProposal accepts complete and valid proposals", () => {
  const futureDate = new Date(Date.now() + 86400 * 7 * 1000).toISOString(); // 7 days in future
  const validProposal = {
    title: "Will Solana break $300 by December 2026?",
    category: "Crypto",
    resolutionCriteria: "Resolves to YES if Binance SOL/USDT 1-minute close price touches $300.00 or higher before Dec 31, 2026.",
    resolutionSourceUrl: "https://www.binance.com/en/trade/SOL_USDT",
    resolutionDate: futureDate,
    initialLiquidityUsd: 50
  };

  const res = validateMarketProposal(validProposal);
  assert.equal(res.isValid, true);
  assert.equal(res.errors.length, 0);
  assert.equal(res.normalizedMetadata.outcomes[0], "YES");
  assert.equal(res.normalizedMetadata.category, "Crypto");
});

test("validateMarketProposal rejects ambiguous or incomplete proposals", () => {
  const invalidProposal = {
    title: "Solana pump soon", // no question mark, too short
    category: "NonExistentCategory",
    resolutionCriteria: "dunno", // too short
    resolutionSourceUrl: "invalid-url",
    resolutionDate: "2020-01-01", // past date
    initialLiquidityUsd: 0 // below min
  };

  const res = validateMarketProposal(invalidProposal);
  assert.equal(res.isValid, false);
  assert.ok(res.errors.length >= 5);
});
