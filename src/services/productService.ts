import axios from 'axios';
import { Product, ProductsApiResponse } from '../types/Product';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://34.61.215.100:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get<ProductsApiResponse>('/products');

      // Nova API retorna { products: [...] } diretamente
      return response.data.products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async getProductById(id: string): Promise<Product> {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  static async getProductByName(name: string): Promise<Product> {
    try {
      const response = await api.get<Product>(`/products-name/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product by name "${name}":`, error);
      throw error;
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      // Como a nova API não tem endpoint de busca,
      // vamos buscar todos e filtrar localmente
      const products = await this.getAllProducts();
      const lowercaseQuery = query.toLowerCase();

      return products.filter(product =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.categories.some(cat => cat.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error(`Error searching products with query "${query}":`, error);
      throw error;
    }
  }
}

export default ProductService;
