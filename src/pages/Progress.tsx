import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Calendar,
  Download,
  Heart,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface SymptomEntry {
  id: string;
  date: string;
  pain_level: string;
  stiffness_level: number;
  fatigue_level: number;
  notes?: string;
}

const Progress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('7'); // days

  const { data: symptomsData = [], isLoading } = useQuery({
    queryKey: ['daily-symptoms', user?.id, selectedPeriod],
    queryFn: async () => {
      if (!user) return [];
      
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(selectedPeriod));
      
      const { data, error } = await supabase
        .from('daily_symptoms')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', daysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      return data as SymptomEntry[];
    },
    enabled: !!user
  });

  const { data: sessionCount = 0 } = useQuery({
    queryKey: ['therapy-sessions-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('therapy_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'concluida');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user
  });

  const getTrend = (current: number, previous: number) => {
    if (current < previous) return { icon: TrendingDown, color: 'text-green-500', text: 'Melhorando' };
    if (current > previous) return { icon: TrendingUp, color: 'text-red-500', text: 'Piorando' };
    return { icon: Minus, color: 'text-gray-500', text: 'Estável' };
  };

  const getAverageSymptoms = () => {
    if (symptomsData.length === 0) return { pain: 0, stiffness: 0, fatigue: 0 };
    
    const totals = symptomsData.reduce((acc, entry) => {
      acc.pain += parseInt(entry.pain_level);
      acc.stiffness += entry.stiffness_level;
      acc.fatigue += entry.fatigue_level;
      return acc;
    }, { pain: 0, stiffness: 0, fatigue: 0 });

    return {
      pain: Math.round(totals.pain / symptomsData.length),
      stiffness: Math.round(totals.stiffness / symptomsData.length),
      fatigue: Math.round(totals.fatigue / symptomsData.length)
    };
  };

  const averages = getAverageSymptoms();
  const latestEntry = symptomsData[0];
  const previousEntry = symptomsData[1];

  const painTrend = latestEntry && previousEntry ? 
    getTrend(parseInt(latestEntry.pain_level), parseInt(previousEntry.pain_level)) : null;
  const stiffnessTrend = latestEntry && previousEntry ? 
    getTrend(latestEntry.stiffness_level, previousEntry.stiffness_level) : null;
  const fatigueTrend = latestEntry && previousEntry ? 
    getTrend(latestEntry.fatigue_level, previousEntry.fatigue_level) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-gray-800">Evolução do Tratamento</h1>
                <p className="text-gray-600">Acompanhe seu progresso</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white/80">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {[
            { value: '7', label: '7 dias' },
            { value: '30', label: '30 dias' },
            { value: '90', label: '3 meses' }
          ].map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className={`${
                selectedPeriod === period.value 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                  : 'bg-white/80 backdrop-blur-sm'
              }`}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sessões Concluídas</p>
                  <p className="text-2xl font-bold text-gray-800">{sessionCount}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Registros</p>
                  <p className="text-2xl font-bold text-gray-800">{symptomsData.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dor Média</p>
                  <p className="text-2xl font-bold text-gray-800">{averages.pain}/10</p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dias Consecutivos</p>
                  <p className="text-2xl font-bold text-gray-800">5</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Analysis */}
        {latestEntry && previousEntry && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <p className="text-sm text-gray-600">Comparação com o registro anterior</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {painTrend && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium">Dor</p>
                      <p className="text-sm text-gray-600">
                        {latestEntry.pain_level}/10 → {previousEntry.pain_level}/10
                      </p>
                    </div>
                    <div className={`flex items-center space-x-1 ${painTrend.color}`}>
                      <painTrend.icon className="w-4 h-4" />
                      <span className="text-sm">{painTrend.text}</span>
                    </div>
                  </div>
                )}

                {stiffnessTrend && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">Rigidez</p>
                      <p className="text-sm text-gray-600">
                        {latestEntry.stiffness_level}/10 → {previousEntry.stiffness_level}/10
                      </p>
                    </div>
                    <div className={`flex items-center space-x-1 ${stiffnessTrend.color}`}>
                      <stiffnessTrend.icon className="w-4 h-4" />
                      <span className="text-sm">{stiffnessTrend.text}</span>
                    </div>
                  </div>
                )}

                {fatigueTrend && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium">Fadiga</p>
                      <p className="text-sm text-gray-600">
                        {latestEntry.fatigue_level}/10 → {previousEntry.fatigue_level}/10
                      </p>
                    </div>
                    <div className={`flex items-center space-x-1 ${fatigueTrend.color}`}>
                      <fatigueTrend.icon className="w-4 h-4" />
                      <span className="text-sm">{fatigueTrend.text}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Entries */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Registros Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {symptomsData.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum registro encontrado</h3>
                <p className="text-gray-600 mb-4">
                  Comece a registrar seus sintomas para acompanhar sua evolução.
                </p>
                <Button 
                  onClick={() => navigate('/symptoms')}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  Registrar Sintomas
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {symptomsData.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">
                        {new Date(entry.date).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span>{entry.pain_level}</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Activity className="w-3 h-3 text-blue-500" />
                        <span>{entry.stiffness_level}</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span>{entry.fatigue_level}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {symptomsData.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" className="bg-white/80">
                      Ver Todos os Registros
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate('/symptoms')}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            Registrar Sintomas Hoje
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/appointments')}
            className="flex-1 bg-white/80"
          >
            Agendar Consulta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Progress;