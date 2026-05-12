// Výčtový typ pro směr obchodu
// LONG = spekulace na růst ceny, SHORT = spekulace na pokles
export enum Direction {
  LONG = "LONG",
  SHORT = "SHORT",
}

/**
 * Abstraktní bázová třída pro všechny typy obchodních pozic.
 * Definuje společné vlastnosti a předepisuje abstraktní metodu getPnL(),
 * kterou musí každý potomek implementovat vlastní logikou.
 */
export abstract class TradePosition {
  // public readonly - viditelné odkudkoli, nelze změnit po vytvoření
  public readonly symbol: string;

  // protected - přístupné jen uvnitř třídy a jejích potomků
  protected entryPrice: number;
  protected quantity: number;
  protected direction: Direction;

  // private - přístupné jen uvnitř této třídy
  private openedAt: Date;

  constructor(
    symbol: string,
    entryPrice: number,
    quantity: number,
    direction: Direction
  ) {
    // Validace dat - objekt nelze vytvořit s chybnými hodnotami
    if (!symbol || symbol.trim() === "") {
      throw new Error("Symbol nesmí být prázdný řetězec.");
    }
    if (entryPrice <= 0) {
      throw new Error(`Vstupní cena musí být kladné číslo (zadáno: ${entryPrice}).`);
    }
    if (quantity <= 0) {
      throw new Error(`Objem pozice musí být kladné číslo (zadáno: ${quantity}).`);
    }

    this.symbol = symbol.trim().toUpperCase();
    this.entryPrice = entryPrice;
    this.quantity = quantity;
    this.direction = direction;
    this.openedAt = new Date();
  }

  // Vrátí celkovou hodnotu pozice při vstupu
  public getPositionValue(): number {
    return this.entryPrice * this.quantity;
  }

  // Getter pro datum otevření pozice
  public getOpenedAt(): Date {
    return this.openedAt;
  }

  // Abstraktní metoda - každý potomek musí implementovat vlastní výpočet P&L
  public abstract getPnL(currentPrice: number): number;

  // Základní textový souhrn pozice
  public getSummary(): string {
    return `[${this.symbol}] ${this.direction} | Vstup: ${this.entryPrice} | Objem: ${this.quantity}`;
  }
}