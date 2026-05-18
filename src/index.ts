import { TradePosition } from "./TradePosition";
import { SpotPosition } from "./SpotPosition";
import { FuturesPosition } from "./FuturesPosition";
import { positionsData, PositionData } from "./data";

/**
 * Tovární funkce – převede surová data z číselníku na instance tříd.
 * Podle pole "type" rozhodne zda vytvořit SpotPosition nebo FuturesPosition.
 */
function createPosition(data: PositionData): TradePosition {
  if (data.type === "spot") {
    return new SpotPosition(
      data.symbol,
      data.entryPrice,
      data.quantity,
      data.direction,
      data.stopLoss,
      data.takeProfit
    );
  } else {
    return new FuturesPosition(
      data.symbol,
      data.entryPrice,
      data.quantity,
      data.direction,
      data.leverage,
      data.marginUsed
    );
  }
}

// Simulované aktuální tržní ceny
const currentPrices: Record<string, number> = {
  "EURUSD":  1.0892,
  "GOLD":    1875,
  "AAPL":    193.20,
  "BTC/USD": 66800,
  "ETH/USD": 3050,
  "NQ/USD":  19850,
};

// Oživení dat z číselníku do pole instancí tříd
const portfolio: TradePosition[] = positionsData.map(createPosition);

// =============================================================================
// VÝPIS DO KONZOLE – POLYMORFNÍ ITERACE
// =============================================================================

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║           TRADETRACKER – REPORT PORTFOLIA                   ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log();

let totalPnL   = 0;
let totalValue = 0;
let spotCount  = 0;
let futCount   = 0;

/**
 * Polymorfní průchod portfoliem.
 * Voláme getPnL() a getSummary() na TradePosition[] –
 * runtime automaticky vybere správnou implementaci (Spot nebo Futures).
 */
for (const position of portfolio) {
  const price  = currentPrices[position.symbol];
  const pnl    = position.getPnL(price);
  const val    = position.getPositionValue();

  totalPnL   += pnl;
  totalValue += val;

  const type   = position instanceof SpotPosition ? "SPOT   " : "FUTURES";
  const pnlStr = (pnl >= 0 ? "+" : "") + pnl.toFixed(2);
  const icon   = pnl >= 0 ? "✅" : "🔴";

  console.log(`─────────────────────────────────────────────────────────────`);
  console.log(`📊 ${type} | ${position.getSummary()}`);
  console.log(`   Aktuální cena: ${price} | P&L: ${icon} ${pnlStr}`);

  if (position instanceof SpotPosition) {
    spotCount++;
    console.log(`   SL: ${position.getStopLoss()} | TP: ${position.getTakeProfit()} | R:R = 1:${position.getRiskReward()}`);
  } else if (position instanceof FuturesPosition) {
    futCount++;
    const risk = position.getLiquidationRisk(price);
    console.log(`   Páka: ${position.getLeverage()}× | Marže: $${position.getMarginUsed()} | Likvidace: ${position.getLiquidationPrice()} | Riziko: ${risk}`);
  }
}

// Souhrnný report
console.log(`═════════════════════════════════════════════════════════════`);
console.log();
console.log("📋 SOUHRN PORTFOLIA:");
console.log(`   Celkem pozic:    ${portfolio.length} (${spotCount}× spot, ${futCount}× futures)`);
console.log(`   Celková hodnota: $${totalValue.toFixed(2)}`);
console.log(`   Celkový P&L:     ${totalPnL >= 0 ? "✅ +" : "🔴 "}${totalPnL.toFixed(2)}`);
console.log();

// =============================================================================
// TEST VALIDACE
// =============================================================================

console.log(`═════════════════════════════════════════════════════════════`);
console.log("🔒 TEST VALIDACE – záměrně chybné vstupy:");
console.log();

import { Direction } from "./TradePosition";

const validationTests = [
  () => new SpotPosition("", 1.085, 1000, Direction.LONG, 1.08, 1.09),
  () => new SpotPosition("EURUSD", -5, 1000, Direction.LONG, 1.08, 1.09),
  () => new SpotPosition("EURUSD", 1.085, 0, Direction.LONG, 1.08, 1.09),
  () => new FuturesPosition("BTC/USD", 65000, 0.1, Direction.LONG, 0, 650),
];

const testLabels = [
  "Prázdný symbol",
  "Záporná vstupní cena",
  "Nulový objem",
  "Páka 0×",
];

validationTests.forEach((test, i) => {
  try {
    test();
    console.log(`   ❌ Test '${testLabels[i]}': chyba NEBYLA zachycena`);
  } catch (e) {
    console.log(`   ✅ Test '${testLabels[i]}': OK → ${(e as Error).message}`);
  }
});

console.log();
console.log(`═════════════════════════════════════════════════════════════`);