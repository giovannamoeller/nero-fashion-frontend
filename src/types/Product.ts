export interface Product {
  id: string;
  name: string;
  description: string;
  picture: string;
  price: string;  // Now it's a simple string
  categories: string[];
}

// New API structure
export interface ProductsApiResponse {
  products: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  query?: string;
  error?: string;
}
