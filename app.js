/**
 * Panta x NectarFi Analytics Hub & Interactive Engine.
 * Implements client-side Kelly Criterion calculations, leaderboard simulation,
 * market creation validation, and viral content distribution tools.
 */

// Global State
let selectedOutcome = "YES"; // "YES" or "NO"

// DOM Elements - Calculator
const bankrollInput = document.getElementById("bankrollInput");
const marketPriceInput = document.getElementById("marketPriceInput");
const marketPriceSlider = document.getElementById("marketPriceSlider");
const trueProbInput = document.getElementById("trueProbInput");
const trueProbSlider = document.getElementById("trueProbSlider");
const yesToggle = document.getElementById("toggleYes");
const noToggle = document.getElementById("toggleNo");

// Output KPIs
const kpiKellyFraction = document.getElementById("kpiKellyFraction");
const kpiRecommendedBet = document.getElementById("kpiRecommendedBet");
const kpiExpectedValue = document.getElementById("kpiExpectedValue");
const kpiExpectedRoi = document.getElementById("kpiExpectedRoi");
const kpiPotentialProfit = document.getElementById("kpiPotentialProfit");
const kpiPayoutMultiplier = document.getElementById("kpiPayoutMultiplier");
const edgeBadge = document.getElementById("edgeBadge");

// Canvas Chart
const chartCanvas = document.getElementById("profitChartCanvas");
const chartCtx = chartCanvas ? chartCanvas.getContext("2d") : null;

// Leaderboard State
const SIMULATED_LEADERBOARD = [
  { rank: 1, trader: "7xKv...9P2m", volume: 28450, pnl: 4820, trades: 142, prizeEst: "$350 USDG" },
  { rank: 2, trader: "3mRt...4K1x", volume: 21800, pnl: 3410, trades: 98, prizeEst: "$250 USDG" },
  { rank: 3, trader: "9vBn...2L8p", volume: 16500, pnl: 2190, trades: 76, prizeEst: "$180 USDG" },
  { rank: 4, trader: "4cDx...8W3q", volume: 12200, pnl: 1450, trades: 54, prizeEst: "$120 USDG" },
  { rank: 5, trader: "2fGh...6Y9t", volume: 9400, pnl: 980, trades: 41, prizeEst: "$100 USDG" },
  { rank: 6, trader: "8jKl...1Z4r", volume: 6800, pnl: 620, trades: 32, prizeEst: "Leaderboard Contender" },
  { rank: 7, trader: "5pMn...7T2v", volume: 4900, pnl: 410, trades: 24, prizeEst: "Leaderboard Contender" },
  { rank: 8, trader: "1wQz...5S9b", volume: 3200, pnl: 280, trades: 18, prizeEst: "Leaderboard Contender" },
];

function initApp() {
  setupTabs();
  setupCalculatorListeners();
  setupMarketWizard();
  renderLeaderboard();
  updateCalculator();
  window.addEventListener("resize", drawProfitChart);
}

// ----------------------------------------------------
// Tab Navigation
// ----------------------------------------------------
function setupTabs() {
  const btns = document.querySelectorAll(".tab-btn");
  const panes = document.querySelectorAll(".tab-pane");

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      btns.forEach((b) => b.classList.remove("active"));
      panes.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");

      if (targetId === "tabCalculator") {
        setTimeout(drawProfitChart, 50);
      }
    });
  });
}

// ----------------------------------------------------
// Kelly Criterion & EV Calculator Logic
// ----------------------------------------------------
function setupCalculatorListeners() {
  if (yesToggle && noToggle) {
    yesToggle.addEventListener("click", () => {
      selectedOutcome = "YES";
      yesToggle.classList.add("active", "yes");
      noToggle.classList.remove("active", "no");
      updateCalculator();
    });

    noToggle.addEventListener("click", () => {
      selectedOutcome = "NO";
      noToggle.classList.add("active", "no");
      yesToggle.classList.remove("active", "yes");
      updateCalculator();
    });
  }

  // Two-way synchronization between slider & numeric inputs
  marketPriceSlider.addEventListener("input", (e) => {
    marketPriceInput.value = parseFloat(e.target.value).toFixed(2);
    updateCalculator();
  });
  marketPriceInput.addEventListener("input", (e) => {
    marketPriceSlider.value = e.target.value;
    updateCalculator();
  });

  trueProbSlider.addEventListener("input", (e) => {
    trueProbInput.value = parseInt(e.target.value);
    updateCalculator();
  });
  trueProbInput.addEventListener("input", (e) => {
    trueProbSlider.value = e.target.value;
    updateCalculator();
  });

  bankrollInput.addEventListener("input", updateCalculator);
}

