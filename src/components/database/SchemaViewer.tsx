import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { TABLE_DEFINITIONS } from './SchemaDefinitions';

export function SchemaViewer() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Definição das Tabelas</h2>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(TABLE_DEFINITIONS).map(([tableName, definition]) => (
          <div key={tableName} className="border rounded-lg">
            <div className="p-3 bg-muted border-b">
              <h3 className="font-mono font-semibold">{tableName}</h3>
            </div>
            <div className="p-3">
              <pre className="text-xs overflow-x-auto">
                {definition.trim()}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}