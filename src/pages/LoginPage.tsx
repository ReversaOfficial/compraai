import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, ShoppingBag, Store, ShieldCheck, User } from 'lucide-react';

const LoginPage = () => {
  const [tab, setTab] = useState<'customer' | 'seller' | 'admin'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInCustomer, signInSeller, signInAdmin } = useAuth();
  const navigate = useNavigate();

  const handleCustomerSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = tab === 'customer'
      ? await signInCustomer(email, password)
      : await signInSeller(email, password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success('Bem-vindo de volta!');
    navigate(tab === 'customer' ? '/conta' : '/lojista');
  };

  const handleAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInAdmin(adminLogin, adminPass);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success('Acesso administrativo concedido!');
    navigate('/admin');
  };

  const tabStyle = (active: boolean, base: string) =>
    `flex items-center gap-1.5 flex-1 justify-center rounded-md py-2 text-sm font-medium transition-all ${active ? base : 'text-muted-foreground hover:text-foreground'}`;

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
            {/* Custom Tab Bar */}
            <div className="flex bg-muted rounded-lg p-1 mb-6 gap-1">
              <button onClick={() => setTab('customer')}
                className={tabStyle(tab === 'customer', 'bg-white shadow-sm text-foreground dark:bg-card')}>
                <ShoppingBag className="h-3.5 w-3.5" /> Cliente
              </button>
              <button onClick={() => setTab('seller')}
                className={tabStyle(tab === 'seller', 'bg-white shadow-sm text-foreground dark:bg-card')}>
                <Store className="h-3.5 w-3.5" /> Lojista
              </button>
              <button onClick={() => setTab('admin')}
                className={tabStyle(tab === 'admin', 'bg-white shadow-sm text-foreground dark:bg-card')}>
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </button>
            </div>

            {/* Client / Seller */}
            {(tab === 'customer' || tab === 'seller') && (
              <>
                <div className={`rounded-lg p-3 mb-5 text-sm border ${tab === 'customer'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                  {tab === 'customer'
                    ? '🛍️ Acesse sua conta para acompanhar pedidos e gerenciar seus dados.'
                    : '🏪 Acesse o painel da sua loja para gerenciar produtos e pedidos.'}
                </div>
                <form onSubmit={handleCustomerSeller} className="space-y-4">
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
                  <Link to={tab === 'customer' ? '/cadastro' : '/cadastro-lojista'} className="text-primary font-medium hover:underline">
                    {tab === 'customer' ? 'Criar conta' : 'Cadastrar loja'}
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
