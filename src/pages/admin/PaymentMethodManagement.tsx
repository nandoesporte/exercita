
import React, { useState } from 'react';
import { CreditCard, Trash2, Key, Edit, Save, Plus, CheckIcon, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
  const [pixKeyCopied, setPixKeyCopied] = useState(false);
  
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
  
  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(savedPixKey).then(() => {
      setPixKeyCopied(true);
      toast({
        title: 'Chave PIX copiada'
      });
      
      setTimeout(() => {
        setPixKeyCopied(false);
      }, 2000);
    });
  };
  
  const getPixKeyTypeLabel = (type: string) => {
    switch (type) {
      case 'cpf': return 'CPF';
      case 'cnpj': return 'CNPJ';
      case 'email': return 'Email';
      case 'phone': return 'Telefone';
      case 'random': return 'Chave Aleatória';
      default: return type;
    }
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
            <div className="flex items-center gap-1 text-green-500">
              <CheckIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Padrão</span>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleSetDefault(row.original.id)}
              className="h-8 px-2 text-xs"
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
        <TabsList className="bg-fitness-darkGray/70 border border-fitness-darkGray/30 mb-4">
          <TabsTrigger value="monthly-fee" className="data-[state=active]:bg-fitness-orange data-[state=active]:text-white">
            Mensalidade
          </TabsTrigger>
          <TabsTrigger value="pix" className="data-[state=active]:bg-fitness-orange data-[state=active]:text-white">
            Chave PIX
          </TabsTrigger>
          <TabsTrigger value="cards" className="data-[state=active]:bg-fitness-orange data-[state=active]:text-white">
            Cartões
          </TabsTrigger>
        </TabsList>
        
        {/* Mensalidade Tab */}
        <TabsContent value="monthly-fee">
          <Card className="bg-fitness-darkGray border-fitness-darkGray/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-fitness-orange">Valor da Mensalidade</CardTitle>
                <Button 
                  variant="ghost" 
                  className="text-fitness-orange hover:bg-fitness-orange/10"
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
                      className="rounded-l-none bg-background/10 border-input"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveMonthlyFee} 
                      className="flex-1 bg-fitness-orange hover:bg-fitness-orange/90"
                    >
                      <Save className="mr-2 h-4 w-4" />
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
                <div className="p-6 bg-gradient-to-r from-fitness-orange/10 to-fitness-orange/5 rounded-lg border border-fitness-orange/20">
                  <p className="text-3xl font-bold text-white flex items-center justify-center">
                    <span className="text-lg mr-1 text-fitness-orange font-normal">R$</span> 
                    {savedMonthlyFee}
                    <span className="text-sm text-muted-foreground ml-2 font-normal">/mês</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* PIX Tab */}
        <TabsContent value="pix">
          <Card className="bg-fitness-darkGray border-fitness-darkGray/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-fitness-orange">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    <span>Chave PIX</span>
                  </div>
                </CardTitle>
                <Button 
                  variant="ghost" 
                  className="text-fitness-orange hover:bg-fitness-orange/10"
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
                    <label htmlFor="pixKeyType" className="block text-sm font-medium mb-1 text-muted-foreground">
                      Tipo de Chave PIX
                    </label>
                    <select
                      id="pixKeyType"
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value)}
                      className="w-full bg-background/10 border border-input rounded p-2 text-white"
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="email">Email</option>
                      <option value="phone">Telefone</option>
                      <option value="random">Chave Aleatória</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pixKey" className="block text-sm font-medium mb-1 text-muted-foreground">
                      Chave PIX
                    </label>
                    <Input
                      id="pixKey"
                      placeholder={pixKeyType === 'email' ? 'exemplo@email.com' : '123.456.789-00'}
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      className="bg-background/10 border-input"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSavePix} 
                      className="flex-1 bg-fitness-orange hover:bg-fitness-orange/90"
                    >
                      <Save className="mr-2 h-4 w-4" />
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
                <div className="space-y-4">
                  {savedPixKey ? (
                    <div className="p-6 bg-gradient-to-r from-fitness-orange/10 to-fitness-orange/5 rounded-lg border border-fitness-orange/20 relative">
                      <div className="flex flex-col">
                        <span className="text-sm text-fitness-orange mb-1">
                          {getPixKeyTypeLabel(savedPixKeyType)}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium break-all mr-2">{savedPixKey}</span>
                          <Button
                            variant="ghost" 
                            size="sm"
                            className="text-fitness-orange hover:bg-fitness-orange/20 h-8 w-8 p-0 flex items-center justify-center"
                            onClick={handleCopyPixKey}
                          >
                            {pixKeyCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md">
                      <Key className="h-12 w-12 text-muted-foreground mb-3 opacity-30" />
                      <p className="text-muted-foreground">Nenhuma chave PIX cadastrada</p>
                      <Button 
                        onClick={() => setIsEditingPix(true)} 
                        variant="outline"
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Chave PIX
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code Section (if a PIX key is saved) */}
          {savedPixKey && (
            <Card className="mt-6 bg-fitness-darkGray border-fitness-darkGray/30">
              <CardHeader>
                <CardTitle className="text-xl text-fitness-orange">QR Code PIX</CardTitle>
                <CardDescription>QR Code para facilitar pagamentos via PIX</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mx-auto max-w-[200px] bg-white p-4 rounded-lg">
                  <AspectRatio ratio={1/1} className="overflow-hidden">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${savedPixKeyType}:${savedPixKey}`)}`}
                      alt="QR Code PIX"
                      className="object-cover"
                    />
                  </AspectRatio>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Cards Tab */}
        <TabsContent value="cards">
          <Card className="bg-fitness-darkGray border-fitness-darkGray/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-fitness-orange">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Cartões</span>
                  </div>
                </CardTitle>
                <Button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  variant={showAddForm ? "outline" : "default"}
                  className={showAddForm ? "" : "bg-fitness-orange hover:bg-fitness-orange/90"}
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
                <div className="bg-gradient-to-r from-fitness-orange/10 to-fitness-orange/5 p-6 rounded-lg mb-6 border border-fitness-orange/20">
                  <h3 className="text-lg font-medium mb-4 text-fitness-orange">Adicionar Novo Cartão</h3>
                  <form onSubmit={handleAddCard} className="space-y-4">
                    <div>
                      <label htmlFor="cardType" className="block text-sm font-medium mb-1 text-muted-foreground">
                        Tipo de Cartão
                      </label>
                      <select
                        id="cardType"
                        value={newCard.type}
                        onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                        className="w-full bg-background/10 border border-input rounded p-2 text-white"
                      >
                        <option value="credit">Cartão de Crédito</option>
                        <option value="debit">Cartão de Débito</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium mb-1 text-muted-foreground">
                        Número do Cartão
                      </label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={newCard.cardNumber}
                        onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                        className="bg-background/10 border-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium mb-1 text-muted-foreground">
                          Validade
                        </label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/AA"
                          value={newCard.expiryDate}
                          onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
                          className="bg-background/10 border-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium mb-1 text-muted-foreground">
                          CVV
                        </label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={newCard.cvv}
                          onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                          className="bg-background/10 border-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="holderName" className="block text-sm font-medium mb-1 text-muted-foreground">
                        Nome no Cartão
                      </label>
                      <Input
                        id="holderName"
                        placeholder="JOÃO A SILVA"
                        value={newCard.holderName}
                        onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
                        className="bg-background/10 border-input"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button type="submit" className="flex-1 bg-fitness-orange hover:bg-fitness-orange/90">
                        <Save className="mr-2 h-4 w-4" />
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
                <div className="bg-muted p-8 rounded-lg text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground mb-4">Nenhum cartão cadastrado</p>
                  <Button onClick={() => setShowAddForm(true)} className="bg-fitness-orange hover:bg-fitness-orange/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Cartão
                  </Button>
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
