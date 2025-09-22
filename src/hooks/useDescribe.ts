import { useState, useCallback } from 'react';
import { DescribeService, DescribeRequest, DescribeResponse, DescribeType } from '../services/describeService';

export interface DescribeState {
  isLoading: boolean;
  error: string | null;
  result: DescribeResponse | null;
  altText: string | null;
}

export const useDescribe = () => {
  const [state, setState] = useState<DescribeState>({
    isLoading: false,
    error: null,
    result: null,
    altText: null,
  });

  const describeImage = useCallback(async (request: DescribeRequest) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      result: null,
      altText: null,
    }));

    try {
      const result = await DescribeService.describeImage(request);
      const altText = DescribeService.generateAltText(
        result.description,
        request.type_prompt || 'product'
      );

      setState({
        isLoading: false,
        error: null,
        result,
        altText,
      });

      return { result, altText };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to describe image';

      setState({
        isLoading: false,
        error: errorMessage,
        result: null,
        altText: null,
      });

      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      result: null,
      altText: null,
    });
  }, []);

  const copyDescription = useCallback(async () => {
    if (state.result?.description) {
      const success = await DescribeService.copyToClipboard(state.result.description);
      return success;
    }
    return false;
  }, [state.result]);

  const copyAltText = useCallback(async () => {
    if (state.altText) {
      const success = await DescribeService.copyToClipboard(state.altText);
      return success;
    }
    return false;
  }, [state.altText]);

  return {
    ...state,
    describeImage,
    reset,
    copyDescription,
    copyAltText,
  };
};
