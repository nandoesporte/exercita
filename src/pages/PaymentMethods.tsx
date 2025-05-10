
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  cardNumber: string;
  expiryDate: string;
  holderName: string;
  isDefault: boolean;
}

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit',
      cardNumber: '**** **** **** 1234',
      expiryDate: '12/25',
      holderName: 'João Silva',
      isDefault: true,
    },
    {
      id: '2',
      type: 'debit',
      cardNumber: '**** **** **** 5678',
      expiryDate: '09/24',
      holderName: 'João Silva',
      isDefault: false,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({
    type: 'credit',
    cardNumber: '',
    expiryDate: '',
    holderName: '',
    cvv: '',
  });

  const handleDelete = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
    toast.success('Cartão removido com sucesso');
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    toast.success('Cartão padrão alterado');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.holderName || !newCard.cvv) {
      toast.error('Preencha todos os campos');
      return;
    }

    // Create new payment method
    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: newCard.type as 'credit' | 'debit',
      cardNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}`,
      expiryDate: newCard.expiryDate,
      holderName: newCard.holderName,
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setShowAddForm(false);
    setNewCard({
      type: 'credit',
      cardNumber: '',
      expiryDate: '',
      holderName: '',
      cvv: '',
    });
    toast.success('Cartão adicionado com sucesso');
  };

  return (
    <main className="container">
      <section className="mobile-section">
        <div className="mb-6 flex items-center">
          <Link to="/profile" className="mr-2">
            <ArrowLeft className="text-fitness-orange" />
          </Link>
          <h1 className="text-2xl font-bold">Métodos de Pagamento</h1>
        </div>

        <div className="space-y-6">
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`bg-fitness-darkGray p-4 rounded-lg border ${
                    method.isDefault ? 'border-fitness-orange' : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-fitness-orange mr-3" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold">{method.cardNumber}</p>
                          {method.isDefault && (
                            <span className="bg-fitness-orange text-white text-xs px-2 py-0.5 rounded-full">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {method.type === 'credit' ? 'Crédito' : 'Débito'} • Exp: {method.expiryDate}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {!method.isDefault && (
                    <Button
                      onClick={() => handleSetDefault(method.id)}
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-fitness-orange hover:text-fitness-orange/90 hover:bg-transparent p-0"
                    >
                      Definir como padrão
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-fitness-darkGray p-6 rounded-lg text-center">
              <CreditCard className="h-10 w-10 text-fitness-orange mx-auto mb-3" />
              <p>Nenhum cartão cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Adicione um cartão para pagar por serviços premium
              </p>
            </div>
          )}

          {showAddForm ? (
            <div className="bg-fitness-darkGray p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Adicionar Novo Cartão</h2>
              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label htmlFor="cardType" className="block text-sm mb-1">
                    Tipo de Cartão
                  </label>
                  <select
                    id="cardType"
                    value={newCard.type}
                    onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                    className="w-full bg-fitness-dark border border-gray-700 rounded p-2"
                  >
                    <option value="credit">Cartão de Crédito</option>
                    <option value="debit">Cartão de Débito</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="cardNumber" className="block text-sm mb-1">
                    Número do Cartão
                  </label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={newCard.cardNumber}
                    onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                    className="bg-fitness-dark border-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm mb-1">
                      Validade
                    </label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/AA"
                      value={newCard.expiryDate}
                      onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
                      className="bg-fitness-dark border-gray-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm mb-1">
                      CVV
                    </label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                      className="bg-fitness-dark border-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="holderName" className="block text-sm mb-1">
                    Nome no Cartão
                  </label>
                  <Input
                    id="holderName"
                    placeholder="JOÃO A SILVA"
                    value={newCard.holderName}
                    onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
                    className="bg-fitness-dark border-gray-700"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button type="submit" className="flex-1 bg-fitness-orange hover:bg-fitness-orange/90">
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-fitness-darkGray hover:bg-fitness-dark border border-dashed border-gray-600 flex items-center justify-center gap-2 py-6"
            >
              <Plus size={20} />
              <span>Adicionar cartão</span>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
};

export default PaymentMethods;
