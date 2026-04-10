import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Store, Mail, Lock, User, Phone, Building2 } from 'lucide-react';

const SellerSignupPage = () => {
  const [form, setForm] = useState({
    full_name: '',
    store_name: '',
    cnpj: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUpSeller } = useAuth();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password.length < 6) { toast.error('Senha deve ter pelo menos 6 caracteres'); return; }
    if (form.password !== form.confirmPassword) { toast.error('As senhas não coincidem'); return; }
    if (!form.cnpj.trim()) { toast.error('CNPJ é obrigatório'); return; }
    if (!form.store_name.trim()) { toast.error('Nome da loja é obrigatório'); return; }

    setLoading(true);
    const { error } = await signUpSeller({
      email: form.email,
      password: form.password,
      full_name: form.full_name,
      store_name: form.store_name,
      cnpj: form.cnpj,
      phone: form.phone,
    });
    setLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Loja cadastrada com sucesso! 🏪');
      navigate('/lojista');
    }
  };

  return (
    <MarketplaceLayout>
      <div className="container flex items-center justify-center py-12 min-h-[60vh]">
        <Card className="w-full max-w-lg shadow-elevated">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700">
                <Store className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Cadastrar Loja</CardTitle>
            <CardDescription>Cadastre sua loja e comece a vender na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 p-3 mb-5 text-sm text-emerald-700 dark:text-emerald-300">
              🏪 Após o cadastro, você poderá configurar sua loja, adicionar produtos e começar a receber pedidos.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome do Responsável *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="full_name" placeholder="Nome completo do proprietário" value={form.full_name} onChange={set('full_name')} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_name">Nome da Loja *</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="store_name" placeholder="Nome da sua loja" value={form.store_name} onChange={set('store_name')} className="pl-10" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="cnpj" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={set('cnpj')} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" placeholder="(11) 99999-0000" value={form.phone} onChange={set('phone')} className="pl-10" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="loja@email.com" value={form.email} onChange={set('email')} className="pl-10" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" type="password" placeholder="Repita a senha" value={form.confirmPassword} onChange={set('confirmPassword')} className="pl-10" required />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar Loja'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              É cliente? <Link to="/cadastro" className="text-primary font-medium hover:underline">Criar conta de cliente</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </MarketplaceLayout>
  );
};

export default SellerSignupPage;
