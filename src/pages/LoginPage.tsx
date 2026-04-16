import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, ShoppingBag, Store, ShieldCheck, User, Truck } from 'lucide-react';
import { checkRateLimit, clearRateLimit, sanitizeText } from '@/lib/security';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido').max(255, 'E-mail muito longo'),
  password: z.string().min(1, 'Senha obrigatória').max(200, 'Senha muito longa'),
});
const adminSchema = z.object({
  login: z.string().trim().min(1, 'Login obrigatório').max(60, 'Login muito longo'),
  password: z.string().min(1, 'Senha obrigatória').max(200, 'Senha muito longa'),
});

const RATE_LIMIT = { max: 5, windowMs: 60_000 }; // 5 attempts per minute

type Tab = 'customer' | 'seller' | 'admin' | 'courier';

const LoginPage = () => {
  const [tab, setTab] = useState<Tab>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInCustomer, signInSeller, signInAdmin } = useAuth();
  const navigate = useNavigate();

  const handleCustomerSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const rl = checkRateLimit({ key: `login_${tab}`, ...RATE_LIMIT });
    if (!rl.allowed) { toast.error(`Muitas tentativas. Tente novamente em ${rl.retryAfter}s.`); return; }
    setLoading(true);
    const { error } = tab === 'customer'
      ? await signInCustomer(parsed.data.email, parsed.data.password)
      : await signInSeller(parsed.data.email, parsed.data.password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    clearRateLimit(`login_${tab}`);
    toast.success('Bem-vindo de volta!');
    navigate(tab === 'customer' ? '/conta' : '/lojista');
  };

  const handleCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const rl = checkRateLimit({ key: 'login_courier', ...RATE_LIMIT });
    if (!rl.allowed) { toast.error(`Muitas tentativas. Tente novamente em ${rl.retryAfter}s.`); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setLoading(false);
    if (error) { toast.error('E-mail ou senha inválidos'); return; }
    // Check if user is a registered courier
    const { data: courier } = await supabase.from('couriers').select('id').eq('user_id', data.user.id).maybeSingle();
    if (!courier) {
      toast.error('Você não está cadastrado como freteiro. Crie sua conta primeiro.');
      await supabase.auth.signOut();
      return;
    }
    clearRateLimit('login_courier');
    toast.success('Bem-vindo, freteiro!');
    navigate('/freteiro');
  };

  const handleAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = adminSchema.safeParse({ login: adminLogin, password: adminPass });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    // Stricter rate limit for admin
    const rl = checkRateLimit({ key: 'login_admin', max: 3, windowMs: 60_000 });
    if (!rl.allowed) { toast.error(`Muitas tentativas. Tente novamente em ${rl.retryAfter}s.`); return; }
    setLoading(true);
    const { error } = await signInAdmin(parsed.data.login, parsed.data.password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    clearRateLimit('login_admin');
    toast.success('Acesso administrativo concedido!');
    navigate('/admin');
  };

  const tabStyle = (active: boolean, base: string) =>
    `flex items-center gap-1 flex-1 justify-center rounded-md py-2 text-xs font-medium transition-all ${active ? base : 'text-muted-foreground hover:text-foreground'}`;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'customer', label: 'Cliente', icon: ShoppingBag },
    { key: 'seller', label: 'Lojista', icon: Store },
    { key: 'courier', label: 'Freteiro', icon: Truck },
    { key: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  const showEmailForm = tab === 'customer' || tab === 'seller' || tab === 'courier';

  const hints: Record<string, { bg: string; text: string }> = {
    customer: { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800', text: '🛍️ Acesse sua conta para acompanhar pedidos e gerenciar seus dados.' },
    seller: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800', text: '🏪 Acesse o painel da sua loja para gerenciar produtos e pedidos.' },
    courier: { bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800', text: '🚚 Acesse o painel de entregas para ver corridas disponíveis e seus ganhos.' },
  };

  const signupLinks: Record<string, { to: string; label: string }> = {
    customer: { to: '/cadastro', label: 'Criar conta' },
    seller: { to: '/cadastro-lojista', label: 'Cadastrar loja' },
    courier: { to: '/freteiro/cadastro', label: 'Quer ser freteiro? Crie sua conta' },
  };

  return (
    <MarketplaceLayout>
      <div className="container flex items-center justify-center py-16 min-h-[70vh]">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero">
                <LogIn className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>Escolha seu tipo de acesso</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Tab Bar */}
            <div className="flex bg-muted rounded-lg p-1 mb-6 gap-1">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={tabStyle(tab === t.key, 'bg-white shadow-sm text-foreground dark:bg-card')}>
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>

            {/* Email-based forms */}
            {showEmailForm && (
              <>
                <div className={`rounded-lg p-3 mb-5 text-sm border ${hints[tab].bg}`}>
                  {hints[tab].text}
                </div>
                <form onSubmit={tab === 'courier' ? handleCourier : handleCustomerSeller} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-email" type="email" placeholder="seu@email.com" value={email}
                        onChange={e => setEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-pass">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-pass" type="password" placeholder="••••••••" value={password}
                        onChange={e => setPassword(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-full" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Não tem conta?{' '}
                  <Link to={signupLinks[tab].to} className="text-primary font-medium hover:underline">
                    {signupLinks[tab].label}
                  </Link>
                </p>
              </>
            )}

            {/* Admin */}
            {tab === 'admin' && (
              <>
                <div className="rounded-lg p-3 mb-5 text-sm border bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">
                  🔐 Acesso restrito ao administrador geral da plataforma.
                </div>
                <form onSubmit={handleAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-login">Login</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="admin-login" placeholder="admin" value={adminLogin}
                        onChange={e => setAdminLogin(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-pass">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="admin-pass" type="password" placeholder="••••••••" value={adminPass}
                        onChange={e => setAdminPass(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-full bg-red-600 hover:bg-red-700" disabled={loading}>
                    {loading ? 'Verificando...' : 'Acessar Painel Administrativo'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MarketplaceLayout>
  );
};

export default LoginPage;
