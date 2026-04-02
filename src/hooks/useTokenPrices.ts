import { useState, useEffect, useCallback } from 'react';

const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  MATIC: 'matic-network',
  BNB: 'binancecoin',
};

interface PriceData {
  usd: number;
  usd_24h_change: number;
}

export function useTokenPrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    const ids = symbols
      .map(s => COINGECKO_IDS[s.toUpperCase()])
      .filter(Boolean)
      .join(',');

    if (!ids) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      );
      if (!res.ok) throw new Error('Price fetch failed');
      const data = await res.json();

      const mapped: Record<string, PriceData> = {};
      symbols.forEach(symbol => {
        const geckoId = COINGECKO_IDS[symbol.toUpperCase()];
        if (geckoId && data[geckoId]) {
          mapped[symbol.toUpperCase()] = {
            usd: data[geckoId].usd,
            usd_24h_change: data[geckoId].usd_24h_change ?? 0,
          };
        }
      });
      setPrices(mapped);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  function getUsdValue(symbol: string, balance: string): string {
    const price = prices[symbol.toUpperCase()];
    if (!price) return '—';
    const val = price.usd * parseFloat(balance);
    if (isNaN(val)) return '—';
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return { prices, isLoading, error, refetch: fetchPrices, getUsdValue };
}
