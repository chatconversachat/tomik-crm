import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Play, CheckCircle } from 'lucide-react';
import { Database } from 'lucide-react';

interface SchemaManagerProps {
  isConnected: boolean;
  schemaStatus: 'idle' | 'checking' | 'updating' | 'updated' | 'error';
  missingTables: string[];
  schemaLog: string[];
  onCheckSchema: () => void;
  onUpdateSchema: () => void;
}

export function SchemaManager({ 
  isConnected, 
  schemaStatus, 
  missingTables, 
  schemaLog,
  onCheckSchema,
  onUpdateSchema
}: SchemaManagerProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Gerenciamento de Esquema</h2>
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={onCheckSchema}
            disabled={!isConnected || schemaStatus === 'checking' || schemaStatus === 'updating'}
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Verificar Esquema
          </Button>
          
          <Button 
            onClick={onUpdateSchema}
            disabled={!isConnected || missingTables.length === 0 || schemaStatus === 'updating'}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Play className="w-4 h-4 mr-2" />
            Atualizar Esquema
          </Button>
        </div>
        
        {schemaLog.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Log de Operações:</h3>
            <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
              {schemaLog.map((log, index) => (
                <div key={index} className="text-sm py-1 border-b border-muted-foreground/10 last:border-0">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {missingTables.length > 0 && (
          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <h3 className="font-medium text-warning mb-2">Tabelas Faltando:</h3>
            <div className="flex flex-wrap gap-2">
              {missingTables.map((table) => (
                <span 
                  key={table} 
                  className="px-2 py-1 bg-warning text-warning-foreground text-xs rounded"
                >
                  {table}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {schemaStatus === 'updated' && (
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-success">Esquema Atualizado</span>
            </div>
            <p className="text-sm text-success/80 mt-1">
              Todas as tabelas necessárias estão presentes no banco de dados.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}