import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://34.61.215.100:8080';

export interface RemixRequest {
  image1: File;  // Imagem do usuário
  image2: File;  // Imagem do produto
  prompt: string;
  stream?: boolean;
}

export class RemixService {
  static async remixImages(request: RemixRequest): Promise<Blob> {
    try {
      const formData = new FormData();

      // Adicionar imagens
      formData.append('image1', request.image1);
      formData.append('image2', request.image2);

      // Adicionar dados
      formData.append('prompt', request.prompt);
      formData.append('stream', String(request.stream || false));

      console.log(`🎨 Starting image remix with prompt: "${request.prompt}"`);

      const response = await axios.post('/remix-images', formData, {
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Importante: receber como blob para imagens
        timeout: 60000, // 60 segundos timeout para AI processing
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📤 Upload progress: ${percentCompleted}%`);
          }
        },
      });

      console.log('✅ Image remix completed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error during image remix:', error);
      throw error;
    }
  }

  // Função auxiliar para converter File para URL local (preview)
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Função auxiliar para limpar URLs de preview
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  // Função auxiliar para converter Blob para URL para exibir resultado
  static createResultUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  // Função auxiliar para download da imagem
  static downloadImage(blob: Blob, filename: string = 'remixed-image.png'): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default RemixService;
