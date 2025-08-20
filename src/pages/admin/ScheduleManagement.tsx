import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast-wrapper';
import { Loader2, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';

const ScheduleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    credentials: '',
    bio: '',
    whatsapp: '',
  });

  // Handle photo upload placeholder
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // MySQL placeholder - photo upload will be implemented
    setTimeout(() => {
      toast('Funcionalidade será implementada em breve');
      setUploading(false);
    }, 1000);
  };

  // Handle form submission placeholder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // MySQL placeholder - trainer data will be implemented
    setTimeout(() => {
      toast('Funcionalidade será implementada em breve');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Página de Agendamento</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Personal Trainer</CardTitle>
          <CardDescription>
            MySQL placeholder - funcionalidade será implementada em breve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Photo Upload Section */}
            <div className="space-y-3">
              <Label htmlFor="photo-upload">Foto do Perfil</Label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted relative">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="Foto do perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                      Sem foto
                    </div>
                  )}
                </div>
                <div>
                  <div className="mb-3">
                    <Button variant="outline" className="relative" disabled={uploading}>
                      <input 
                        id="photo-upload"
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Enviar nova foto
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Trainer Info Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input 
                  placeholder="Nome do Personal Trainer" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Credenciais</Label>
                <Input 
                  placeholder="Ex: Personal Trainer - CREF 123456" 
                  value={formData.credentials}
                  onChange={(e) => setFormData({...formData, credentials: e.target.value})}
                />
              </div>
              
              <div>
                <Label>WhatsApp</Label>
                <Input 
                  placeholder="Apenas números, ex: 44997270698" 
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Biografia</Label>
                <Textarea 
                  placeholder="Descrição curta sobre o personal trainer..." 
                  className="min-h-20"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-fitness-green to-fitness-blue"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Informações'
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleManagement;
