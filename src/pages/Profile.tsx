import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const Profile = () => {
  const { profile, isLoading, updateProfile, isUpdating, uploadProfileImage, isUploading, pixKey } = useProfile();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    height: '',
    weight: '',
    birthdate: '',
    gender: '',
    conditions: [] as string[],
    fitness_goal: '',
    medical_restrictions: '',
    physiotherapist_notes: ''
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        birthdate: profile.birthdate || '',
        gender: profile.gender || '',
        conditions: profile.conditions || [],
        fitness_goal: profile.fitness_goal || '',
        medical_restrictions: profile.medical_restrictions || '',
        physiotherapist_notes: profile.physiotherapist_notes || ''
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      birthdate: formData.birthdate,
      gender: formData.gender,
      conditions: formData.conditions as ('lombalgia' | 'cervicalgia' | 'pos_cirurgia' | 'tendinite' | 'artrose' | 'lesao_joelho' | 'lesao_ombro' | 'acidente_trabalho' | 'avc_reabilitacao' | 'fraturas' | 'outros')[],
      fitness_goal: formData.fitness_goal,
      medical_restrictions: formData.medical_restrictions,
      physiotherapist_notes: formData.physiotherapist_notes
    };

    updateProfile(updateData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadProfileImage(file);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando perfil...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Perfil do Paciente</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Foto do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="relative">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Alterar Foto'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Nome</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Sobrenome</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="birthdate">Data de Nascimento</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fitness_goal">Objetivo Terapêutico</Label>
                <Textarea
                  id="fitness_goal"
                  value={formData.fitness_goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, fitness_goal: e.target.value }))}
                  placeholder="Ex: Reduzir dor lombar, melhorar mobilidade..."
                />
              </div>

              <div>
                <Label htmlFor="medical_restrictions">Restrições Médicas</Label>
                <Textarea
                  id="medical_restrictions"
                  value={formData.medical_restrictions}
                  onChange={(e) => setFormData(prev => ({ ...prev, medical_restrictions: e.target.value }))}
                  placeholder="Ex: Não pode carregar peso, evitar impacto..."
                />
              </div>

              <div>
                <Label htmlFor="physiotherapist_notes">Observações do Fisioterapeuta</Label>
                <Textarea
                  id="physiotherapist_notes"
                  value={formData.physiotherapist_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, physiotherapist_notes: e.target.value }))}
                  placeholder="Anotações do profissional..."
                />
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {pixKey && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Informações de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Chave PIX:</strong> {pixKey.key_value}</p>
                <p><strong>Tipo:</strong> {pixKey.key_type}</p>
                <p><strong>Nome:</strong> {pixKey.recipient_name}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;