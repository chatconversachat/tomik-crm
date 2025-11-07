import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Mail, Phone, MoreVertical, Pencil, Settings2 } from 'lucide-react';
import { LeadDialog } from '@/components/dialogs/LeadDialog';
import { StageDialog } from '@/components/dialogs/StageDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

const mockLeads = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 98765-4321',
    stage: 'Novo',
    value: 'R$ 5.000',
    source: 'WhatsApp',
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(21) 99876-5432',
    stage: 'Qualificado',
    value: 'R$ 12.000',
    source: 'Facebook',
  },
  {
    id: 3,
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    phone: '(31) 97654-3210',
    stage: 'Proposta',
    value: 'R$ 8.500',
    source: 'Instagram',
  },
];

interface Stage {
  id: string;
  name: string;
  color: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  stage: string;
  value: string;
  source: string;
}

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: number) => void;
}

function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card rounded-lg border p-4 space-y-3 cursor-move",
        isDragging && "opacity-50"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-foreground">{lead.name}</h4>
          <p className="text-sm font-semibold text-accent mt-1">{lead.value}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(lead); }}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }} 
              className="text-destructive"
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Mail className="w-4 h-4 mr-2" />
          {lead.email}
        </div>
        <div className="flex items-center text-muted-foreground">
          <Phone className="w-4 h-4 mr-2" />
          {lead.phone}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Origem: {lead.source}
      </div>
    </div>
  );
}

export default function CRM() {
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  
  const [stages, setStages] = useState<Stage[]>([
    { id: 'novo', name: 'Novo', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    { id: 'qualificado', name: 'Qualificado', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    { id: 'proposta', name: 'Proposta', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    { id: 'fechado', name: 'Fechado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find(l => l.id === event.active.id);
    setActiveLead(lead || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const leadId = active.id as number;
    const newStage = over.id as string;

    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, stage: newStage } : lead
    ));
  };

  const handleSaveLead = (lead: Lead) => {
    if (selectedLead) {
      setLeads(leads.map(l => l.id === lead.id ? lead : l));
    } else {
      setLeads([...leads, { ...lead, id: Date.now() }]);
    }
    setSelectedLead(null);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  };

  const handleDeleteLead = (id: number) => {
    setLeads(leads.filter(l => l.id !== id));
  };

  const handleSaveStages = (newStages: Stage[]) => {
    setStages(newStages);
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLeadsByStage = (stageName: string) => {
    return filteredLeads.filter(lead => lead.stage === stageName);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus leads e clientes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setStageDialogOpen(true)}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Gerenciar Etapas
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={() => {
              setSelectedLead(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total de Leads</div>
          <div className="text-2xl font-bold text-foreground mt-1">248</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Qualificados</div>
          <div className="text-2xl font-bold text-foreground mt-1">142</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Em Proposta</div>
          <div className="text-2xl font-bold text-foreground mt-1">56</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Fechados</div>
          <div className="text-2xl font-bold text-foreground mt-1">89</div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.name);
            
            return (
              <Card key={stage.id} className="flex flex-col h-[calc(100vh-320px)]">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={stage.color}>
                      {stage.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                <SortableContext
                  id={stage.name}
                  items={stageLeads.map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onEdit={handleEditLead}
                        onDelete={handleDeleteLead}
                      />
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        Arraste leads para cá
                      </div>
                    )}
                  </div>
                </SortableContext>
              </Card>
            );
          })}
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="bg-card rounded-lg border p-4 shadow-lg rotate-3">
              <h4 className="font-semibold text-foreground">{activeLead.name}</h4>
              <p className="text-sm text-muted-foreground">{activeLead.email}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <LeadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lead={selectedLead}
        onSave={handleSaveLead}
      />

      <StageDialog
        open={stageDialogOpen}
        onOpenChange={setStageDialogOpen}
        stages={stages}
        onSave={handleSaveStages}
      />
    </div>
  );
}
