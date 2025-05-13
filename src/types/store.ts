
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sale_url?: string;        // Make optional with ?
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_id?: string;     // Make optional with ?
  categories?: {            // Make optional with ?
    name: string;
  } | null;                 // Allow null for when relation fails
}

export interface ProductCategory {
  id: string;
  name: string;
  created_at: string;
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
