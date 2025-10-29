import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Package, 
  DollarSign, 
  TrendingUp,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';
import { ProductDialog } from '@/components/dialogs/ProductDialog';

const mockProdutos = [
  {
    id: 1,
    nome: 'Plano Basic',
    categoria: 'Serviços',
    preco: 99.90,
    estoque: 'Ilimitado',
    vendas: 142,
    status: 'Ativo',
  },
  {
    id: 2,
    nome: 'Plano Pro',
    categoria: 'Serviços',
    preco: 199.90,
    estoque: 'Ilimitado',
    vendas: 87,
    status: 'Ativo',
  },
  {
    id: 3,
    nome: 'Consultoria Premium',
    categoria: 'Consultoria',
    preco: 499.90,
    estoque: 'Sob demanda',
    vendas: 34,
    status: 'Ativo',
  },
  {
    id: 4,
    nome: 'Treinamento Corporativo',
    categoria: 'Treinamento',
    preco: 1499.90,
    estoque: 'Sob demanda',
    vendas: 12,
    status: 'Ativo',
  },
];

export default function Produtos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState(mockProdutos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const handleSaveProduct = (product: any) => {
    if (selectedProduct) {
      setProdutos(produtos.map(p => p.id === product.id ? product : p));
    } else {
      setProdutos([...produtos, product]);
    }
    setSelectedProduct(null);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos e Serviços</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          onClick={() => {
            setSelectedProduct(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Produtos</p>
              <p className="text-3xl font-bold text-foreground mt-1">24</p>
            </div>
            <Package className="w-10 h-10 text-primary" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-3xl font-bold text-foreground mt-1">R$ 45.2k</p>
            </div>
            <DollarSign className="w-10 h-10 text-success" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Vendas</p>
              <p className="text-3xl font-bold text-foreground mt-1">275</p>
            </div>
            <TrendingUp className="w-10 h-10 text-accent" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-3xl font-bold text-foreground mt-1">R$ 164</p>
            </div>
            <BarChart3 className="w-10 h-10 text-warning" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-semibold text-foreground">Produto</th>
                <th className="text-left p-4 font-semibold text-foreground">Categoria</th>
                <th className="text-left p-4 font-semibold text-foreground">Preço</th>
                <th className="text-left p-4 font-semibold text-foreground">Estoque</th>
                <th className="text-left p-4 font-semibold text-foreground">Vendas</th>
                <th className="text-left p-4 font-semibold text-foreground">Status</th>
                <th className="text-right p-4 font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProdutos.map((produto) => (
                <tr key={produto.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-foreground">{produto.nome}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">{produto.categoria}</Badge>
                  </td>
                  <td className="p-4 text-foreground font-semibold">
                    R$ {produto.preco.toFixed(2)}
                  </td>
                  <td className="p-4 text-muted-foreground">{produto.estoque}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-foreground">{produto.vendas}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className="bg-success text-success-foreground">
                      {produto.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditProduct(produto)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteProduct(produto.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
