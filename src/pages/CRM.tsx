import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Mail, Phone, MoreVertical, Pencil, Settings2, Trash2 } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  stage_id: string;
  value: number | null;
  source: string | null;
  description: string | null;
}

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
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
        "bg-card rounded-lg border p-4 space-y-3 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-foreground">{lead.name}</h4>
          {lead.value && (
            <p className="text-sm font-semibold text-accent mt-1">
              R$ {lead.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
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
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 text-sm">
        {lead.email && (
          <div className="flex items-center text-muted-foreground">
            <Mail className="w-4 h-4 mr-2" />
            {lead.email}
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center text-muted-foreground">
            <Phone className="w-4 h-4 mr-2" />
            {lead.phone}
          </div>
        )}
      </div>

      {lead.source && (
        <div className="text-xs text-muted-foreground">
          Origem: {lead.source}
        </div>
      )}
    </div>
  );
}

export default function CRM() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    loadStages();
    loadLeads();
  }, []);

  const loadStages = async () => {
    const { data, error } = await supabase.from('stages').select('*').order('order');
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar etapas', variant: 'destructive' });
    } else {
      setStages(data || []);
    }
  };

  const loadLeads = async () => {
    const { data, error } = await supabase.from('leads').select('*');
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar leads', variant: 'destructive' });
    } else {
      setLeads(data || []);
    }
  };

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over || active.id === over.id) return;

    const leadId = active.id as string;
    const newStageId = over.id as string;

    const { error } = await supabase
      .from('leads')
      .update({ stage_id: newStageId })
      .eq('id', leadId);

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar estágio do lead', variant: 'destructive' });
    } else {
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, stage_id: newStageId } : lead
        )
      );
      toast({ title: 'Sucesso', description: 'Estágio do lead atualizado!' });
    }
  };

  const handleSaveLead = async (lead: Lead) => {
    let result;
    if (selectedLead) {
      result = await supabase.from('leads').update(lead).eq('id', lead.id);
    } else {
      result = await supabase.from('leads').insert([lead]);
    }

    if (result.error) {
      toast({ title: 'Erro', description: `Erro ao salvar lead: ${result.error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: `Lead ${selectedLead ? 'atualizado' : 'criado'} com sucesso.` });
      loadLeads();
      setDialogOpen(false);
      setSelectedLead(null);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDialogOpen(true);
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao excluir lead', variant: 'destructive' });
      } else {
        toast({ title: 'Sucesso', description: 'Lead excluído com sucesso.' });
        loadLeads();
      }
    }
  };

  const handleSaveStages = async (newStages: Stage[]) => {
    // Delete removed stages
    const removedStageIds = stages.filter(s => !newStages.some(ns => ns.id === s.id)).map(s => s.id);
    if (removedStageIds.length > 0) {
      const { error } = await supabase.from('stages').delete().in('id', removedStageIds);
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao excluir etapas antigas', variant: 'destructive' });
        return;
      }
    }

    // Upsert (insert/update) remaining stages
    const { error } = await supabase.from('stages').upsert(newStages, { onConflict: 'id' });
    if (error) {
      toast({ title: 'Erro', description: `Erro ao salvar etapas: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Etapas atualizadas com sucesso!' });
      loadStages();
      setStageDialogOpen(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (lead.phone && lead.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getLeadsByStage = (stageId: string) => {
    return filteredLeads.filter(lead => lead.stage_id === stageId);
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
          <div className="text-2xl font-bold text-foreground mt-1">{leads.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Qualificados</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {leads.filter(l => stages.find(s => s.id === l.stage_id)?.name === 'Qualificado').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Em Proposta</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {leads.filter(l => stages.find(s => s.id === l.stage_id)?.name === 'Proposta').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Fechados</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {leads.filter(l => stages.find(s => s.id === l.stage_id)?.name === 'Fechado').length}
          </div>
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
            const stageLeads = getLeadsByStage(stage.id);
            
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
                  id={stage.id}
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