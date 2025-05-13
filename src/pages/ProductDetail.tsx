
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/useStore';
import { formatCurrency } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Product } from '@/types/store';
import { toast } from '@/components/ui/use-toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchProduct } = useStore();
  
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

  const handleBackClick = () => {
    navigate('/store');
  };

  const handleBuyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!product?.sale_url) {
      e.preventDefault();
      toast({
        title: "Link de compra não disponível",
        description: "Este produto não possui um link de compra configurado.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-fitness-green"></div>
        <p className="mt-4 text-muted-foreground">Carregando produto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-destructive mb-2">Ops, algo deu errado!</h2>
        <p className="text-muted-foreground mb-6">{error || 'Produto não encontrado'}</p>
        <Button onClick={handleBackClick} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar à Loja
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botão Voltar */}
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 p-2 -ml-2"
        onClick={handleBackClick}
      >
        <ArrowLeft size={20} />
        <span>Voltar à Loja</span>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagem do produto */}
        <div className="rounded-lg overflow-hidden border border-fitness-darkGray/30">
          <AspectRatio ratio={1}>
            <img 
              src={product.image_url || '/placeholder.svg'} 
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
        </div>

        {/* Detalhes do produto */}
        <div className="space-y-6">
          {/* Tag de destaque */}
          {product.is_active && (
            <div className="inline-block bg-fitness-green text-white text-xs font-medium px-3 py-1 rounded-full">
              Produto Em Estoque
            </div>
          )}

          {/* Título */}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          {/* Preço */}
          <div className="text-3xl font-bold text-fitness-green">
            {formatCurrency(product.price)}
          </div>
          
          {/* Categoria */}
          {product.categories && (
            <div className="text-sm">
              <span className="text-muted-foreground">Categoria: </span>
              <span className="font-medium">{product.categories.name}</span>
            </div>
          )}
          
          {/* Descrição */}
          <div className="border-t border-fitness-darkGray/30 pt-4">
            <h3 className="text-lg font-semibold mb-2">Descrição do Produto</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          </div>
          
          {/* Botões de ação */}
          <div className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                size="lg"
                className="flex-1 bg-fitness-green hover:bg-fitness-green/80 text-white"
                disabled={!product.sale_url}
              >
                <a 
                  href={product.sale_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={handleBuyClick}
                  className="flex items-center justify-center gap-2"
                >
                  Comprar Agora
                  <ExternalLink size={20} />
                </a>
              </Button>
            </div>
            {!product.sale_url && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Link de compra não disponível para este produto.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
