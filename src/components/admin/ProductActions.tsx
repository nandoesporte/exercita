
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ProductActionsProps {
  onCreateNew: () => void;
}

export const ProductActions = ({ onCreateNew }: ProductActionsProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os produtos da loja e defina quais aparecem na página inicial
        </p>
      </div>
      <Button onClick={onCreateNew}>
        <Plus className="mr-2 h-4 w-4" />
        Criar Novo
      </Button>
    </div>
  );
};
