import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search,
  BookOpen,
  Heart,
  Brain,
  Shield,
  Stethoscope,
  ChevronRight,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EducationalContent {
  id: string;
  title: string;
  content: string;
  category: string;
  target_conditions: string[];
  created_at: string;
}

const Education = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: educationalContent = [], isLoading } = useQuery({
    queryKey: ['educational-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('educational_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EducationalContent[];
    }
  });

  const categories = [
    { value: 'all', label: 'Todos os Temas', icon: BookOpen },
    { value: 'Prevenção', label: 'Prevenção', icon: Shield },
    { value: 'Pós-Operatório', label: 'Pós-Operatório', icon: Stethoscope },
    { value: 'Técnicas', label: 'Técnicas', icon: Brain },
    { value: 'Cuidados', label: 'Cuidados Gerais', icon: Heart }
  ];

  const filteredContent = educationalContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData?.icon || BookOpen;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prevenção': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pós-Operatório': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Técnicas': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Cuidados': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-800">Conteúdo Educativo</h1>
              <p className="text-gray-600">Aprenda sobre sua reabilitação</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conteúdos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className={`whitespace-nowrap flex items-center space-x-2 ${
                  selectedCategory === category.value 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                    : 'bg-white/80 backdrop-blur-sm'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{category.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Featured Content */}
        <Card className="bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Brain className="w-5 h-5" />
              <span>Destaque da Semana</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">5 Exercícios de Respiração para Alívio da Dor</h3>
              <p className="text-sm text-gray-600 mt-1">
                Técnicas simples e eficazes que você pode fazer em casa para reduzir 
                a tensão e melhorar seu bem-estar.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>5 min de leitura</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/80"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ler Agora
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedCategory === 'all' ? 'Todos os Conteúdos' : `Categoria: ${selectedCategory}`}
          </h2>
          
          {filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum conteúdo encontrado</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `Nenhum conteúdo corresponde à busca "${searchTerm}"`
                  : 'Não há conteúdos disponíveis nesta categoria no momento.'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredContent.map((content) => {
                const IconComponent = getCategoryIcon(content.category);
                return (
                  <Card 
                    key={content.id}
                    className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                              <IconComponent className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 mb-1">
                                {content.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {content.content.substring(0, 150)}...
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={getCategoryColor(content.category)}>
                                {content.category}
                              </Badge>
                              {content.target_conditions && content.target_conditions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {content.target_conditions.slice(0, 2).map((condition) => (
                                    <Badge key={condition} variant="outline" className="text-xs">
                                      {condition.replace('_', ' ')}
                                    </Badge>
                                  ))}
                                  {content.target_conditions.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{content.target_conditions.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>💡 Dica do Fisioterapeuta</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-green-700">
            <p className="font-medium">Lembre-se:</p>
            <ul className="space-y-1 ml-4">
              <li>• O conhecimento é parte fundamental do tratamento</li>
              <li>• Entender sua condição ajuda na recuperação mais rápida</li>
              <li>• Aplique as técnicas aprendidas no seu dia a dia</li>
              <li>• Em caso de dúvidas, sempre consulte seu fisioterapeuta</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate('/appointments')}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            Agendar Consulta
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/workouts')}
            className="flex-1 bg-white/80"
          >
            Ver Protocolos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Education;