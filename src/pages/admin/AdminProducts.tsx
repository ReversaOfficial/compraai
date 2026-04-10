import AdminLayout from '@/components/admin/AdminLayout';
import { products } from '@/data/mock';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const AdminProducts = () => {
  const [search, setSearch] = useState('');
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.storeName.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por produto ou loja..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Produto</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Loja</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Categoria</th>
                <th className="text-right p-3 font-medium">Preço</th>
                <th className="text-center p-3 font-medium">Status</th>
              </tr></thead>
              <tbody className="divide-y">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="p-3"><div className="flex items-center gap-3"><img src={p.image} alt="" className="h-9 w-9 rounded-lg object-cover" /><span className="font-medium truncate max-w-[180px]">{p.name}</span></div></td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{p.storeName}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{p.category}</td>
                    <td className="p-3 text-right font-medium">{fmt(p.promoPrice || p.price)}</td>
                    <td className="p-3 text-center"><Badge className={`border-0 text-xs ${p.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{p.isActive ? 'Ativo' : 'Inativo'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
