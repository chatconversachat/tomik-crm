import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Mail, Phone, MoreVertical } from 'lucide-react';

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

const stageColors: Record<string, string> = {
  'Novo': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Qualificado': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Proposta': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Fechado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export default function CRM() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus leads e clientes</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
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

      {/* Leads Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contato</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Stage</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Valor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Origem</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{lead.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 mr-2" />
                        {lead.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2" />
                        {lead.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={stageColors[lead.stage]}>
                      {lead.stage}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{lead.value}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground">{lead.source}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
