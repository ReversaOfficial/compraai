import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, Save } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const AdminPopup = () => {
  const { user } = useAuth();
  const [popup, setPopup] = useState<any>(null);
  const [form, setForm] = useState({
    title: '', body: '', image_url: '', button_text: '', button_link: '',
    frequency: 'once_per_session', is_active: false,
    starts_at: '', ends_at: '',
  });
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    supabase.from('popup_ads').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (data) {
        setPopup(data);
        setForm({
          title: data.title || '', body: data.body || '', image_url: data.image_url || '',
          button_text: data.button_text || '', button_link: data.button_link || '',
          frequency: data.frequency, is_active: data.is_active || false,
          starts_at: data.starts_at ? new Date(data.starts_at).toISOString().slice(0, 16) : '',
          ends_at: data.ends_at ? new Date(data.ends_at).toISOString().slice(0, 16) : '',
        });
      }
    });
  }, []);

  const handleSave = async () => {
    const payload: any = {
      ...form,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : new Date().toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      created_by: user?.id || null,
    };
    if (popup) {
      await supabase.from('popup_ads').update(payload).eq('id', popup.id);
    } else {
      const { data } = await supabase.from('popup_ads').insert(payload).select().single();
      if (data) setPopup(data);
    }
    toast.success('Pop-up salvo!');
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Pop-up Promocional</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Configuração</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Pop-up ativo</Label>
            </div>
            <div className="space-y-2"><Label>Imagem URL</Label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Texto</Label><Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Texto do Botão</Label><Input value={form.button_text} onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Link do Botão</Label><Input value={form.button_link} onChange={e => setForm(f => ({ ...f, button_link: e.target.value }))} /></div>
            </div>
            <div className="space-y-2">
              <Label>Frequência</Label>
              <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option value="always">Sempre que abrir</option>
                <option value="once_per_session">Uma vez por sessão</option>
                <option value="once_per_day">Uma vez por dia</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Início</Label><Input type="datetime-local" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Fim</Label><Input type="datetime-local" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1 rounded-full"><Save className="h-4 w-4 mr-2" />Salvar</Button>
              <Button variant="outline" onClick={() => setPreview(true)} className="rounded-full"><Eye className="h-4 w-4 mr-2" />Preview</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Informações</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>O pop-up aparece quando o usuário abre o site.</p>
            <p><strong>Sempre que abrir:</strong> aparece em toda visita.</p>
            <p><strong>Uma vez por sessão:</strong> aparece 1x por aba.</p>
            <p><strong>Uma vez por dia:</strong> aparece 1x por dia.</p>
            <p className="pt-2">Use este espaço para campanhas da plataforma ou venda como mídia premium para lojistas.</p>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
          {form.image_url && <img src={form.image_url} alt="" className="w-full aspect-video object-cover" />}
          <div className="p-6">
            {form.title && <h3 className="text-xl font-bold mb-2">{form.title}</h3>}
            {form.body && <p className="text-sm text-muted-foreground mb-4">{form.body}</p>}
            {form.button_text && <Button className="w-full rounded-full">{form.button_text}</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPopup;
