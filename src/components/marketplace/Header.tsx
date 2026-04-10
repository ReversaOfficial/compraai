import { Search, ShoppingCart, User, Menu, MapPin, LogIn, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { categories } from '@/data/mock';

const Header = () => {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/busca?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      {/* Top bar */}
      <div className="bg-primary">
        <div className="container flex items-center justify-center py-2 text-xs text-white font-medium tracking-wide">
          <span>🚚 Frete grátis acima de R$ 150 · Entrega e retirada na sua cidade</span>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex items-center gap-4 py-3.5">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="mt-8 flex flex-col gap-2">
              <Link to="/" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">Início</Link>
              <Link to="/produtos" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">Produtos</Link>
              <div className="my-2 border-t" />
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categorias</p>
              {categories.map(c => (
                <Link key={c.id} to={`/busca?cat=${c.id}`} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                  {c.icon} {c.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero shadow-sm">
            <span className="text-lg font-extrabold text-white">C</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-extrabold tracking-tight">Compra Aí</span>
          </div>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="O que você está procurando?"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-11 h-11 rounded-full border-muted bg-secondary/60 focus:bg-white transition-colors"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="md:hidden h-10 w-10" onClick={() => navigate('/busca')}>
            <Search className="h-5 w-5" />
          </Button>
          {user ? (
            <Button variant="ghost" size="sm" className="gap-2 text-sm h-10 rounded-full px-4 hover:bg-primary/5" asChild>
              <Link to={user.role === 'seller' ? '/lojista' : '/conta'}>
                <User className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">{user.role === 'seller' ? 'Painel' : 'Conta'}</span>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="gap-2 text-sm h-10 rounded-full px-4" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Entrar</span>
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative h-10 w-10" asChild>
            <Link to="/carrinho">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-accent text-white border-2 border-card font-bold">
                  {itemCount}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Categories bar */}
      <div className="hidden lg:block border-t">
        <div className="container">
          <nav className="flex items-center gap-8 py-2.5 text-sm">
            <Link to="/produtos" className="font-semibold text-foreground hover:text-primary transition-colors">Todos</Link>
            {categories.slice(0, 7).map(c => (
              <Link key={c.id} to={`/busca?cat=${c.id}`} className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap font-medium">
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
