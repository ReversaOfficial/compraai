import { Search, ShoppingCart, User, Menu, MapPin, LogIn, Heart, Bell, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { categories, products, stores } from '@/data/mock';
import NotificationBell from './NotificationBell';
import { supabase } from '@/integrations/supabase/client';
import defaultLogo from '@/assets/compraai-logo.png';

const Header = () => {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { lang, setLang, langs } = useLanguage();
  const { texts } = useSiteConfig();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<{ type: string; label: string; link: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLFormElement>(null);

  const langFlags: Record<string, string> = { 'pt-BR': '🇧🇷', en: '🇺🇸', de: '🇩🇪', fr: '🇫🇷' };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // Save recent search
      if (user) {
        supabase.from('recent_searches').insert({ user_id: user.id, query: search.trim() });
      }
      navigate(`/busca?q=${encodeURIComponent(search.trim())}`);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (search.trim().length < 2) { setSuggestions([]); return; }
    const q = search.toLowerCase();
    const prods = products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3).map(p => ({
      type: 'Produto', label: p.name, link: `/produto/${p.id}`,
    }));
    const strs = stores.filter(s => s.name.toLowerCase().includes(q)).slice(0, 2).map(s => ({
      type: 'Loja', label: s.name, link: `/loja/${s.id}`,
    }));
    const cats = categories.filter(c => c.name.toLowerCase().includes(q)).slice(0, 2).map(c => ({
      type: 'Categoria', label: c.name, link: `/busca?cat=${c.id}`,
    }));
    setSuggestions([...prods, ...strs, ...cats]);
  }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
          <img
            src={texts.logo_url || defaultLogo}
            alt={texts.site_name || 'Compra Aí'}
            className="rounded-xl object-contain"
            style={{ width: 60, height: 60 }}
          />
          <div className="hidden sm:block">
            <span className="text-xl font-extrabold tracking-tight">{texts.site_name || 'Compra Aí'}</span>
          </div>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-auto relative" ref={ref}>
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="O que você está procurando?"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => search.trim().length >= 2 && setShowSuggestions(true)}
              className="pl-11 h-11 rounded-full border-muted bg-secondary/60 focus:bg-white transition-colors"
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-xl shadow-lg z-50 overflow-hidden">
              {suggestions.map((s, i) => (
                <Link key={i} to={s.link}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors">
                  <Badge variant="secondary" className="text-[10px] shrink-0">{s.type}</Badge>
                  <span className="text-sm truncate">{s.label}</span>
                </Link>
              ))}
            </div>
          )}
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-base">
                <span>{langFlags[lang] || '🌐'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {langs.map(l => (
                <DropdownMenuItem key={l.value} onClick={() => setLang(l.value)}
                  className={lang === l.value ? 'bg-primary/10 font-semibold' : ''}>
                  <span className="mr-2">{langFlags[l.value]}</span> {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="md:hidden h-10 w-10" onClick={() => navigate('/busca')}>
            <Search className="h-5 w-5" />
          </Button>
          {user && <NotificationBell />}
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
