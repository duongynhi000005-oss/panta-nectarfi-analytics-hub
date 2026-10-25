/**
 * Market Creation Wizard & Metadata Validator for Panta Market.
 * Validates permissionless market proposals against Panta guidelines.
 */

export const SUPPORTED_CATEGORIES = [
  "Crypto",
  "DeFi",
  "Macro & Economy",
  "Tech & AI",
  "Pop Culture & Sports",
  "Solana Ecosystem"
];

/**
 * Validates a proposed prediction market.
 * 
 * @param {Object} proposal
 * @param {string} proposal.title - Clear, unambiguous binary question
 * @param {string} proposal.category - One of SUPPORTED_CATEGORIES
 * @param {string} proposal.resolutionCriteria - Specific, objective criteria for YES vs NO
 * @param {string} proposal.resolutionSourceUrl - Official oracle or primary source link
 * @param {string|Date} proposal.resolutionDate - Future date
 * @param {number} proposal.initialLiquidityUsd - Initial seeding liquidity (min $5)
 * @returns {{ isValid: boolean, errors: string[], normalizedMetadata: Object|null }}
 */
export function validateMarketProposal(proposal) {
  const errors = [];

  if (!proposal || typeof proposal !== "object") {
    return { isValid: false, errors: ["Missing proposal payload."], normalizedMetadata: null };
  }

  // 1. Question Title Check
  const title = (proposal.title || "").trim();
  if (title.length < 15) {
    errors.push("Market title must be at least 15 characters long.");
  }
  if (!title.endsWith("?")) {
    errors.push("Market title must be framed as a clear question ending with '?'.");
  }

  // 2. Category Check
  if (!SUPPORTED_CATEGORIES.includes(proposal.category)) {
    errors.push(`Invalid category. Must be one of: ${SUPPORTED_CATEGORIES.join(", ")}`);
  }

  // 3. Resolution Criteria Check
  const criteria = (proposal.resolutionCriteria || "").trim();
  if (criteria.length < 25) {
    errors.push("Resolution criteria must be detailed (at least 25 characters) to prevent ambiguity.");
  }

  // 4. Source URL Check
  const source = (proposal.resolutionSourceUrl || "").trim();
  if (!source.startsWith("http://") && !source.startsWith("https://")) {
    errors.push("Resolution source must be a valid HTTP/HTTPS URL (e.g. CoinGecko, official announcement, SEC filing).");
  }

  // 5. Resolution Date Check
  const resTime = new Date(proposal.resolutionDate).getTime();
  const now = Date.now();
  if (isNaN(resTime) || resTime <= now + 3600 * 1000) {
    errors.push("Resolution date must be in the future (at least 1 hour from now).");
  }

  // 6. Initial Liquidity Check
  const liquidity = Number(proposal.initialLiquidityUsd);
  if (isNaN(liquidity) || liquidity < 1) {
    errors.push("Initial liquidity must be at least $1 USD.");
  }

  if (errors.length > 0) {
    return { isValid: false, errors, normalizedMetadata: null };
  }

  return {
    isValid: true,
    errors: [],
    normalizedMetadata: {
      title,
      category: proposal.category,
      resolutionCriteria: criteria,
      resolutionSourceUrl: source,
      resolutionDateIso: new Date(resTime).toISOString(),
      resolutionTimestamp: Math.floor(resTime / 1000),
      initialLiquidityUsd: liquidity,
      outcomes: ["YES", "NO"],
      createdAtIso: new Date().toISOString(),
      version: "panta-v1"
    }
  };
}
