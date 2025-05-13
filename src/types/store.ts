
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  sale_url: string; // Link externo para onde o usuário será direcionado
  category_id: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  image_url: string;
  sale_url: string;
  category_id: string | null;
  is_featured: boolean;
}
