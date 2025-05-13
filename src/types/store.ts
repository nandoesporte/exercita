
export interface Product {
  id: string;
  name: string;             // Changed from title
  description: string;
  price: number;
  image_url: string;
  sale_url: string;         // Added field for external sales URL
  is_active: boolean;       // Changed from is_featured
  created_at: string;
  updated_at: string;
  category_id?: string;     // Made optional
  categories?: {            // Added for join queries
    name: string;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface ProductFormData {
  name: string;             // Changed from title
  description: string;
  price: number;
  image_url: string;
  sale_url: string;
  category_id: string | null;
  is_active: boolean;       // Changed from is_featured
}
