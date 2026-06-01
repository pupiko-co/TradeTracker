import { TradePosition, Direction } from "./TradePosition";
import { SpotPosition } from "./SpotPosition";
import { FuturesPosition } from "./FuturesPosition";

// Pole všech pozic v portfoliu
let portfolio: { position: TradePosition; currentPrice: number }[] = [];

// === POMOCNÉ FUNKCE ===

// Aktualizuje souhrnné karty nahoře
function updateSummary(): void {
  let totalValue = 0;
  let totalPnL = 0;

  for (const item of portfolio) {
    totalValue += item.position.getPositionValue();
    totalPnL += item.position.getPnL(item.currentPrice);
  }

  document.getElementById("total-count")!.textContent = String(portfolio.length);
  document.getElementById("total-value")!.textContent = `$${totalValue.toFixed(2)}`;

  const pnlEl = document.getElementById("total-pnl")!;
  pnlEl.textContent = `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`;
  pnlEl.className = "summary-value " + (totalPnL >= 0 ? "pnl-positive" : "pnl-negative");
}

// Překreslí celou tabulku pozic
function renderTable(): void {
  const tbody = document.getElementById("positions-tbody")!;
  tbody.innerHTML = "";

  if (portfolio.length === 0) {
    tbody.innerHTML = `<tr id="empty-row"><td colspan="9" class="empty">Zatím žádné pozice. Přidej první!</td></tr>`;
    return;
  }

  for (let i = 0; i < portfolio.length; i++) {
    const { position, currentPrice } = portfolio[i];
    const pnl = position.getPnL(currentPrice);
    const pnlStr = `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`;
    const pnlClass = pnl >= 0 ? "pnl-positive" : "pnl-negative";

    const isSpot = position instanceof SpotPosition;
    const typeBadge = isSpot
      ? `<span class="badge badge-spot">SPOT</span>`
      : `<span class="badge badge-futures">FUTURES</span>`;

    const dirClass = position["direction"] === Direction.LONG ? "badge-long" : "badge-short";
    const dirBadge = `<span class="badge ${dirClass}">${position["direction"]}</span>`;

    // Extra info podle typu
    let info = "";
    if (position instanceof SpotPosition) {
      info = `R:R 1:${position.getRiskReward()}`;
    } else if (position instanceof FuturesPosition) {
      const risk = position.getLiquidationRisk(currentPrice);
      const riskClass = risk.startsWith("LOW") ? "risk-low" : risk.startsWith("MED") ? "risk-medium" : "risk-high";
      info = `Páka: ${position.getLeverage()}× | Liq: ${position.getLiquidationPrice()} | Riziko: <span class="${riskClass}">${risk}</span>`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="Typ">${typeBadge}</td>
      <td data-label="Symbol"><strong>${position.symbol}</strong></td>
      <td data-label="Směr">${dirBadge}</td>
      <td data-label="Vstup">$${position["entryPrice"]}</td>
      <td data-label="Objem">${position["quantity"]}</td>
      <td data-label="Akt. cena">$${currentPrice}</td>
      <td data-label="P&L" class="${pnlClass}">${pnlStr}</td>
      <td data-label="Info">${info}</td>
      <td data-label="Akce"><button class="delete-btn" data-index="${i}">Smazat</button></td>
    `;
    tbody.appendChild(tr);
  }

  // Přidání event listenerů na tlačítka smazat
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt((e.target as HTMLElement).dataset.index!);
      portfolio.splice(index, 1);
      renderTable();
      updateSummary();
    });
  });
}

// === PŘEPÍNÁNÍ POLÍ FORMULÁŘE ===
const typeSelect = document.getElementById("type") as HTMLSelectElement;
typeSelect.addEventListener("change", () => {
  const isSpot = typeSelect.value === "spot";
  document.getElementById("spot-fields")!.classList.toggle("hidden", !isSpot);
  document.getElementById("futures-fields")!.classList.toggle("hidden", isSpot);
});

// === PŘIDÁNÍ POZICE ===
document.getElementById("add-btn")!.addEventListener("click", () => {
  const errorEl = document.getElementById("error-msg")!;
  errorEl.classList.add("hidden");
  errorEl.textContent = "";

  const type         = (document.getElementById("type") as HTMLSelectElement).value;
  const symbol       = (document.getElementById("symbol") as HTMLInputElement).value;
  const dirVal       = (document.getElementById("direction") as HTMLSelectElement).value;
  const entryPrice   = parseFloat((document.getElementById("entryPrice") as HTMLInputElement).value);
  const quantity     = parseFloat((document.getElementById("quantity") as HTMLInputElement).value);
  const currentPrice = parseFloat((document.getElementById("currentPrice") as HTMLInputElement).value);
  const direction    = dirVal === "LONG" ? Direction.LONG : Direction.SHORT;

  try {
    let position: TradePosition;

    if (type === "spot") {
      const stopLoss   = parseFloat((document.getElementById("stopLoss") as HTMLInputElement).value);
      const takeProfit = parseFloat((document.getElementById("takeProfit") as HTMLInputElement).value);
      position = new SpotPosition(symbol, entryPrice, quantity, direction, stopLoss, takeProfit);
    } else {
      const leverage   = parseFloat((document.getElementById("leverage") as HTMLInputElement).value);
      const marginUsed = parseFloat((document.getElementById("marginUsed") as HTMLInputElement).value);
      position = new FuturesPosition(symbol, entryPrice, quantity, direction, leverage, marginUsed);
    }

    if (isNaN(currentPrice) || currentPrice <= 0) {
      throw new Error("Aktuální cena musí být kladné číslo.");
    }

    portfolio.push({ position, currentPrice });
    renderTable();
    updateSummary();

    // Reset formuláře
    (document.getElementById("symbol") as HTMLInputElement).value = "";
    (document.getElementById("entryPrice") as HTMLInputElement).value = "";
    (document.getElementById("quantity") as HTMLInputElement).value = "";
    (document.getElementById("currentPrice") as HTMLInputElement).value = "";
    (document.getElementById("stopLoss") as HTMLInputElement).value = "";
    (document.getElementById("takeProfit") as HTMLInputElement).value = "";
    (document.getElementById("leverage") as HTMLInputElement).value = "";
    (document.getElementById("marginUsed") as HTMLInputElement).value = "";

  } catch (e) {
    errorEl.textContent = (e as Error).message;
    errorEl.classList.remove("hidden");
  }
});

// === INICIALIZACE ===
renderTable();
updateSummary();