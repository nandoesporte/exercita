
import React, { useState } from 'react';
import { Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface MonthlyFeeSectionProps {
  savedMonthlyFee: string;
  setSavedMonthlyFee: (value: string) => void;
}

const MonthlyFeeSection = ({ savedMonthlyFee, setSavedMonthlyFee }: MonthlyFeeSectionProps) => {
  const [monthlyFee, setMonthlyFee] = useState('');
  const [isEditingFee, setIsEditingFee] = useState(false);

  const handleSaveMonthlyFee = () => {
    if (!monthlyFee) {
      toast('Digite um valor de mensalidade válido');
      return;
    }
    
    setSavedMonthlyFee(monthlyFee);
    setIsEditingFee(false);
    toast('Valor da mensalidade salvo com sucesso');
  };

  return (
    <div className="bg-fitness-darkGray p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-3 flex items-center">
        <span>Mensalidade</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto text-fitness-orange hover:text-fitness-orange/90"
          onClick={() => {
            if (isEditingFee) {
              handleSaveMonthlyFee();
            } else {
              setMonthlyFee(savedMonthlyFee);
              setIsEditingFee(true);
            }
          }}
        >
          {isEditingFee ? <Save size={18} /> : <Edit size={18} />}
        </Button>
      </h2>
      
      {isEditingFee ? (
        <div className="mt-2">
          <div className="flex items-center">
            <span className="bg-fitness-dark text-gray-400 p-2 rounded-l-md border border-r-0 border-gray-700">R$</span>
            <Input
              type="number"
              placeholder="99.90"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              className="rounded-l-none bg-fitness-dark border-gray-700"
            />
          </div>
          <div className="flex space-x-2 mt-3">
            <Button 
              onClick={handleSaveMonthlyFee} 
              className="flex-1 bg-fitness-orange hover:bg-fitness-orange/90"
            >
              Salvar
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setIsEditingFee(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-fitness-dark rounded-md">
          {savedMonthlyFee ? (
            <p className="text-lg font-medium">R$ {savedMonthlyFee}</p>
          ) : (
            <p className="text-gray-400">Nenhum valor definido</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyFeeSection;
