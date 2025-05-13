
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminStore } from '@/hooks/useAdminStore';
import ProductForm from '@/components/admin/ProductForm';
import { ProductFormData } from '@/types/store';
import { Product } from '@/types/store';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    fetchProduct, 
    updateProduct, 
    isUpdating, 
    categories, 
    isLoadingCategories 
  } = useAdminStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('ID do produto não fornecido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchProduct(id);
        setProduct(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError('Não foi possível carregar o produto');
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, fetchProduct]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!id) return;
    
    await updateProduct({
      id,
      ...data
    });
    
    navigate('/admin/products');
  };

  if (isLoading || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 bg-card rounded-lg border border-border text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">
          Erro ao carregar produto
        </h2>
        <p className="text-muted-foreground mb-4">{error || 'Produto não encontrado'}</p>
        <button 
          onClick={() => navigate('/admin/products')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Voltar
        </button>
      </div>
    );
  }

  const formData: ProductFormData = {
    title: product.title,
    description: product.description,
    price: product.price,
    image_url: product.image_url,
    sale_url: product.sale_url,
    category_id: product.category_id,
    is_featured: product.is_featured,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-muted rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Editar Produto</h1>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6">
        <ProductForm 
          onSubmit={handleSubmit} 
          isLoading={isUpdating}
          defaultValues={formData}
          categories={categories}
          isEditing={true}
        />
      </div>
    </div>
  );
};

export default EditProduct;
