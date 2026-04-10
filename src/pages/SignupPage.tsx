import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Phone, CreditCard, MapPin } from 'lucide-react';

const SignupPage = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUpCustomer, updateProfile } = useAuth();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Nome é obrigatório'); return; }
    if (!form.email.trim()) { toast.error('E-mail é obrigatório'); return; }
    if (!form.cpf.trim()) { toast.error('CPF é obrigatório'); return; }
    if (!form.phone.trim()) { toast.error('Telefone é obrigatório'); return; }
    if (form.password.length < 6) { toast.error('Senha deve ter pelo menos 6 caracteres'); return; }
    if (form.password !== form.confirmPassword) { toast.error('As senhas não coincidem'); return; }
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUpCustomer({
      email: form.email,
      password: form.password,
      full_name: form.full_name,
      phone: form.phone,
      cpf: form.cpf,
    });

    if (error) {
      setLoading(false);
      toast.error(error);
      return;
    }

    // Salvar endereço no perfil
    updateProfile({
      address_street: form.address_street,
      address_number: form.address_number,
      address_complement: form.address_complement,
      address_neighborhood: form.address_neighborhood,
      address_city: form.address_city,
      address_state: form.address_state,
      address_zip: form.address_zip,
    });

    setLoading(false);
    toast.success('Conta criada com sucesso! 🎉');
    navigate('/conta');
  };

  return (
    <MarketplaceLayout>
      <div className="container flex items-center justify-center py-12 min-h-[60vh]">
        <Card className="w-full max-w-lg shadow-elevated">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero">
                {step === 0 ? <UserPlus className="h-7 w-7 text-primary-foreground" /> : <MapPin className="h-7 w-7 text-primary-foreground" />}
              </div>
            </div>
            <CardTitle className="text-2xl">{step === 0 ? 'Criar Conta' : 'Seu Endereço'}</CardTitle>
            <CardDescription>
              {step === 0
                ? 'Passo 1 de 2 — Preencha seus dados pessoais'
                : 'Passo 2 de 2 — Seu endereço para entregas (usado no checkout)'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-1.5 rounded-full ${step >= 0 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            </div>

            {step === 0 && (
              <form onSubmit={handleStep1} className="space-y-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 mb-1 text-sm text-blue-700 dark:text-blue-300">
                  🛍️ Preencha seus dados para começar a comprar na plataforma.
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" placeholder="Seu nome completo" value={form.full_name} onChange={set('full_name')} className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} className="pl-10" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="cpf" placeholder="000.000.000-00" value={form.cpf} onChange={set('cpf')} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" placeholder="(11) 99999-0000" value={form.phone} onChange={set('phone')} className="pl-10" required />
                    </div>
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

                <Button type="submit" className="w-full rounded-full">
                  Continuar →
                </Button>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 p-3 mb-1 text-sm text-emerald-700 dark:text-emerald-300">
                  📍 Esse endereço será usado automaticamente no checkout. Você pode alterá-lo depois.
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label>Rua *</Label>
                    <Input placeholder="Nome da rua" value={form.address_street} onChange={set('address_street')} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Número *</Label>
                    <Input placeholder="123" value={form.address_number} onChange={set('address_number')} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Complemento</Label>
                    <Input placeholder="Apto, Bloco..." value={form.address_complement} onChange={set('address_complement')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro *</Label>
                    <Input placeholder="Bairro" value={form.address_neighborhood} onChange={set('address_neighborhood')} required />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>CEP *</Label>
                    <Input placeholder="00000-000" value={form.address_zip} onChange={set('address_zip')} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade *</Label>
                    <Input placeholder="Sua cidade" value={form.address_city} onChange={set('address_city')} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Input placeholder="SP" value={form.address_state} onChange={set('address_state')} maxLength={2} required />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep(0)}>
                    ← Voltar
                  </Button>
                  <Button type="submit" className="flex-1 rounded-full" disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Conta'}
                  </Button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              É lojista? <Link to="/cadastro-lojista" className="text-primary font-medium hover:underline">Cadastre sua loja</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </MarketplaceLayout>
  );
};

export default SignupPage;
