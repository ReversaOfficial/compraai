import AdminLayout from '@/components/admin/AdminLayout';
import { stores } from '@/data/mock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle, Edit } from 'lucide-react';

const AdminStores = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestão de Lojistas</h1>
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Loja</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Categoria</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Plano</th>
              <th className="text-center p-3 font-medium hidden md:table-cell">Produtos</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stores.map(s => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{s.name.charAt(0)}</div>
                    <div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.address}</p></div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground hidden sm:table-cell">{s.category}</td>
                <td className="p-3 hidden md:table-cell"><Badge variant="secondary" className="capitalize text-xs">{s.plan}</Badge></td>
                <td className="p-3 text-center hidden md:table-cell">{s.productsCount}/{s.planLimit}</td>
                <td className="p-3 text-center">
                  <Badge className={`border-0 text-xs ${s.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {s.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem><CheckCircle className="h-4 w-4 mr-2" /> Aprovar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><XCircle className="h-4 w-4 mr-2" /> Bloquear</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
);

export default AdminStores;
