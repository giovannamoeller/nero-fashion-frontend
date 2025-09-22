import axios from 'axios';

// Detecta se está em produção (Vercel) ou desenvolvimento
const getApiBaseUrl = () => {
  // Se está em produção (Vercel), usa proxy relativo
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  // Se está em desenvolvimento, usa a URL direta
  return import.meta.env.VITE_API_BASE_URL || 'http://34.61.215.100:8080';
};

const API_BASE_URL = getApiBaseUrl();

export interface SmartSellRequest {
  image: File;
  text: string;
  model_name?: string;
  stream?: boolean;
}

export interface SmartSellResponse {
  image_id: string;
  sell_text: string;
  image_base64: string;
  product_id: string;
  product_name: string;
}

export class SmartSellService {
  static async getProductRecommendation(params: SmartSellRequest): Promise<SmartSellResponse> {
    const formData = new FormData();
    formData.append('image', params.image);
    formData.append('text', params.text);
    formData.append('model_name', params.model_name || 'gemini-1.5-pro');
    formData.append('stream', (params.stream || false).toString());

    const response = await axios.post(`${API_BASE_URL}/sell-product-from-query`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}
