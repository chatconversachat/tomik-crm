import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface StageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: Stage[];
  onSave: (stages: Stage[]) => void;
}

interface SortableStageItemProps {
  stage: Stage;
  onUpdate: (id: string, field: keyof Stage, value: string | number) => void;
  onRemove: (id: string) => void;
}

function SortableStageItem({ stage, onUpdate, onRemove }: SortableStageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg bg-card"
    >
      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="flex-1 space-y-2">
        <div>
          <Label className="text-xs text-muted-foreground">Nome da Etapa</Label>
          <Input
            value={stage.name}
            onChange={(e) => onUpdate(stage.id, 'name', e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground">Classes de Cor (Tailwind)</Label>
          <Input
            value={stage.color}
            onChange={(e) => onUpdate(stage.id, 'color', e.target.value)}
            className="mt-1"
            placeholder="bg-blue-100 text-blue-800"
          />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(stage.id)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function StageDialog({ open, onOpenChange, stages, onSave }: StageDialogProps) {
  const [editedStages, setEditedStages] = useState<Stage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Ensure stages have an 'order' property when loaded
    setEditedStages(stages.map((s, index) => ({ ...s, order: s.order ?? index })));
  }, [stages, open]);

  const handleAddStage = () => {
    const newStage: Stage = {
      id: crypto.randomUUID(),
      name: 'Nova Etapa',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      order: editedStages.length,
    };
    setEditedStages([...editedStages, newStage]);
  };

  const handleRemoveStage = (id: string) => {
    setEditedStages(editedStages.filter(s => s.id !== id));
  };

  const handleUpdateStage = (id: string, field: keyof Stage, value: string | number) => {
    setEditedStages(editedStages.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setEditedStages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        const newOrderedItems = Array.from(items);
        const [movedItem] = newOrderedItems.splice(oldIndex, 1);
        newOrderedItems.splice(newIndex, 0, movedItem);

        // Update order property
        return newOrderedItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const handleSave = () => {
    if (editedStages.some(s => !s.name.trim())) {
      toast({ title: 'Erro', description: 'Nomes das etapas não podem ser vazios.', variant: 'destructive' });
      return;
    }
    onSave(editedStages);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background">
        <DialogHeader>
          <DialogTitle>Gerenciar Etapas</DialogTitle>
        </DialogHeader>
        
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={editedStages.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {editedStages.map((stage) => (
                <SortableStageItem
                  key={stage.id}
                  stage={stage}
                  onUpdate={handleUpdateStage}
                  onRemove={handleRemoveStage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={handleAddStage}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Etapa
        </Button>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}