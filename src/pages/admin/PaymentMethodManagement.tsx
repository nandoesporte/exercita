
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast-wrapper';
import { Loader2, Clipboard, CheckCircle, CreditCard, QrCode } from 'lucide-react';

interface PixKey {
  id?: string;
  key_type: 'cpf' | 'email' | 'phone' | 'random';
  key_value: string;
  recipient_name: string;
  is_primary: boolean;
}

interface PaymentSettings {
  id?: string;
  accept_card_payments: boolean;
  accept_pix_payments: boolean;
  accept_monthly_fee: boolean;
  monthly_fee_amount: number;
}

const PaymentMethodManagement = () => {
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);
  const [keyType, setKeyType] = useState<PixKey['key_type']>('cpf');
  const [keyValue, setKeyValue] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [savingPixKey, setSavingPixKey] = useState(false);
  const [acceptCardPayments, setAcceptCardPayments] = useState(false);
  const [acceptPixPayments, setAcceptPixPayments] = useState(false);
  const [acceptMonthlyFee, setAcceptMonthlyFee] = useState(false);
  const [monthlyFeeAmount, setMonthlyFeeAmount] = useState(0);
  const [savingSettings, setSavingSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPixKeys();
    fetchPaymentSettings();
  }, []);

  const fetchPixKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('pix_keys')
        .select('*')
        .order('is_primary', { ascending: false });

      if (error) throw error;
      
      setPixKeys(data || []);
    } catch (error) {
      console.error('Error fetching pix keys:', error);
      toast("Erro ao carregar chaves PIX.");
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setAcceptCardPayments(data.accept_card_payments || false);
        setAcceptPixPayments(data.accept_pix_payments || false);
        setAcceptMonthlyFee(data.accept_monthly_fee || false);
        setMonthlyFeeAmount(data.monthly_fee_amount || 0);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast("Erro ao carregar configurações de pagamento.");
    }
  };

  const handleSavePixKey = async () => {
    if (!keyType || !keyValue || !recipientName) {
      toast("Preencha todos os campos da chave PIX.");
      return;
    }

    setSavingPixKey(true);
    
    try {
      const newKey: PixKey = {
        key_type: keyType,
        key_value: keyValue,
        recipient_name: recipientName,
        is_primary: pixKeys.length === 0, // First key is primary
      };

      const { error } = await supabase.from('pix_keys').insert(newKey);
      
      if (error) throw error;
      
      toast("Chave PIX adicionada com sucesso!");
      
      // Reset form and refresh keys
      setKeyType('cpf');
      setKeyValue('');
      setRecipientName('');
      fetchPixKeys();
    } catch (error) {
      console.error('Error saving pix key:', error);
      toast("Erro ao salvar chave PIX.");
    } finally {
      setSavingPixKey(false);
    }
  };

  const handleSetPrimaryPixKey = async (id: string) => {
    try {
      // First, set all keys to not primary
      await supabase
        .from('pix_keys')
        .update({ is_primary: false })
        .neq('id', 'dummy');
      
      // Then set the selected key as primary
      const { error } = await supabase
        .from('pix_keys')
        .update({ is_primary: true })
        .eq('id', id);
      
      if (error) throw error;
      
      toast("Chave principal atualizada!");
      fetchPixKeys();
    } catch (error) {
      console.error('Error setting primary key:', error);
      toast("Erro ao definir chave principal.");
    }
  };

  const handleDeletePixKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pix_keys')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast("Chave PIX removida com sucesso!");
      fetchPixKeys();
    } catch (error) {
      console.error('Error deleting pix key:', error);
      toast("Erro ao remover chave PIX.");
    }
  };

  const savePaymentSettings = async () => {
    setSavingSettings(true);
    
    try {
      const settings: PaymentSettings = {
        accept_card_payments: acceptCardPayments,
        accept_pix_payments: acceptPixPayments,
        accept_monthly_fee: acceptMonthlyFee,
        monthly_fee_amount: monthlyFeeAmount,
      };
      
      // Check if settings exist
      const { data } = await supabase
        .from('payment_settings')
        .select('id');
      
      let error;
      
      if (data && data.length > 0) {
        // Update
        const result = await supabase
          .from('payment_settings')
          .update(settings)
          .eq('id', data[0].id);
          
        error = result.error;
      } else {
        // Insert
        const result = await supabase
          .from('payment_settings')
          .insert(settings);
          
        error = result.error;
      }
      
      if (error) throw error;
      
      toast("Configurações de pagamento salvas com sucesso!");
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast("Erro ao salvar configurações de pagamento.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast("Chave copiada para a área de transferência!");
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Falha ao copiar a chave: ', err);
      toast("Falha ao copiar a chave para a área de transferência.");
    }
  };

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Métodos de Pagamento</h1>

      <Tabs defaultValue="pix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pix">PIX</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        {/* PIX Management Tab */}
        <TabsContent value="pix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chaves PIX Cadastradas</CardTitle>
              <CardDescription>
                Gerencie as chaves PIX que seus clientes podem usar para pagar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pixKeys.length > 0 ? (
                <div className="grid gap-4">
                  {pixKeys.map((key) => (
                    <Card key={key.id} className="bg-fitness-darkGray">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          {key.is_primary ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Chave Principal</span>
                            </div>
                          ) : (
                            <span>Outra Chave</span>
                          )}
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeletePixKey(key.id || '')}
                          >
                            Remover
                          </Button>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-gray-400">
                              Nome do Recebedor:
                            </Label>
                            <span>{key.recipient_name}</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Chave PIX ({key.key_type}):
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {key.key_value}
                            </p>
                          </div>
                          <Button 
                            variant="secondary" 
                            size="icon"
                            onClick={() => handleCopyToClipboard(key.key_value)}
                            disabled={copied}
                          >
                            {copied ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clipboard className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {!key.is_primary && (
                          <Button onClick={() => handleSetPrimaryPixKey(key.id || '')}>
                            Definir como Principal
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma chave PIX cadastrada.</p>
              )}
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Adicionar Nova Chave PIX</CardTitle>
              <CardDescription>
                Adicione uma nova chave PIX para receber pagamentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keyType">Tipo de Chave</Label>
                  <select
                    id="keyType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={keyType}
                    onChange={(e) => setKeyType(e.target.value as PixKey['key_type'])}
                  >
                    <option value="cpf">CPF</option>
                    <option value="email">Email</option>
                    <option value="phone">Telefone</option>
                    <option value="random">Chave Aleatória</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="keyValue">Chave PIX</Label>
                  <Input
                    type="text"
                    id="keyValue"
                    placeholder={`Digite a chave PIX (${keyType})`}
                    value={keyValue}
                    onChange={(e) => setKeyValue(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="recipientName">Nome do Recebedor</Label>
                <Input
                  type="text"
                  id="recipientName"
                  placeholder="Nome completo do recebedor"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <Button onClick={handleSavePixKey} disabled={savingPixKey}>
                {savingPixKey ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Adicionar Chave PIX'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pagamento</CardTitle>
              <CardDescription>
                Configure os métodos de pagamento aceitos na sua plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="acceptCardPayments">Aceitar Pagamentos com Cartão</Label>
                  <Switch
                    id="acceptCardPayments"
                    checked={acceptCardPayments}
                    onCheckedChange={setAcceptCardPayments}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="acceptPixPayments">Aceitar Pagamentos com PIX</Label>
                  <Switch
                    id="acceptPixPayments"
                    checked={acceptPixPayments}
                    onCheckedChange={setAcceptPixPayments}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="acceptMonthlyFee">Cobrar Mensalidade</Label>
                  <Switch
                    id="acceptMonthlyFee"
                    checked={acceptMonthlyFee}
                    onCheckedChange={setAcceptMonthlyFee}
                  />
                </div>
              </div>

              {acceptMonthlyFee && (
                <div className="space-y-2">
                  <Label htmlFor="monthlyFeeAmount">Valor da Mensalidade (R$)</Label>
                  <Input
                    type="number"
                    id="monthlyFeeAmount"
                    placeholder="Ex: 99.90"
                    value={monthlyFeeAmount.toString()}
                    onChange={(e) => setMonthlyFeeAmount(Number(e.target.value))}
                  />
                </div>
              )}

              <Button onClick={savePaymentSettings} disabled={savingSettings}>
                {savingSettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Configurações'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentMethodManagement;
