import { useEffect, useState } from 'react';
import { Banknote, CheckCircle2, Clock, AlertCircle, Save } from 'lucide-react';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fmt = (v: number) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const statusMap: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: 'Pendente', cls: 'bg-warning/10 text-warning', icon: Clock },
  processing: { label: 'Processando', cls: 'bg-info/10 text-info', icon: Clock },
  completed: { label: 'Pago', cls: 'bg-success/10 text-success', icon: CheckCircle2 },
  failed: { label: 'Falhou', cls: 'bg-destructive/10 text-destructive', icon: AlertCircle },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = statusMap[status] ?? { label: status, cls: 'bg-muted text-foreground', icon: Clock };
  const Icon = s.icon;
  return (
    <Badge className={`border-0 text-xs gap-1 ${s.cls}`}>
      <Icon className="h-3 w-3" /> {s.label}
    </Badge>
  );
};

interface BankForm {
  holder_name: string;
  holder_document: string;
  bank_code: string;
  bank_name: string;
  agency: string;
  account_number: string;
  account_type: string;
  pix_key_type: string;
  pix_key: string;
}

const empty: BankForm = {
  holder_name: '', holder_document: '', bank_code: '', bank_name: '',
  agency: '', account_number: '', account_type: 'corrente',
  pix_key_type: '', pix_key: '',
};

const SellerPayouts = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [form, setForm] = useState<BankForm>(empty);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setLoading(false); return; }
      try {
        const { data: store } = await supabase
          .from('stores').select('id').eq('owner_id', user.id).maybeSingle();
        if (cancelled) return;
        if (!store) { setLoading(false); return; }
        setStoreId(store.id);

        const [acctRes, payoutsRes] = await Promise.all([
          supabase.from('store_bank_accounts').select('*').eq('store_id', store.id).maybeSingle(),
          supabase.from('payouts')
            .select('id, amount, status, created_at, completed_at, gateway_reference')
            .eq('store_id', store.id).order('created_at', { ascending: false }).limit(20),
        ]);
        if (cancelled) return;
        if (acctRes.data) {
          setAccountId(acctRes.data.id);
          setForm({
            holder_name: acctRes.data.holder_name ?? '',
            holder_document: acctRes.data.holder_document ?? '',
            bank_code: acctRes.data.bank_code ?? '',
            bank_name: acctRes.data.bank_name ?? '',
            agency: acctRes.data.agency ?? '',
            account_number: acctRes.data.account_number ?? '',
            account_type: acctRes.data.account_type ?? 'corrente',
            pix_key_type: acctRes.data.pix_key_type ?? '',
            pix_key: acctRes.data.pix_key ?? '',
          });
        }
        setPayouts(payoutsRes.data ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const update = (k: keyof BankForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!storeId) { toast.error('Loja não vinculada ao backend.'); return; }
    if (!form.holder_name || !form.holder_document) {
      toast.error('Informe nome e documento do titular.'); return;
    }
    if (!form.pix_key && (!form.bank_code || !form.agency || !form.account_number)) {
      toast.error('Informe uma chave PIX ou os dados bancários completos.'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, store_id: storeId, is_active: true };
      const res = accountId
        ? await supabase.from('store_bank_accounts').update(payload).eq('id', accountId).select().maybeSingle()
        : await supabase.from('store_bank_accounts').insert(payload).select().maybeSingle();
      if (res.error) throw res.error;
      if (res.data) setAccountId(res.data.id);
      toast.success('Dados de repasse salvos com sucesso!');
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + (e.message ?? 'desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold">Dados de Repasse</h1>
          <p className="text-sm text-muted-foreground">
            Configure a conta que vai receber os pagamentos da plataforma e acompanhe o status dos repasses.
          </p>
        </div>

        {!storeId && !loading && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sua loja ainda não está vinculada ao backend. Complete o cadastro da loja para configurar repasses.
            </AlertDescription>
          </Alert>
        )}

        {/* Bank form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" /> Conta de Recebimento
            </CardTitle>
            <CardDescription>
              Informe ao menos uma chave PIX <strong>ou</strong> os dados bancários completos. PIX é o método mais rápido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome do Titular *</Label>
                    <Input value={form.holder_name} onChange={e => update('holder_name')(e.target.value)}
                      placeholder="Nome completo ou razão social" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF / CNPJ *</Label>
                    <Input value={form.holder_document} onChange={e => update('holder_document')(e.target.value)}
                      placeholder="000.000.000-00" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Chave PIX (recomendado)</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tipo de Chave</Label>
                      <Select value={form.pix_key_type || 'none'} onValueChange={v => update('pix_key_type')(v === 'none' ? '' : v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— Nenhuma —</SelectItem>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="random">Chave Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Chave PIX</Label>
                      <Input value={form.pix_key} onChange={e => update('pix_key')(e.target.value)}
                        placeholder="Sua chave PIX" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Conta Bancária (alternativa)</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Código do Banco</Label>
                      <Input value={form.bank_code} onChange={e => update('bank_code')(e.target.value)}
                        placeholder="Ex: 001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Banco</Label>
                      <Input value={form.bank_name} onChange={e => update('bank_name')(e.target.value)}
                        placeholder="Ex: Banco do Brasil" />
                    </div>
                    <div className="space-y-2">
                      <Label>Agência</Label>
                      <Input value={form.agency} onChange={e => update('agency')(e.target.value)}
                        placeholder="0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Conta (com dígito)</Label>
                      <Input value={form.account_number} onChange={e => update('account_number')(e.target.value)}
                        placeholder="00000-0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Conta</Label>
                      <Select value={form.account_type} onValueChange={update('account_type')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corrente">Conta Corrente</SelectItem>
                          <SelectItem value="poupanca">Conta Poupança</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSave} disabled={saving || !storeId}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando…' : accountId ? 'Atualizar Dados' : 'Salvar Dados'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payouts history */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Status dos Repasses da Plataforma</CardTitle>
            <CardDescription>Acompanhe os pagamentos enviados pela plataforma para sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">ID</th>
                    <th className="text-left p-3 font-medium">Solicitado</th>
                    <th className="text-left p-3 font-medium">Pago em</th>
                    <th className="text-right p-3 font-medium">Valor</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Carregando…</td></tr>
                  ) : payouts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground">
                        Nenhum repasse registrado ainda. Os repasses aparecem aqui após pedidos pagos serem processados.
                      </td>
                    </tr>
                  ) : payouts.map(p => (
                    <tr key={p.id}>
                      <td className="p-3 font-mono text-xs">{p.id.slice(0, 8)}</td>
                      <td className="p-3 text-muted-foreground">{fmtDate(p.created_at)}</td>
                      <td className="p-3 text-muted-foreground">{fmtDate(p.completed_at)}</td>
                      <td className="p-3 text-right font-medium">{fmt(Number(p.amount))}</td>
                      <td className="p-3 text-center"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
};

export default SellerPayouts;
