import { TradePosition, Direction } from "./TradePosition";

/**
 * Konkrétní třída pro futures (páková) pozice.
 * Obchodník nevlastní aktivum přímo – skládá marži a ovládá větší pozici pákou.
 * Specifickým rizikem je likvidace: pokud cena dosáhne liquidationPrice,
 * broker automaticky uzavírá pozici.
 */
export class FuturesPosition extends TradePosition {
  // private - přístupné jen uvnitř této třídy
  private leverage: number;
  private marginUsed: number;
  private liquidationPrice: number;

  constructor(
    symbol: string,
    entryPrice: number,
    quantity: number,
    direction: Direction,
    leverage: number,
    marginUsed: number
  ) {
    // Zavolá konstruktor rodičovské třídy TradePosition
    super(symbol, entryPrice, quantity, direction);

    // Validace páky a marže
    if (leverage < 1) {
      throw new Error(`Páka musí být minimálně 1× (zadáno: ${leverage}).`);
    }
    if (marginUsed <= 0) {
      throw new Error("Výše marže musí být kladné číslo.");
    }

    this.leverage = leverage;
    this.marginUsed = marginUsed;

    // Výpočet likvidační ceny
    // LONG: likvidace když cena klesne o (vstup / páka × 0.9)
    // SHORT: likvidace když cena vzroste o (vstup / páka × 0.9)
    const liqFactor = (1 / leverage) * 0.9;
    this.liquidationPrice =
      direction === Direction.LONG
        ? parseFloat((entryPrice * (1 - liqFactor)).toFixed(2))
        : parseFloat((entryPrice * (1 + liqFactor)).toFixed(2));
  }

  /**
   * Výpočet P&L pro futures pozici S PÁKOU.
   * Vzorec: (aktuální cena - vstupní cena) × objem × páka × směr
   * Páka zesiluje jak zisky, tak ztráty.
   */
  public getPnL(currentPrice: number): number {
    if (currentPrice <= 0) throw new Error("Aktuální cena musí být kladná.");
    const multiplier = this.direction === Direction.LONG ? 1 : -1;
    return (currentPrice - this.entryPrice) * this.quantity * this.leverage * multiplier;
  }

  /**
   * Vyhodnotí riziko likvidace podle vzdálenosti aktuální ceny od likvidační úrovně.
   * @returns "LOW" | "MEDIUM" | "HIGH"
   */
  public getLiquidationRisk(currentPrice: number): string {
    const distancePct =
      (Math.abs(currentPrice - this.liquidationPrice) / currentPrice) * 100;
    if (distancePct > 15) return "LOW";
    if (distancePct > 5) return "MEDIUM";
    return "HIGH ⚠️";
  }

  // Getter pro páku
  public getLeverage(): number {
    return this.leverage;
  }

  // Getter pro použitou marži
  public getMarginUsed(): number {
    return this.marginUsed;
  }

  // Getter pro likvidační cenu
  public getLiquidationPrice(): number {
    return this.liquidationPrice;
  }

  // Přepis getSummary() - přidává páku, marži a likvidační cenu
  public override getSummary(): string {
    return (
      super.getSummary() +
      ` | Páka: ${this.leverage}× | Marže: $${this.marginUsed} | Likvidace: ${this.liquidationPrice}`
    );
  }
}