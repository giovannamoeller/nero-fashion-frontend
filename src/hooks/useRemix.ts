import { useState, useCallback } from 'react';
import { RemixService, RemixRequest } from '../services/remixService';

export interface RemixState {
  isLoading: boolean;
  error: string | null;
  result: Blob | null;
  resultUrl: string | null;
}

export const useRemix = () => {
  const [state, setState] = useState<RemixState>({
    isLoading: false,
    error: null,
    result: null,
    resultUrl: null,
  });

  const remixImages = useCallback(async (request: RemixRequest) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      result: null,
      resultUrl: null,
    }));

    try {
      const result = await RemixService.remixImages(request);
      const resultUrl = RemixService.createResultUrl(result);

      setState({
        isLoading: false,
        error: null,
        result,
        resultUrl,
      });

      return { result, resultUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remix images';

      setState({
        isLoading: false,
        error: errorMessage,
        result: null,
        resultUrl: null,
      });

      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    // Limpar URL anterior se existir
    if (state.resultUrl) {
      RemixService.revokePreviewUrl(state.resultUrl);
    }

    setState({
      isLoading: false,
      error: null,
      result: null,
      resultUrl: null,
    });
  }, [state.resultUrl]);

  const downloadResult = useCallback((filename?: string) => {
    if (state.result) {
      RemixService.downloadImage(state.result, filename);
    }
  }, [state.result]);

  return {
    ...state,
    remixImages,
    reset,
    downloadResult,
  };
};
