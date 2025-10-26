import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Plus } from 'lucide-react';

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
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua agenda</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Calendário</h2>
          <div className="space-y-4">
            <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Segunda</span>
                <Badge className="bg-primary/10 text-primary">4</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Terça</span>
                <Badge className="bg-primary/10 text-primary">6</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quarta</span>
                <Badge className="bg-primary/10 text-primary">8</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Próximos Agendamentos</h2>
          <div className="space-y-4">
            {mockAppointments.map((appointment) => (
              <Card key={appointment.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
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
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(appointment.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        {appointment.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Ver</Button>
                    <Button size="sm" variant="outline">Editar</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
