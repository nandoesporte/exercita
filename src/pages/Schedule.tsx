
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MessageSquare, Send, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// Número de WhatsApp do administrador/treinador
const ADMIN_WHATSAPP = "5511999999999"; // Substitua pelo número correto

const scheduleFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  date: z.date({ required_error: 'Por favor selecione uma data' }),
  time: z.string().min(1, { message: 'Por favor selecione um horário' }),
  goal: z.string().min(10, { message: 'Por favor descreva o objetivo com pelo menos 10 caracteres' }),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const Schedule = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      name: '',
      goal: '',
      time: '',
    },
  });

  const onSubmit = (data: ScheduleFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Formata a data e hora para exibição na mensagem
      const formattedDate = format(data.date, 'dd/MM/yyyy');
      
      // Cria a mensagem para o WhatsApp
      const message = `Olá! Gostaria de agendar uma consultoria:\n\n*Nome:* ${data.name}\n*Data:* ${formattedDate}\n*Hora:* ${data.time}\n*Objetivo:* ${data.goal}`;
      
      // Cria o link para o WhatsApp com a mensagem
      const encodedMessage = encodeURIComponent(message);
      const link = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`;
      
      setWhatsappLink(link);
      
      toast({
        title: "Agendamento criado com sucesso!",
        description: "Clique no botão abaixo para confirmar pelo WhatsApp.",
      });
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast({
        variant: "destructive",
        title: "Erro no agendamento",
        description: "Não foi possível criar o agendamento. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Horários disponíveis para agendamento
  const availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00',
  ];

  return (
    <div className="container max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Agende sua Consultoria
          </h1>
          <p className="text-muted-foreground">
            Agende uma consulta com nossos profissionais para alcançar seus objetivos de fitness.
          </p>
        </div>

        {!whatsappLink ? (
          <div className="fitness-card p-6 bg-fitness-darkGray rounded-xl shadow-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <div className="flex items-center border border-input bg-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <User className="ml-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Seu nome completo" {...field} className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal flex items-center",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                // Desabilita datas passadas e finais de semana
                                const now = new Date();
                                now.setHours(0, 0, 0, 0);
                                const day = date.getDay();
                                return date < now || day === 0 || day === 6;
                              }}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-input bg-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                            <Clock className="ml-3 h-4 w-4 text-muted-foreground" />
                            <select
                              className="flex w-full rounded-md bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                              defaultValue=""
                            >
                              <option value="" disabled>Selecione um horário</option>
                              {availableTimeSlots.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo da Consultoria</FormLabel>
                      <FormControl>
                        <div className="flex border border-input bg-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <div className="p-3">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Textarea
                            placeholder="Descreva o que gostaria de abordar na consultoria..."
                            className="min-h-24 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-fitness-green hover:bg-fitness-green/90 text-white font-bold rounded-xl py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Agendar Consultoria
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <div className="fitness-card p-6 bg-fitness-darkGray rounded-xl shadow-lg text-center space-y-8">
            <div className="space-y-4">
              <div className="mx-auto bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Agendamento Realizado!</h2>
              <p className="text-muted-foreground">
                Para confirmar seu agendamento, clique no botão abaixo para enviar os detalhes pelo WhatsApp.
              </p>
            </div>

            <Button 
              asChild
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-6"
            >
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Confirmar pelo WhatsApp
              </a>
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => setWhatsappLink('')}
              className="w-full"
            >
              Fazer outro agendamento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
