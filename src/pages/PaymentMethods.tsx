
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Plus, Trash2, Key, Edit, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

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
  
  // PIX management state
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [isEditingPix, setIsEditingPix] = useState(false);
  const [savedPixKey, setSavedPixKey] = useState('');
  const [savedPixKeyType, setSavedPixKeyType] = useState('cpf');
  
  // Monthly fee state
  const [monthlyFee, setMonthlyFee] = useState('');
  const [savedMonthlyFee, setSavedMonthlyFee] = useState('');
  const [isEditingFee, setIsEditingFee] = useState(false);

  const handleDelete = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
    toast({
      title: 'Cartão removido com sucesso'
    });
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    toast({
      title: 'Cartão padrão alterado'
    });
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.holderName || !newCard.cvv) {
      toast({
        title: 'Preencha todos os campos'
      });
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
    toast({
      title: 'Cartão adicionado com sucesso'
    });
  };
  
  const handleSavePix = () => {
    if (!pixKey) {
      toast({
        title: 'Digite uma chave PIX válida'
      });
      return;
    }
    
    setSavedPixKey(pixKey);
    setSavedPixKeyType(pixKeyType);
    setIsEditingPix(false);
    toast({
      title: 'Chave PIX salva com sucesso'
    });
  };
  
  const handleSaveMonthlyFee = () => {
    if (!monthlyFee) {
      toast({
        title: 'Digite um valor de mensalidade válido'
      });
      return;
    }
    
    setSavedMonthlyFee(monthlyFee);
    setIsEditingFee(false);
    toast({
      title: 'Valor da mensalidade salvo com sucesso'
    });
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
          {/* Monthly Fee Section */}
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
          
          {/* PIX Key Section */}
          <div className="bg-fitness-darkGray p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Key size={18} className="mr-2 text-fitness-orange" />
              <span>Chave PIX</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-fitness-orange hover:text-fitness-orange/90"
                onClick={() => {
                  if (isEditingPix) {
                    handleSavePix();
                  } else {
                    setPixKey(savedPixKey);
                    setPixKeyType(savedPixKeyType);
                    setIsEditingPix(true);
                  }
                }}
              >
                {isEditingPix ? <Save size={18} /> : <Edit size={18} />}
              </Button>
            </h2>
            
            {isEditingPix ? (
              <div className="mt-2">
                <div className="mb-3">
                  <label htmlFor="pixKeyType" className="block text-sm mb-1">
                    Tipo de Chave PIX
                  </label>
                  <select
                    id="pixKeyType"
                    value={pixKeyType}
                    onChange={(e) => setPixKeyType(e.target.value)}
                    className="w-full bg-fitness-dark border border-gray-700 rounded p-2"
                  >
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">Email</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Chave Aleatória</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="pixKey" className="block text-sm mb-1">
                    Chave PIX
                  </label>
                  <Input
                    id="pixKey"
                    placeholder={pixKeyType === 'email' ? 'exemplo@email.com' : '123.456.789-00'}
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    className="bg-fitness-dark border-gray-700"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSavePix} 
                    className="flex-1 bg-fitness-orange hover:bg-fitness-orange/90"
                  >
                    Salvar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setIsEditingPix(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-fitness-dark rounded-md">
                {savedPixKey ? (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      {savedPixKeyType === 'cpf' ? 'CPF' : 
                       savedPixKeyType === 'cnpj' ? 'CNPJ' : 
                       savedPixKeyType === 'email' ? 'Email' : 
                       savedPixKeyType === 'phone' ? 'Telefone' : 'Chave Aleatória'}
                    </p>
                    <p className="font-medium">{savedPixKey}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">Nenhuma chave PIX cadastrada</p>
                )}
              </div>
            )}
          </div>
          
          {/* Credit Card Section */}
          <div className="bg-fitness-darkGray p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <CreditCard size={18} className="mr-2 text-fitness-orange" />
              <span>Cartões</span>
            </h2>
            
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
              <div className="bg-fitness-dark p-6 rounded-lg text-center">
                <CreditCard className="h-10 w-10 text-fitness-orange mx-auto mb-3" />
                <p>Nenhum cartão cadastrado</p>
                <p className="text-sm text-gray-400 mt-1">
                  Adicione um cartão para pagar por serviços premium
                </p>
              </div>
            )}
          </div>

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
