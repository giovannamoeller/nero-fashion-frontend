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

export interface FashionAssistantResponse {
  image_id: string;
  description: string;
}

export class FashionService {
  static async getFashionAdvice(image: File): Promise<FashionAssistantResponse> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await axios.post(`${API_BASE_URL}/assistant-fashion`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}
