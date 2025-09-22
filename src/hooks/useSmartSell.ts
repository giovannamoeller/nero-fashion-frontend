import { useState, useCallback } from 'react';
import { SmartSellService, SmartSellRequest, SmartSellResponse } from '../services/smartSellService';

interface UseSmartSellReturn {
  isLoading: boolean;
  error: string | null;
  result: SmartSellResponse | null;
  getRecommendation: (params: SmartSellRequest) => Promise<void>;
  reset: () => void;
  copyRecommendation: () => Promise<boolean>;
}

export const useSmartSell = (): UseSmartSellReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmartSellResponse | null>(null);

  const getRecommendation = useCallback(async (params: SmartSellRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await SmartSellService.getProductRecommendation(params);
      setResult(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get product recommendation';
      setError(errorMessage);
      console.error('Smart sell error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const copyRecommendation = useCallback(async (): Promise<boolean> => {
    if (!result?.sell_text) return false;

    try {
      await navigator.clipboard.writeText(result.sell_text);
      return true;
    } catch (err) {
      console.error('Failed to copy recommendation:', err);
      return false;
    }
  }, [result?.sell_text]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    getRecommendation,
    reset,
    copyRecommendation,
  };
};
