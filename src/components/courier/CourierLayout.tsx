import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, History, DollarSign, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/freteiro', label: 'Entregas Disponíveis', icon: Package },
  { to: '/freteiro/historico', label: 'Histórico', icon: History },
  { to: '/freteiro/ganhos', label: 'Ganhos', icon: DollarSign },
  { to: '/freteiro/perfil', label: 'Meu Perfil', icon: User },
];

const CourierLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [courierName, setCourierName] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('couriers').select('name').eq('user_id', user.id).maybeSingle();
      if (data) setCourierName(data.name);
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link to="/freteiro" className="font-bold text-lg text-primary">🚚 Painel Freteiro</Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">{courierName}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed md:sticky top-14 left-0 z-20 h-[calc(100vh-3.5rem)] w-60 border-r bg-background transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}>
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
                  className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay */}
        {open && <div className="fixed inset-0 z-10 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 max-w-5xl">{children}</main>
      </div>
    </div>
  );
};

export default CourierLayout;
