const API_KEY = "d7aun6hr01qtpbh9sqlgd7aun6hr01qtpbh9sqm0";
const BASE = "https://finnhub.io/api/v1";

export interface SearchResult {
  symbol: string;
  description: string;
  type: string;
}

export interface Quote {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
}

export async function searchSymbol(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];
  try {
    const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}&token=${API_KEY}`);
    const data = await res.json();
    return (data.result || []).slice(0, 12);
  } catch {
    return [];
  }
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  try {
    const res = await fetch(`${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`);
    const data = await res.json();
    return data.c ? data : null;
  } catch {
    return null;
  }
}

// Popular defaults to show before search
export const POPULAR = [
  { symbol: "VOO", description: "Vanguard S&P 500 ETF" },
  { symbol: "AAPL", description: "Apple Inc." },
  { symbol: "NVDA", description: "Nvidia Corp" },
  { symbol: "VTI", description: "Vanguard Total Stock Market ETF" },
  { symbol: "TSLA", description: "Tesla, Inc." },
  { symbol: "BTC-USD", description: "Bitcoin" },
  { symbol: "ETH-USD", description: "Ethereum" },
  { symbol: "VEA", description: "Vanguard FTSE Developed Markets ETF" },
  { symbol: "VWO", description: "Vanguard FTSE Emerging Markets ETF" },
];
