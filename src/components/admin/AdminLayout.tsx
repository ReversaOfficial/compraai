import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Package, ShoppingBag, DollarSign, Image, Settings, LogOut, Menu, CreditCard, Star, Bell, Megaphone, Truck, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/lojistas', icon: Store, label: 'Lojas' },
  { to: '/admin/produtos', icon: Package, label: 'Produtos' },
  { to: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/admin/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/admin/planos', icon: CreditCard, label: 'Planos' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/pagamentos', icon: DollarSign, label: 'Pagamentos' },
  { to: '/admin/avaliacoes', icon: Star, label: 'Avaliações' },
  { to: '/admin/notificacoes', icon: Bell, label: 'Notificações' },
  { to: '/admin/popup', icon: Megaphone, label: 'Pop-up' },
  { to: '/admin/tabela-frete', icon: MapPin, label: 'Tabela de Frete' },
  { to: '/admin/freteiros', icon: Users, label: 'Freteiros' },
  { to: '/admin/entregas', icon: Truck, label: 'Entregas' },
  { to: '/admin/financeiro-freteiros', icon: DollarSign, label: 'Fin. Freteiros' },
  { to: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
];

const Sidebar = ({ mobile }: { mobile?: boolean }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const handleSignOut = () => { signOut(); navigate('/login'); };

  return (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-60 border-r bg-card'}`}>
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
            <span className="text-sm font-bold text-primary-foreground">C</span>
          </div>
          <span className="font-bold">Compra Aí</span>
          <Badge variant="destructive" className="ml-auto text-[10px] py-0">Admin</Badge>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(n => (
          <Link key={n.to} to={n.to}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname === n.to ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </Button>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen">
    <div className="hidden lg:block"><Sidebar /></div>
    <div className="flex-1 flex flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3 lg:hidden">
        <Sheet>
          <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="p-0 w-60"><Sidebar mobile /></SheetContent>
        </Sheet>
        <span className="font-bold">Admin</span>
      </header>
      <main className="flex-1 p-4 md:p-6 bg-background overflow-auto">{children}</main>
    </div>
  </div>
);

export default AdminLayout;
