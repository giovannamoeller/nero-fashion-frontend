import { useState, useCallback } from 'react';
import { FashionService, FashionAssistantResponse } from '../services/fashionService';

interface UseFashionReturn {
  isLoading: boolean;
  error: string | null;
  result: FashionAssistantResponse | null;
  getFashionAdvice: (params: { image: File }) => Promise<void>;
  reset: () => void;
}

export const useFashion = (): UseFashionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FashionAssistantResponse | null>(null);

  const getFashionAdvice = useCallback(async ({ image }: { image: File }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await FashionService.getFashionAdvice(image);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get fashion advice');
      console.error('Fashion advice error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    getFashionAdvice,
    reset,
  };
};
