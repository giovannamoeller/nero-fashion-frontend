import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://34.61.215.100:8080';

export type DescribeType = 'product' | 'person';

export interface DescribeRequest {
  image: File;
  type_prompt?: DescribeType;
}

export interface DescribeResponse {
  image_id: string;
  description: string;
}

export class DescribeService {
  static async describeImage(request: DescribeRequest): Promise<DescribeResponse> {
    try {
      const formData = new FormData();

      // Adicionar imagem
      formData.append('image', request.image);

      console.log(`🔍 Starting image description with type: "${request.type_prompt || 'product'}"`);

      const response = await axios.post('/describe-image', formData, {
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          type_prompt: request.type_prompt || 'product'
        },
        timeout: 30000, // 30 segundos timeout para AI processing
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📤 Upload progress: ${percentCompleted}%`);
          }
        },
      });

      console.log('✅ Image description completed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error during image description:', error);
      throw error;
    }
  }

  // Função auxiliar para criar preview da imagem
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Função auxiliar para limpar URLs de preview
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  // Função auxiliar para validar tipo de arquivo
  static validateImageFile(file: File): string | null {
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file.';
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'File size must be less than 10MB.';
    }

    return null;
  }

  // Função auxiliar para copiar descrição para clipboard
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  // Função auxiliar para gerar sugestões de alt text baseado na descrição
  static generateAltText(description: string, type: DescribeType): string {
    // Simplificar a descrição para um alt text mais conciso
    const sentences = description.split('.').filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || description;

    // Limitar a 125 caracteres (recomendação para alt text)
    if (firstSentence.length <= 125) {
      return firstSentence;
    }

    return firstSentence.substring(0, 122) + '...';
  }
}

export default DescribeService;
