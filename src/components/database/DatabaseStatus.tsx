import { Card } from '@/components/ui/card';
import { Database, ShieldAlert, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

interface DatabaseStatusProps {
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  schemaStatus: 'idle' | 'checking' | 'updating' | 'updated' | 'error';
  currentSchemaVersion: string | null;
}

export function DatabaseStatus({ connectionStatus, schemaStatus, currentSchemaVersion }: DatabaseStatusProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Status do Sistema</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          {connectionStatus === 'connected' ? (
            <ShieldCheck className="w-5 h-5 text-success" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-warning" />
          )}
          <div>
            <p className="text-sm text-muted-foreground">Conexão</p>
            <p className="font-semibold">
              {connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          {schemaStatus === 'updated' ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <AlertCircle className="w-5 h-5 text-warning" />
          )}
          <div>
            <p className="text-sm text-muted-foreground">Esquema</p>
            <p className="font-semibold">
              {schemaStatus === 'updated' ? 'Atualizado' : 'Pendente'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          <Database className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Versão</p>
            <p className="font-semibold">
              {currentSchemaVersion || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}