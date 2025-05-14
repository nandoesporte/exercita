
import React, { useState } from 'react';
import { CreditCard, Trash2, Key, Edit, Save, Plus, CheckIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  cardNumber: string;
  expiryDate: string;
  holderName: string;
  isDefault: boolean;
}

const PaymentMethodManagement = () => {
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

  // PIX key management state
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [isEditingPix, setIsEditingPix] = useState(false);
  const [savedPixKey, setSavedPixKey] = useState('');
  const [savedPixKeyType, setSavedPixKeyType] = useState('cpf');
  
  // Monthly fee state
  const [monthlyFee, setMonthlyFee] = useState('');
  const [savedMonthlyFee, setSavedMonthlyFee] = useState('99.90');
  const [isEditingFee, setIsEditingFee] = useState(false);

  // Card management
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
  
  const cardColumns = [
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }: { row: { original: PaymentMethod } }) => (
        <span>{row.original.type === 'credit' ? 'Crédito' : 'Débito'}</span>
      ),
    },
    {
      accessorKey: 'cardNumber',
      header: 'Número do Cartão',
    },
    {
      accessorKey: 'expiryDate',
      header: 'Validade',
    },
    {
      accessorKey: 'holderName',
      header: 'Titular',
    },
    {
      accessorKey: 'isDefault',
      header: 'Padrão',
      cell: ({ row }: { row: { original: PaymentMethod } }) => (
        <div className="flex items-center">
          {row.original.isDefault ? (
            <CheckIcon className="h-5 w-5 text-green-500" />
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleSetDefault(row.original.id)}
              className="h-8 px-2"
            >
              Definir como padrão
            </Button>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }: { row: { original: PaymentMethod } }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleDelete(row.original.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 h-8 px-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciamento de Pagamentos</h1>
      </div>
      
      <Tabs defaultValue="monthly-fee" className="w-full">
        <TabsList>
          <TabsTrigger value="monthly-fee">Mensalidade</TabsTrigger>
          <TabsTrigger value="pix">Chave PIX</TabsTrigger>
          <TabsTrigger value="cards">Cartões</TabsTrigger>
        </TabsList>
        
        {/* Mensalidade Tab */}
        <TabsContent value="monthly-fee">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Valor da Mensalidade</CardTitle>
                <Button 
                  variant="ghost" 
                  className="text-primary"
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
              </div>
              <CardDescription>Define o valor base da mensalidade para todos os usuários</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditingFee ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="bg-muted p-2 rounded-l-md border border-r-0 border-input">R$</span>
                    <Input
                      type="number"
                      placeholder="99.90"
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(e.target.value)}
                      className="rounded-l-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveMonthlyFee} 
                      className="flex-1"
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
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-2xl font-semibold">R$ {savedMonthlyFee}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* PIX Tab */}
        <TabsContent value="pix">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <span>Chave PIX</span>
                  </div>
                </CardTitle>
                <Button 
                  variant="ghost" 
                  className="text-primary"
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
              </div>
              <CardDescription>Gerenciar chave PIX para recebimento de pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditingPix ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="pixKeyType" className="block text-sm font-medium mb-1">
                      Tipo de Chave PIX
                    </label>
                    <select
                      id="pixKeyType"
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value)}
                      className="w-full bg-background border border-input rounded p-2"
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="email">Email</option>
                      <option value="phone">Telefone</option>
                      <option value="random">Chave Aleatória</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pixKey" className="block text-sm font-medium mb-1">
                      Chave PIX
                    </label>
                    <Input
                      id="pixKey"
                      placeholder={pixKeyType === 'email' ? 'exemplo@email.com' : '123.456.789-00'}
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSavePix} 
                      className="flex-1"
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
                <div className="p-4 bg-muted rounded-md">
                  {savedPixKey ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-1">
                        {pixKeyType === 'cpf' ? 'CPF' : 
                         pixKeyType === 'cnpj' ? 'CNPJ' : 
                         pixKeyType === 'email' ? 'Email' : 
                         pixKeyType === 'phone' ? 'Telefone' : 'Chave Aleatória'}
                      </p>
                      <p className="text-lg font-medium">{savedPixKey}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Nenhuma chave PIX cadastrada</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Cards Tab */}
        <TabsContent value="cards">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>Cartões</span>
                  </div>
                </CardTitle>
                <Button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  variant={showAddForm ? "outline" : "default"}
                >
                  {showAddForm ? "Cancelar" : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Adicionar</span>
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>Gerenciar cartões de crédito/débito aceitos para pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              {showAddForm && (
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-medium mb-4">Adicionar Novo Cartão</h3>
                  <form onSubmit={handleAddCard} className="space-y-4">
                    <div>
                      <label htmlFor="cardType" className="block text-sm font-medium mb-1">
                        Tipo de Cartão
                      </label>
                      <select
                        id="cardType"
                        value={newCard.type}
                        onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                        className="w-full bg-background border border-input rounded p-2"
                      >
                        <option value="credit">Cartão de Crédito</option>
                        <option value="debit">Cartão de Débito</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                        Número do Cartão
                      </label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={newCard.cardNumber}
                        onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">
                          Validade
                        </label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/AA"
                          value={newCard.expiryDate}
                          onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                          CVV
                        </label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={newCard.cvv}
                          onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="holderName" className="block text-sm font-medium mb-1">
                        Nome no Cartão
                      </label>
                      <Input
                        id="holderName"
                        placeholder="JOÃO A SILVA"
                        value={newCard.holderName}
                        onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button type="submit" className="flex-1">
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
              )}
              
              {paymentMethods.length > 0 ? (
                <DataTable 
                  columns={cardColumns}
                  data={paymentMethods}
                />
              ) : (
                <div className="bg-muted p-6 rounded-lg text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum cartão cadastrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentMethodManagement;