function updateCalculator() {
  const bankroll = parseFloat(bankrollInput.value) || 0;
  let price = parseFloat(marketPriceInput.value) || 0.5;
  price = Math.max(0.01, Math.min(0.99, price));

  let probPercent = parseFloat(trueProbInput.value) || 50;
  probPercent = Math.max(1, Math.min(99, probPercent));
  const p = probPercent / 100;

  // If betting NO, inverse the pricing
  const effectivePrice = selectedOutcome === "YES" ? price : (1.0 - price);
  const effectiveProb = selectedOutcome === "YES" ? p : (1.0 - p);

  // Net odds b = (1 - price) / price
  const b = (1 - effectivePrice) / effectivePrice;
  const q = 1 - effectiveProb;
  const fStar = (b * effectiveProb - q) / b;

  // Expected Value per dollar
  const ev = effectiveProb - effectivePrice;
  const roi = (ev / effectivePrice) * 100;

  // Half Kelly sizing
  const halfKellyFraction = Math.max(0, fStar * 0.5);
  const recommendedBet = Math.min(bankroll * halfKellyFraction, bankroll * 0.25); // cap 25%

  // Payout & profit
  const shares = recommendedBet > 0 ? recommendedBet / effectivePrice : 0;
  const potentialProfit = recommendedBet > 0 ? shares * 1.0 - recommendedBet : 0;
  const multiplier = 1.0 / effectivePrice;

  // Update DOM
  kpiKellyFraction.textContent = `${(fStar * 100).toFixed(1)}%`;
  kpiRecommendedBet.textContent = `$${recommendedBet.toFixed(2)}`;
  kpiExpectedValue.textContent = `${ev >= 0 ? "+" : ""}$${ev.toFixed(2)}`;
  kpiExpectedRoi.textContent = `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`;
  kpiPotentialProfit.textContent = `+$${potentialProfit.toFixed(2)}`;
  kpiPayoutMultiplier.textContent = `${multiplier.toFixed(2)}x`;

  // Edge Badge
  if (fStar > 0.05) {
    edgeBadge.className = "badge-pill";
    edgeBadge.style.color = "var(--panta-green)";
    edgeBadge.style.borderColor = "var(--panta-green)";
    edgeBadge.innerHTML = `<span class="dot"></span> Positive Edge (+${roi.toFixed(1)}% ROI)`;
  } else if (fStar < -0.05) {
    edgeBadge.className = "badge-pill";
    edgeBadge.style.color = "var(--alert-rose)";
    edgeBadge.style.borderColor = "var(--alert-rose)";
    edgeBadge.innerHTML = `<span class="dot" style="background:var(--alert-rose)"></span> Negative Edge (Bet Opposite / Pass)`;
  } else {
    edgeBadge.className = "badge-pill";
    edgeBadge.style.color = "var(--text-muted)";
    edgeBadge.innerHTML = `Neutral Edge (Fair Odds)`;
  }

  drawProfitChart(recommendedBet, effectivePrice, potentialProfit);
}

function drawProfitChart(bet = 100, price = 0.5, maxProfit = 100) {
  if (!chartCanvas || !chartCtx) return;

  const rect = chartCanvas.getBoundingClientRect();
  chartCanvas.width = rect.width * window.devicePixelRatio;
  chartCanvas.height = rect.height * window.devicePixelRatio;
  chartCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const w = rect.width;
  const h = rect.height;
  chartCtx.clearRect(0, 0, w, h);

  // Background Grid
  chartCtx.strokeStyle = "#1e293b";
  chartCtx.lineWidth = 1;

  for (let y = 30; y < h - 30; y += 40) {
    chartCtx.beginPath();
    chartCtx.moveTo(40, y);
    chartCtx.lineTo(w - 20, y);
    chartCtx.stroke();
  }

  // Draw Outcome Bars (Loss vs Win)
  const barWidth = 90;
  const centerX1 = w * 0.35;
  const centerX2 = w * 0.65;
  const zeroY = h * 0.6;

  // Zero Line
  chartCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  chartCtx.beginPath();
  chartCtx.moveTo(30, zeroY);
  chartCtx.lineTo(w - 20, zeroY);
  chartCtx.stroke();

  // Loss Bar (Red)
  const lossHeight = Math.min(zeroY - 20, (bet / (bet + maxProfit || 1)) * 90);
  chartCtx.fillStyle = "#f43f5e";
  chartCtx.fillRect(centerX1 - barWidth / 2, zeroY, barWidth, lossHeight);

  // Win Bar (Green)
  const winHeight = Math.min(zeroY - 20, (maxProfit / (bet + maxProfit || 1)) * 140);
  chartCtx.fillStyle = "#00ffa3";
  chartCtx.fillRect(centerX2 - barWidth / 2, zeroY - winHeight, barWidth, winHeight);

  // Labels
  chartCtx.fillStyle = "#94a3b8";
  chartCtx.font = "12px -apple-system, sans-serif";
  chartCtx.textAlign = "center";
  chartCtx.fillText("Event Resolves FALSE", centerX1, h - 10);
  chartCtx.fillText("Event Resolves TRUE", centerX2, h - 10);

  chartCtx.fillStyle = "#fff";
  chartCtx.font = "bold 13px ui-monospace, monospace";
  chartCtx.fillText(`-$${bet.toFixed(0)}`, centerX1, zeroY + lossHeight + 18);
  chartCtx.fillText(`+$${maxProfit.toFixed(0)}`, centerX2, zeroY - winHeight - 10);
}

