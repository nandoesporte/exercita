import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Heart, 
  Activity, 
  Zap,
  Save,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

const Symptoms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [stiffnessLevel, setStiffnessLevel] = useState<number | null>(null);
  const [fatigueLevel, setFatigueLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || painLevel === null || stiffnessLevel === null || fatigueLevel === null) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('daily_symptoms')
        .upsert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          pain_level: painLevel.toString() as '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10',
          stiffness_level: stiffnessLevel,
          fatigue_level: fatigueLevel,
          notes: notes || null
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      toast.success('Sintomas registrados com sucesso!');
      navigate('/');
    } catch (error: any) {
      console.error('Error saving symptoms:', error);
      toast.error('Erro ao salvar sintomas: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const ScaleSelector = ({ 
    title, 
    value, 
    setValue, 
    icon: Icon, 
    color,
    description 
  }: {
    title: string;
    value: number | null;
    setValue: (val: number) => void;
    icon: React.ElementType;
    color: string;
    description: string;
  }) => (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span>{title}</span>
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 md:grid-cols-11 gap-2">
          {Array.from({ length: 11 }, (_, i) => (
            <Button
              key={i}
              variant={value === i ? "default" : "outline"}
              size="sm"
              onClick={() => setValue(i)}
              className={`aspect-square p-0 ${
                value === i 
                  ? `bg-gradient-to-r ${color.includes('red') ? 'from-red-500 to-red-600' : 
                      color.includes('blue') ? 'from-blue-500 to-blue-600' : 
                      'from-yellow-500 to-yellow-600'}`
                  : 'bg-white/80'
              }`}
            >
              {i}
            </Button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Nenhum</span>
          <span>Extremo</span>
        </div>
        {value !== null && (
          <Badge variant="secondary" className="w-fit">
            Nível selecionado: {value}/10
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Registro de Sintomas</h1>
              <p className="text-gray-600 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Information Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Por que registrar sintomas?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  O registro diário dos seus sintomas ajuda seu fisioterapeuta a acompanhar 
                  sua evolução e ajustar o tratamento conforme necessário.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pain Level */}
        <ScaleSelector
          title="Nível de Dor"
          value={painLevel}
          setValue={setPainLevel}
          icon={Heart}
          color="text-red-500"
          description="Como está sua dor hoje? (0 = sem dor, 10 = dor insuportável)"
        />

        {/* Stiffness Level */}
        <ScaleSelector
          title="Rigidez Muscular"
          value={stiffnessLevel}
          setValue={setStiffnessLevel}
          icon={Activity}
          color="text-blue-500"
          description="Quão rígidos estão seus músculos? (0 = muito flexível, 10 = muito rígido)"
        />

        {/* Fatigue Level */}
        <ScaleSelector
          title="Nível de Fadiga"
          value={fatigueLevel}
          setValue={setFatigueLevel}
          icon={Zap}
          color="text-yellow-500"
          description="Como está seu cansaço? (0 = muito energético, 10 = muito cansado)"
        />

        {/* Notes */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Observações Adicionais</CardTitle>
            <p className="text-sm text-gray-600">
              Descreva outros sintomas ou situações relevantes
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ex: Senti dor ao levantar da cama, melhorou após o alongamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="bg-white/90"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || painLevel === null || stiffnessLevel === null || fatigueLevel === null}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Registro
                </>
              )}
            </Button>

            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/progress')}
                className="bg-white/80"
              >
                Ver Histórico de Sintomas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">💡 Dicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-green-700">
            <p>• Registre sempre no mesmo horário para maior precisão</p>
            <p>• Seja honesto sobre seus sintomas - isso ajuda seu tratamento</p>
            <p>• Anote fatores que podem influenciar (sono, estresse, atividades)</p>
            <p>• Em caso de dor aguda ou piora súbita, procure seu fisioterapeuta</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Symptoms;