import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Landmark, QrCode, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePlans, PaymentConfig } from '@/contexts/PlansContext';
import { Badge } from '@/components/ui/badge';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const AdminPayments = () => {
  const { paymentConfig, setPaymentConfig, payments } = usePlans();
  const [form, setForm] = useState<PaymentConfig>({ ...paymentConfig });
  const sf = (k: keyof PaymentConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = () => setPaymentConfig(form);

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
  };
  const statusLabel: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmado', failed: 'Falhou' };

  const totalRevenue = payments.filter(p => p.status === 'confirmed').reduce((a, p) => a + p.amount, 0);
  const pending = payments.filter(p => p.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pagamentos & Recebimentos</h1>
          <p className="text-sm text-muted-foreground">Configure sua conta bancária/PIX e acompanhe pagamentos dos lojistas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-card"><CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-primary">{fmt(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Recebido</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-amber-500">{pending}</p>
            <p className="text-xs text-muted-foreground mt-1">Pagamentos Pendentes</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{payments.filter(p => p.status === 'confirmed').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Confirmados</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="config">
          <TabsList className="mb-4">
            <TabsTrigger value="config" className="gap-2"><Landmark className="h-4 w-4" /> Configurar Conta</TabsTrigger>
            <TabsTrigger value="history" className="gap-2"><CheckCircle className="h-4 w-4" /> Histórico</TabsTrigger>
          </TabsList>

          {/* Config */}
          <TabsContent value="config">
            <div className="grid md:grid-cols-2 gap-6">
              {/* PIX */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <QrCode className="h-5 w-5 text-primary" /> Chave PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo da chave PIX</Label>
                    <Select value={form.pix_key_type} onValueChange={v => setForm(f => ({ ...f, pix_key_type: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                        <SelectItem value="random">Chave aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chave PIX</Label>
                    <Input value={form.pix_key} onChange={sf('pix_key')} placeholder="Sua chave PIX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do beneficiário</Label>
                    <Input value={form.pix_beneficiary} onChange={sf('pix_beneficiary')} placeholder="Nome completo / Razão social" />
                  </div>
                </CardContent>
              </Card>

              {/* Bank */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Landmark className="h-5 w-5 text-primary" /> Dados Bancários
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input value={form.bank_name} onChange={sf('bank_name')} placeholder="Ex: Banco do Brasil" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Agência</Label>
                      <Input value={form.bank_agency} onChange={sf('bank_agency')} placeholder="0001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Conta</Label>
                      <Input value={form.bank_account} onChange={sf('bank_account')} placeholder="12345-6" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de conta</Label>
                    <Select value={form.bank_account_type} onValueChange={v => setForm(f => ({ ...f, bank_account_type: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrente">Conta Corrente</SelectItem>
                        <SelectItem value="poupanca">Conta Poupança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Beneficiário</Label>
                    <Input value={form.bank_beneficiary} onChange={sf('bank_beneficiary')} placeholder="Nome / Razão social" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF / CNPJ</Label>
                    <Input value={form.bank_cpf_cnpj} onChange={sf('bank_cpf_cnpj')} placeholder="00.000.000/0001-00" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mt-4">
              <Button className="gap-2 rounded-full px-8" onClick={handleSave}>
                <Save className="h-4 w-4" /> Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <Card className="shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Loja</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plano</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Forma</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Nenhum pagamento registrado ainda</td></tr>
                    )}
                    {[...payments].reverse().map(p => (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{p.seller_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.plan_name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">
                            {p.method === 'pix' ? '⚡ PIX' : '💳 Cartão'} · {p.billing === 'annual' ? 'Anual' : 'Mensal'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-bold">{fmt(p.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor[p.status]}`}>
                            {statusLabel[p.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
