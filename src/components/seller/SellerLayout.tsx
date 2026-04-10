import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Settings, BarChart3, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';

const navItems = [
  { to: '/lojista', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/lojista/produtos', icon: Package, label: 'Produtos' },
  { to: '/lojista/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/lojista/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/lojista/configuracoes', icon: Settings, label: 'Configurações' },
];

const Sidebar = ({ mobile }: { mobile?: boolean }) => {
  const { pathname } = useLocation();
  return (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-60 border-r bg-card'}`}>
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
            <span className="text-sm font-bold text-primary-foreground">V</span>
          </div>
          <span className="font-bold">Vitrine</span>
          <span className="text-xs text-muted-foreground ml-auto">Lojista</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(n => (
          <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname === n.to ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        ))}
      </nav>
      {/* Plan usage */}
      <div className="p-4 border-t">
        <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium">Plano Premium</span>
            <span className="text-muted-foreground">45/100</span>
          </div>
          <Progress value={45} className="h-1.5" />
          <p className="text-xs text-muted-foreground">55 produtos restantes</p>
        </div>
      </div>
      <div className="p-3 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" asChild>
          <Link to="/"><LogOut className="h-4 w-4 mr-2" /> Sair</Link>
        </Button>
      </div>
    </div>
  );
};

const SellerLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen">
    <div className="hidden lg:block"><Sidebar /></div>
    <div className="flex-1 flex flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3 lg:hidden">
        <Sheet>
          <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
          <SheetContent side="left" className="p-0 w-60"><Sidebar mobile /></SheetContent>
        </Sheet>
        <span className="font-bold">Painel do Lojista</span>
      </header>
      <main className="flex-1 p-4 md:p-6 bg-background overflow-auto">{children}</main>
    </div>
  </div>
);

export default SellerLayout;
