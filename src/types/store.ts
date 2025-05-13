
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sale_url?: string;        // Optional field
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  category_id?: string | null;     // Optional field
  categories?: {            // Optional field
    name: string;
  } | null;                 // Allow null for when relation fails
}

export interface ProductCategory {
  id: string;
  name: string;
  created_at: string | null;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image_url: string;
  sale_url: string;
  category_id: string | null;
  is_active: boolean;
}
