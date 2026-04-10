import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import SellerLayout from '@/components/seller/SellerLayout';
import { products, categories } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const storeProducts = products.filter(p => p.storeId === 's1' || p.storeId === 's2');

const SellerProducts = () => {
  const [search, setSearch] = useState('');
  const filtered = storeProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-full"><Plus className="h-4 w-4 mr-2" /> Novo Produto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Cadastrar Produto</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome</Label><Input placeholder="Nome do produto" /></div>
                <div><Label>Descrição</Label><Textarea placeholder="Descreva o produto" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Preço</Label><Input type="number" placeholder="0,00" /></div>
                  <div><Label>Preço Promocional</Label><Input type="number" placeholder="0,00" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Estoque</Label><Input type="number" placeholder="0" /></div>
                </div>
                <div><Label>Imagem (URL)</Label><Input placeholder="https://..." /></div>
                <Button className="w-full">Cadastrar Produto</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Produto</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Categoria</th>
                  <th className="text-right p-3 font-medium">Preço</th>
                  <th className="text-center p-3 font-medium hidden sm:table-cell">Estoque</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                        <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{p.category}</td>
                    <td className="p-3 text-right font-medium">{fmt(p.promoPrice || p.price)}</td>
                    <td className="p-3 text-center hidden sm:table-cell">
                      <span className={p.stock < 5 ? 'text-destructive font-medium' : ''}>{p.stock}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={`border-0 text-xs ${p.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {p.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem>{p.isActive ? <><EyeOff className="h-4 w-4 mr-2" /> Desativar</> : <><Eye className="h-4 w-4 mr-2" /> Ativar</>}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerProducts;
