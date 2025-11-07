import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  color: string;
}

interface StageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: Stage[];
  onSave: (stages: Stage[]) => void;
}

export function StageDialog({ open, onOpenChange, stages, onSave }: StageDialogProps) {
  const [editedStages, setEditedStages] = useState<Stage[]>(stages);

  const handleAddStage = () => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: 'Nova Etapa',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    setEditedStages([...editedStages, newStage]);
  };

  const handleRemoveStage = (id: string) => {
    setEditedStages(editedStages.filter(s => s.id !== id));
  };

  const handleUpdateStage = (id: string, field: keyof Stage, value: string) => {
    setEditedStages(editedStages.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleSave = () => {
    onSave(editedStages);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background">
        <DialogHeader>
          <DialogTitle>Gerenciar Etapas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {editedStages.map((stage) => (
            <div key={stage.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
              
              <div className="flex-1 space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome da Etapa</Label>
                  <Input
                    value={stage.name}
                    onChange={(e) => handleUpdateStage(stage.id, 'name', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Classes de Cor (Tailwind)</Label>
                  <Input
                    value={stage.color}
                    onChange={(e) => handleUpdateStage(stage.id, 'color', e.target.value)}
                    className="mt-1"
                    placeholder="bg-blue-100 text-blue-800"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveStage(stage.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddStage}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Etapa
          </Button>
        </div>

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
