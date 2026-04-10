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
import { LogIn, Mail, Lock, ShoppingBag, Store } from 'lucide-react';

const LoginPage = () => {
  const [tab, setTab] = useState<'customer' | 'seller'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInCustomer, signInSeller } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = tab === 'customer'
      ? await signInCustomer(email, password)
      : await signInSeller(email, password);

    setLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Bem-vindo de volta!');
      navigate(tab === 'customer' ? '/conta' : '/lojista');
    }
  };

  return (
    <MarketplaceLayout>
      <div className="container flex items-center justify-center py-16 min-h-[60vh]">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero">
                <LogIn className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>Escolha como deseja entrar na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'customer' | 'seller')} className="mb-6">
              <TabsList className="w-full">
                <TabsTrigger value="customer" className="flex-1 gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Sou Cliente
                </TabsTrigger>
                <TabsTrigger value="seller" className="flex-1 gap-2">
                  <Store className="h-4 w-4" />
                  Sou Lojista
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className={`rounded-lg p-3 mb-5 text-sm ${tab === 'customer' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
              {tab === 'customer'
                ? '🛍️ Acesse sua conta para acompanhar pedidos e gerenciar seus dados.'
                : '🏪 Acesse o painel da sua loja para gerenciar produtos e pedidos.'
              }
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <Link to={tab === 'customer' ? '/cadastro' : '/cadastro-lojista'} className="text-primary font-medium hover:underline">
                {tab === 'customer' ? 'Criar conta' : 'Cadastrar loja'}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </MarketplaceLayout>
  );
};

export default LoginPage;
