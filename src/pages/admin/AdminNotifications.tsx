import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Trash2, Bell } from 'lucide-react';
import { toast } from 'sonner';

const AdminNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', body: '', link: '', image_url: '', type: 'general' });

  useEffect(() => {
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).then(({ data }) => setNotifications(data || []));
  }, []);

  const handleSend = async () => {
    if (!form.title.trim()) { toast.error('Título obrigatório'); return; }
    const { error } = await supabase.from('notifications').insert({
      ...form, target_user_id: null, created_by: user?.id || null,
    });
    if (error) { toast.error('Erro ao enviar'); return; }
    toast.success('Notificação enviada!');
    setForm({ title: '', body: '', link: '', image_url: '', type: 'general' });
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    setNotifications(data || []);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Removida');
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Notificações</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Send className="h-5 w-5" /> Nova Notificação</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option value="general">Geral</option>
                <option value="promo">Promoção</option>
                <option value="campaign">Campanha</option>
                <option value="new_store">Nova Loja</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Título *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Mensagem</Label><Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={3} /></div>
            <div className="space-y-2"><Label>Link (opcional)</Label><Input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/produtos" /></div>
            <div className="space-y-2"><Label>URL da Imagem (opcional)</Label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} /></div>
            <Button onClick={handleSend} className="w-full rounded-full"><Send className="h-4 w-4 mr-2" />Enviar para Todos</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" /> Enviadas ({notifications.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-auto">
              {notifications.map(n => (
                <div key={n.id} className="flex items-start justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{n.type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
