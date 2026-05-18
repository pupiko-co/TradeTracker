import { Direction } from "./TradePosition";

/**
 * Datový číselník – obsahuje surová data oddělená od logiky.
 * Hlavní soubor (index.ts) tato data "oživí" do instancí tříd.
 */

// Typ pro data spotové pozice
export interface SpotData {
  type: "spot";
  symbol: string;
  entryPrice: number;
  quantity: number;
  direction: Direction;
  stopLoss: number;
  takeProfit: number;
}

// Typ pro data futures pozice
export interface FuturesData {
  type: "futures";
  symbol: string;
  entryPrice: number;
  quantity: number;
  direction: Direction;
  leverage: number;
  marginUsed: number;
}

// Sjednocený typ pro číselník
export type PositionData = SpotData | FuturesData;

/**
 * Pole surových dat – simuluje načtení z databáze nebo API.
 * Tato data neobsahují žádnou logiku, pouze hodnoty.
 */
export const positionsData: PositionData[] = [
  // Spotové pozice
  {
    type: "spot",
    symbol: "EURUSD",
    entryPrice: 1.0850,
    quantity: 10000,
    direction: Direction.LONG,
    stopLoss: 1.0800,
    takeProfit: 1.0950,
  },
  {
    type: "spot",
    symbol: "GOLD",
    entryPrice: 1900,
    quantity: 2,
    direction: Direction.SHORT,
    stopLoss: 1950,
    takeProfit: 1820,
  },
  {
    type: "spot",
    symbol: "AAPL",
    entryPrice: 185.50,
    quantity: 50,
    direction: Direction.LONG,
    stopLoss: 180.00,
    takeProfit: 200.00,
  },

  // Futures pozice
  {
    type: "futures",
    symbol: "BTC/USD",
    entryPrice: 65000,
    quantity: 0.1,
    direction: Direction.LONG,
    leverage: 10,
    marginUsed: 650,
  },
  {
    type: "futures",
    symbol: "ETH/USD",
    entryPrice: 3200,
    quantity: 1,
    direction: Direction.SHORT,
    leverage: 5,
    marginUsed: 640,
  },
  {
    type: "futures",
    symbol: "NQ/USD",
    entryPrice: 19500,
    quantity: 0.5,
    direction: Direction.LONG,
    leverage: 20,
    marginUsed: 487.5,
  },
];