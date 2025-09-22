import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://34.61.215.100:8080';

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
