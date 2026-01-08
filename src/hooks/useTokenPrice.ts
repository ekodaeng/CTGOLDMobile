import { useState, useEffect } from 'react';

const CTGOLD_MINT = '3HDPgNPPZRZqvdyuiCNVPUSwCAFeJ6xPJH2VaLXEpump';
const JUPITER_API_URL = `https://api.jup.ag/price/v2?ids=${CTGOLD_MINT}`;
const FALLBACK_PRICE = 0.005;

export const useTokenPrice = () => {
  const [price, setPrice] = useState(FALLBACK_PRICE);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  const fetchPrice = async () => {
    try {
      const response = await fetch(JUPITER_API_URL);
      const result = await response.json();

      const tokenData = result?.data?.[CTGOLD_MINT];

      if (tokenData && tokenData.price) {
        setPrice(parseFloat(tokenData.price));
        setIsFallback(false);
      } else {
        throw new Error("No price data found");
      }
    } catch (error) {
      console.warn("Gagal mengambil harga Jupiter, menggunakan Fallback:", error);
      setPrice(FALLBACK_PRICE);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();

    const intervalId = setInterval(fetchPrice, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return { price, loading, isFallback, refresh: fetchPrice };
};
