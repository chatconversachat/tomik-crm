import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, Plus, Settings } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { AppointmentDialog } from '@/components/dialogs/AppointmentDialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DayContentProps } from 'react-day-picker';

const mockAppointments = [
  {
    id: 1,
    client: 'João Silva',
    collaborator: 'Dr. Maria Santos',
    date: '2025-10-26',
    time: '10:00',
    type: 'Consulta',
    status: 'Confirmado',
  },
  {
    id: 2,
    client: 'Ana Costa',
    collaborator: 'Dr. Pedro Oliveira',
    date: '2025-10-26',
    time: '14:30',
    type: 'Retorno',
    status: 'Pendente',
  },
  {
    id: 3,
    client: 'Carlos Mendes',
    collaborator: 'Dr. Maria Santos',
    date: '2025-10-27',
    time: '09:00',
    type: 'Exame',
    status: 'Confirmado',
  },
];

const statusColors: Record<string, string> = {
  'Confirmado': 'bg-success/10 text-success',
  'Pendente': 'bg-warning/10 text-warning',
  'Cancelado': 'bg-destructive/10 text-destructive',
  'Realizado': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

export default function Agendamentos() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [calendarType, setCalendarType] = useState<'system' | 'google'>('system');
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get appointments count by date
  const appointmentsByDate = appointments.reduce((acc, apt) => {
    const dateKey = apt.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(apt);
    return acc;
  }, {} as Record<string, typeof appointments>);

  // Custom day renderer with appointment count badge
  const renderDay = (props: DayContentProps) => {
    const dateKey = props.date.toISOString().split('T')[0];
    const dayAppointments = appointmentsByDate[dateKey] || [];
    const count = dayAppointments.length;

    if (count === 0) {
      return <div className="relative w-full h-full flex items-center justify-center">{props.date.getDate()}</div>;
    }

    return (
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className="relative w-full h-full flex items-center justify-center cursor-pointer">
            {props.date.getDate()}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center justify-center shadow-sm">
              {count}
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-3" side="top">
          <div className="space-y-2">
            <p className="font-semibold text-sm text-foreground mb-2">
              Agendamentos - {props.date.toLocaleDateString('pt-BR')}
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {dayAppointments.map((apt) => (
                <div key={apt.id} className="text-xs border-l-2 border-accent pl-2 py-1">
                  <div className="font-medium text-foreground">{apt.time} - {apt.client}</div>
                  <div className="text-muted-foreground">{apt.collaborator}</div>
                  <Badge className={cn("mt-1", statusColors[apt.status])} variant="outline">
                    {apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  const handleSaveAppointment = (appointment: any) => {
    if (selectedAppointment) {
      setAppointments(appointments.map(a => a.id === appointment.id ? appointment : a));
    } else {
      setAppointments([...appointments, appointment]);
    }
    setSelectedAppointment(null);
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
  };

  const handleSaveCalendarConfig = () => {
    if (calendarType === 'google' && !googleCalendarUrl) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira a URL do Google Calendar',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Sucesso',
      description: 'Configurações do calendário salvas com sucesso!',
    });
    setConfigOpen(false);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua agenda</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setConfigOpen(!configOpen)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar Calendário
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={() => {
              setSelectedAppointment(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Calendar Configuration */}
      <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
        <CollapsibleContent>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Configurações do Calendário</h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Tipo de Calendário</Label>
                <RadioGroup value={calendarType} onValueChange={(value: any) => setCalendarType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="cursor-pointer font-normal">
                      Calendário do Sistema
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="google" id="google" />
                    <Label htmlFor="google" className="cursor-pointer font-normal">
                      Google Calendar (Incorporado)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {calendarType === 'google' && (
                <div className="space-y-2">
                  <Label htmlFor="googleUrl">URL de Incorporação do Google Calendar</Label>
                  <Input
                    id="googleUrl"
                    value={googleCalendarUrl}
                    onChange={(e) => setGoogleCalendarUrl(e.target.value)}
                    placeholder="https://calendar.google.com/calendar/embed?src=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Para obter a URL: Abra seu Google Calendar → Configurações → Configurações do calendário → 
                    Integrar calendário → Copie o código iframe e cole aqui a URL do src
                  </p>
                </div>
              )}

              <Button onClick={handleSaveCalendarConfig} className="w-full">
                Salvar Configurações
              </Button>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Hoje</div>
          <div className="text-2xl font-bold text-foreground mt-1">8</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Esta Semana</div>
          <div className="text-2xl font-bold text-foreground mt-1">32</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Confirmados</div>
          <div className="text-2xl font-bold text-success mt-1">24</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pendentes</div>
          <div className="text-2xl font-bold text-warning mt-1">8</div>
        </Card>
      </div>

      {/* Calendar View */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Calendar Section */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Calendário</h2>
            <div className="flex justify-center py-8">
              {calendarType === 'google' && googleCalendarUrl ? (
                <div className="w-full max-w-3xl">
                  <iframe
                    src={googleCalendarUrl}
                    className="w-full h-[500px] border-0 rounded-lg"
                    title="Google Calendar"
                  />
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    components={{
                      DayContent: renderDay
                    }}
                    className={cn("rounded-md border pointer-events-auto")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Appointments List */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Agendamentos {selectedDate && `- ${selectedDate.toLocaleDateString('pt-BR')}`}
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {appointments.filter(appointment => {
                if (!selectedDate) return true;
                const appointmentDate = new Date(appointment.date);
                return appointmentDate.toDateString() === selectedDate.toDateString();
              }).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento para esta data
                </div>
              ) : (
                appointments.filter(appointment => {
                  if (!selectedDate) return true;
                  const appointmentDate = new Date(appointment.date);
                  return appointmentDate.toDateString() === selectedDate.toDateString();
                }).map((appointment) => (
                  <Card key={appointment.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{appointment.client}</h3>
                          <Badge variant="outline">{appointment.type}</Badge>
                          <Badge className={statusColors[appointment.status]}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="w-4 h-4 mr-2" />
                            {appointment.collaborator}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {new Date(appointment.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={selectedAppointment}
        onSave={handleSaveAppointment}
      />
    </div>
  );
}
