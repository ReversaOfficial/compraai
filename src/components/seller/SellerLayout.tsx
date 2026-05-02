import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Settings, LogOut, Menu, CreditCard, AlertCircle, Megaphone, Truck, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { useAuth, SellerProfile } from '@/contexts/AuthContext';
import { usePlans } from '@/contexts/PlansContext';

const navItems = [
  { to: '/lojista', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/lojista/produtos', icon: Package, label: 'Produtos' },
  { to: '/lojista/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/lojista/entregas', icon: Truck, label: 'Entregas & Frete' },
  { to: '/lojista/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/lojista/repasses', icon: Banknote, label: 'Dados de Repasse' },
  { to: '/lojista/midia', icon: Megaphone, label: 'Mídia & Publicidade' },
  { to: '/lojista/planos', icon: CreditCard, label: 'Meu Plano' },
  { to: '/lojista/configuracoes', icon: Settings, label: 'Configurações' },
];

const Sidebar = ({ mobile }: { mobile?: boolean }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { getPlan } = usePlans();
  const seller = user as SellerProfile;
  const plan = seller ? getPlan(seller.plan_id) : null;
  const productCount = 0; // TODO: connect to real product count
  const pct = plan ? Math.round((productCount / seller.plan_limit) * 100) : 0;
  const nearLimit = pct >= 80;

  const handleSignOut = () => { signOut(); navigate('/'); };

  return (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-60 border-r bg-card'}`}>
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
            <span className="text-sm font-bold text-primary-foreground">C</span>
          </div>
          <span className="font-bold">Compra Aí</span>
          <span className="text-xs text-muted-foreground ml-auto">Lojista</span>
        </Link>
        {seller && (
          <div className="mt-2 text-xs text-muted-foreground truncate">{seller.store_name}</div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(n => (
          <Link key={n.to} to={n.to}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              pathname === n.to ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted'
            }`}>
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        ))}
      </nav>

      {/* Plan usage */}
      {seller && (
        <div className="p-4 border-t">
          <Link to="/lojista/planos" className={`block rounded-lg p-3 space-y-2 transition-colors ${nearLimit ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950' : 'bg-secondary/50 hover:bg-secondary'}`}>
            <div className="flex justify-between text-xs items-center">
              <span className="font-medium">{plan?.name ?? seller.plan_id}</span>
              <span className={nearLimit ? 'text-amber-600 font-bold' : 'text-muted-foreground'}>
                {productCount}/{seller.plan_limit}
              </span>
            </div>
            <Progress value={pct} className="h-1.5" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{seller.plan_limit - productCount} restantes</p>
              {nearLimit && <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
            </div>
          </Link>
        </div>
      )}

      <div className="p-3 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sair
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
