import { TradePosition, Direction } from "./TradePosition";

/**
 * Konkrétní třída pro spotové (přímé) obchodní pozice.
 * Obchodník vlastní aktivum přímo – maximální ztráta je omezena investicí.
 * Rozšiřuje bázovou třídu o stop-loss, take-profit a výpočet Risk:Reward.
 */
export class SpotPosition extends TradePosition {
  // private - přístupné jen uvnitř této třídy
  private stopLoss: number;
  private takeProfit: number;

  constructor(
    symbol: string,
    entryPrice: number,
    quantity: number,
    direction: Direction,
    stopLoss: number,
    takeProfit: number
  ) {
    // Zavolá konstruktor rodičovské třídy TradePosition
    super(symbol, entryPrice, quantity, direction);

    // Validace stop-loss a take-profit
    if (stopLoss <= 0) {
      throw new Error("Stop-loss musí být kladné číslo.");
    }
    if (takeProfit <= 0) {
      throw new Error("Take-profit musí být kladné číslo.");
    }
    if (direction === Direction.LONG && stopLoss >= entryPrice) {
      throw new Error("Pro LONG pozici musí být stop-loss pod vstupní cenou.");
    }
    if (direction === Direction.LONG && takeProfit <= entryPrice) {
      throw new Error("Pro LONG pozici musí být take-profit nad vstupní cenou.");
    }
    if (direction === Direction.SHORT && stopLoss <= entryPrice) {
      throw new Error("Pro SHORT pozici musí být stop-loss nad vstupní cenou.");
    }
    if (direction === Direction.SHORT && takeProfit >= entryPrice) {
      throw new Error("Pro SHORT pozici musí být take-profit pod vstupní cenou.");
    }

    this.stopLoss = stopLoss;
    this.takeProfit = takeProfit;
  }

  /**
   * Výpočet P&L pro spotovou pozici.
   * Vzorec: (aktuální cena - vstupní cena) × objem × směr
   */
  public getPnL(currentPrice: number): number {
    if (currentPrice <= 0) throw new Error("Aktuální cena musí být kladná.");
    const multiplier = this.direction === Direction.LONG ? 1 : -1;
    return (currentPrice - this.entryPrice) * this.quantity * multiplier;
  }

  /**
   * Vrátí poměr riziko:odměna (Risk:Reward ratio).
   * Hodnota 2 znamená že potenciální zisk je 2× větší než riziko.
   */
  public getRiskReward(): number {
    const risk = Math.abs(this.entryPrice - this.stopLoss);
    const reward = Math.abs(this.takeProfit - this.entryPrice);
    if (risk === 0) return Infinity;
    return parseFloat((reward / risk).toFixed(2));
  }

  // Getter pro stop-loss
  public getStopLoss(): number {
    return this.stopLoss;
  }

  // Getter pro take-profit
  public getTakeProfit(): number {
    return this.takeProfit;
  }

  // Přepis getSummary() - přidává SL, TP a R:R poměr
  public override getSummary(): string {
    return (
      super.getSummary() +
      ` | SL: ${this.stopLoss} | TP: ${this.takeProfit} | R:R = 1:${this.getRiskReward()}`
    );
  }
}