
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isEqual, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from '@/components/ui/data-table';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const TimePicker = ({ value, onChange, disabledTimes = [] }: { 
  value: string; 
  onChange: (time: string) => void;
  disabledTimes?: string[];
}) => {
  const times = [];
  
  // Generate time slots from 7:00 to 22:00, every 30 minutes
  for (let hour = 7; hour <= 22; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      times.push(timeValue);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Clock className="mr-2 h-4 w-4" />
          {value || "Selecione um horário"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="h-60 overflow-y-auto p-2">
          {times.map((time) => (
            <Button
              key={time}
              variant="ghost"
              className={`w-full justify-start mb-1 ${value === time ? 'bg-primary/20' : ''}`}
              onClick={() => onChange(time)}
              disabled={disabledTimes.includes(time)}
            >
              {time}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const AppointmentManagement = () => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    trainerName: '',
    description: '',
    duration: 60, // Default duration in minutes
    userId: ''
  });
  const isMobile = useIsMobile();

  // Fetch all appointments
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });
      
      if (error) {
        console.error("Error fetching appointments:", error);
        throw new Error(`Error fetching appointments: ${error.message}`);
      }

      console.log("Appointments data received:", data?.length || 0);
      return data || [];
    },
  });

  // Calculate already booked time slots for the selected date
  const getDisabledTimes = () => {
    if (!date || !appointmentsData) return [];
    
    const disabledTimes: string[] = [];
    const selectedDateStr = format(date, 'yyyy-MM-dd');
    
    appointmentsData.forEach((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date);
      const appointmentDateStr = format(appointmentDate, 'yyyy-MM-dd');
      
      if (appointmentDateStr === selectedDateStr) {
        const timeStr = format(appointmentDate, 'HH:mm');
        disabledTimes.push(timeStr);
        
        // Block the slots for the duration of the appointment
        const durationInMinutes = appointment.duration || 60;
        let currentTime = new Date(appointmentDate);
        
        for (let i = 30; i < durationInMinutes; i += 30) {
          currentTime = addMinutes(currentTime, 30);
          disabledTimes.push(format(currentTime, 'HH:mm'));
        }
      }
    });
    
    return disabledTimes;
  };

  const disabledTimes = getDisabledTimes();

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      if (!date || !time) throw new Error('Data e hora são obrigatórios');
      
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours, minutes);

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          title: appointmentData.title,
          trainer_name: appointmentData.trainerName,
          description: appointmentData.description,
          appointment_date: appointmentDate.toISOString(),
          duration: appointmentData.duration,
          user_id: appointmentData.userId || null,
          status: 'scheduled'
        }])
        .select();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Consulta agendada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao agendar consulta: ${error.message}`);
    },
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);
      
      if (error) throw new Error(error.message);
      return appointmentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      setIsDeleteDialogOpen(false);
      setSelectedAppointment(null);
      toast.success('Consulta excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir consulta: ${error.message}`);
    },
  });

  const handleCreateAppointment = () => {
    createAppointmentMutation.mutate(formData);
  };

  const resetForm = () => {
    setDate(new Date());
    setTime("");
    setFormData({
      title: '',
      trainerName: '',
      description: '',
      duration: 60,
      userId: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Define columns for the appointments table
  const columns = [
    {
      accessorKey: 'title',
      header: 'Título',
      cell: ({ row }: { row: { original: any } }) => {
        if (isMobile) {
          const title = row.original.title || '';
          return title.length > 20 ? title.substring(0, 17) + '...' : title;
        }
        return row.original.title;
      }
    },
    {
      accessorKey: 'trainer_name',
      header: 'Personal Trainer',
      cell: ({ row }: { row: { original: any } }) => row.original.trainer_name
    },
    {
      accessorKey: 'appointment_date',
      header: 'Data/Hora',
      cell: ({ row }: { row: { original: any } }) => {
        const date = parseISO(row.original.appointment_date);
        return format(date, isMobile ? 'dd/MM HH:mm' : 'dd/MM/yyyy HH:mm', { locale: ptBR });
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: any } }) => {
        const status = row.original.status;
        let statusClass = "";
        let statusText = "";
        
        switch (status) {
          case 'scheduled':
            statusClass = "text-blue-600";
            statusText = "Agendado";
            break;
          case 'completed':
            statusClass = "text-green-600";
            statusText = "Concluído";
            break;
          case 'cancelled':
            statusClass = "text-red-600";
            statusText = "Cancelado";
            break;
          default:
            statusClass = "text-gray-600";
            statusText = status;
        }
        
        return (
          <span className={`${statusClass} ${isMobile ? "text-xs" : ""} font-medium`}>
            {statusText}
          </span>
        );
      }
    },
    {
      accessorKey: 'actions',
      header: 'Ações',
      cell: ({ row }: { row: { original: any } }) => (
        <Button
          variant="destructive"
          size={isMobile ? "sm" : "default"}
          className={isMobile ? "px-2 h-7 text-xs" : ""}
          onClick={() => {
            setSelectedAppointment(row.original);
            setIsDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }
  ];

  // Define which columns to show on mobile
  const mobileColumns = isMobile ? [
    columns[0], // Title
    columns[2], // Date/Time
    columns[3], // Status
    columns[4], // Actions
  ] : columns;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Gerenciamento de Consultas</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {!isMobile && "Nova Consulta"}
            </Button>
          </DialogTrigger>
          <DialogContent className={isMobile ? "w-[95vw]" : ""}>
            <DialogHeader>
              <DialogTitle>Agendar nova consulta</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título da consulta</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Avaliação física"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="trainerName">Nome do personal trainer</Label>
                <Input
                  id="trainerName"
                  name="trainerName"
                  value={formData.trainerName}
                  onChange={handleInputChange}
                  placeholder="Ex: João Silva"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label>Horário</Label>
                  <TimePicker 
                    value={time} 
                    onChange={setTime} 
                    disabledTimes={disabledTimes}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="30"
                  step="30"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="60"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="userId">ID do Usuário (opcional)</Label>
                <Input
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="ID do usuário (se aplicável)"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detalhes da consulta (opcional)"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateAppointment} 
                disabled={createAppointmentMutation.isPending || !date || !time || !formData.title || !formData.trainerName}
              >
                {createAppointmentMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Agendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader className={isMobile ? "px-3 py-2" : ""}>
          <CardTitle className={isMobile ? "text-base" : ""}>Consultas Agendadas</CardTitle>
          <CardDescription className={isMobile ? "text-xs" : ""}>
            Visualize e gerencie as consultas e agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "px-2 py-1" : ""}>
          <DataTable
            columns={mobileColumns}
            data={appointmentsData || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={isMobile ? "w-[95vw]" : ""}>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir a consulta{" "}
            <span className="font-bold">{selectedAppointment?.title}</span>?
          </p>
          <p className="text-red-600 text-sm">
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedAppointment && deleteAppointmentMutation.mutate(selectedAppointment.id)}
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentManagement;