// ----------------------------------------------------
// Leaderboard & Volume Simulator
// ----------------------------------------------------
function renderLeaderboard() {
  const tbody = document.getElementById("leaderboardBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  SIMULATED_LEADERBOARD.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-family:var(--font-mono); font-weight:700; color: ${row.rank <= 3 ? "var(--nectar-gold)" : "#fff"}">
        #${row.rank} ${row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : ""}
      </td>
      <td style="font-family:var(--font-mono);">${row.trader}</td>
      <td style="font-family:var(--font-mono); font-weight:700;">$${row.volume.toLocaleString()}</td>
      <td style="font-family:var(--font-mono); color:var(--panta-green);">+$${row.pnl.toLocaleString()}</td>
      <td style="color:var(--text-muted);">${row.trades} trades</td>
      <td><span style="font-size:0.75rem; background:rgba(255,184,0,0.15); color:var(--nectar-gold); padding:2px 8px; border-radius:4px; font-weight:700;">${row.prizeEst}</span></td>
    `;
    tbody.appendChild(tr);
  });

  const simInput = document.getElementById("simVolumeInput");
  if (simInput) {
    simInput.addEventListener("input", (e) => {
      const vol = parseFloat(e.target.value) || 0;
      let estRank = 9;
      for (let i = 0; i < SIMULATED_LEADERBOARD.length; i++) {
        if (vol >= SIMULATED_LEADERBOARD[i].volume) {
          estRank = i + 1;
          break;
        }
      }
      document.getElementById("projectedRank").textContent = `#${estRank}`;
      document.getElementById("projectedPrize").textContent = estRank <= 5 ? `$${100 * (6 - estRank)} USDG` : "Climbing Tier";
    });
  }
}

// ----------------------------------------------------
// Market Creation Wizard
// ----------------------------------------------------
function setupMarketWizard() {
  const form = document.getElementById("marketWizardForm");
  const jsonPreview = document.getElementById("marketJsonPreview");
  const validationAlert = document.getElementById("wizardValidationAlert");

  if (!form) return;

  form.addEventListener("input", () => {
    const title = document.getElementById("wizTitle").value.trim();
    const category = document.getElementById("wizCategory").value;
    const criteria = document.getElementById("wizCriteria").value.trim();
    const sourceUrl = document.getElementById("wizSourceUrl").value.trim();
    const resDate = document.getElementById("wizDate").value;
    const liquidity = parseFloat(document.getElementById("wizLiquidity").value) || 0;

    const errors = [];
    if (title.length < 15 || !title.endsWith("?")) {
      errors.push("Question must be at least 15 chars and end with '?'.");
    }
    if (criteria.length < 25) {
      errors.push("Resolution criteria must be detailed (>= 25 chars).");
    }
    if (!sourceUrl.startsWith("http")) {
      errors.push("Valid oracle URL required.");
    }
    if (liquidity < 1) {
      errors.push("Minimum liquidity is $1 USD.");
    }

    if (errors.length > 0) {
      validationAlert.style.display = "block";
      validationAlert.innerHTML = `⚠️ ${errors[0]}`;
      validationAlert.style.color = "var(--alert-rose)";
    } else {
      validationAlert.style.display = "block";
      validationAlert.innerHTML = `✓ Ready for Panta Market Creation!`;
      validationAlert.style.color = "var(--panta-green)";

      const schema = {
        title,
        category,
        resolutionCriteria: criteria,
        resolutionSourceUrl: sourceUrl,
        resolutionDate: resDate,
        initialLiquidityUsd: liquidity,
        outcomes: ["YES", "NO"],
        version: "panta-v1"
      };
      if (jsonPreview) jsonPreview.textContent = JSON.stringify(schema, null, 2);
    }
  });

  const copyJsonBtn = document.getElementById("copyMarketJsonBtn");
  if (copyJsonBtn && jsonPreview) {
    copyJsonBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(jsonPreview.textContent).then(() => {
        showToast("Market metadata copied to clipboard!");
      });
    });
  }
}

// ----------------------------------------------------
// Social Content Copy Handlers
// ----------------------------------------------------
window.copyTweet = function (tweetIndex) {
  const el = document.getElementById(`tweetText_${tweetIndex}`);
  if (el) {
    navigator.clipboard.writeText(el.innerText).then(() => {
      showToast(`Tweet ${tweetIndex} copied!`);
    });
  }
};

window.copyFullThread = function () {
  const tweets = [];
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById(`tweetText_${i}`);
    if (el) tweets.push(el.innerText);
  }
  navigator.clipboard.writeText(tweets.join("\n\n---\n\n")).then(() => {
    showToast("Full 6-Tweet Thread copied to clipboard!");
  });
};

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// Start
window.addEventListener("DOMContentLoaded", initApp);
