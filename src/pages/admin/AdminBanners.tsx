import { useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  position: string;
  is_active: boolean;
  store_name: string;
}

const positionLabels: Record<string, string> = { hero: 'Hero Principal', home: 'Home', category: 'Categoria' };

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', image_url: '', link_url: '', position: 'hero', is_active: true, store_name: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('banners').upload(path, file);
    if (error) {
      toast.error('Erro no upload: ' + error.message);
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(path);
    setForm(f => ({ ...f, image_url: publicUrl }));
    setUploading(false);
    toast.success('Imagem enviada!');
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', image_url: '', link_url: '', position: 'hero', is_active: true, store_name: '' });
    setIsOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({ title: b.title, image_url: b.image_url, link_url: b.link_url, position: b.position, is_active: b.is_active, store_name: b.store_name || '' });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.image_url) { toast.error('Preencha título e envie uma imagem'); return; }
    if (editing) {
      setBanners(prev => prev.map(b => b.id === editing.id ? { ...b, ...form } : b));
      toast.success('Banner atualizado!');
    } else {
      setBanners(prev => [...prev, { id: crypto.randomUUID(), ...form }]);
      toast.success('Banner criado!');
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
    toast.success('Banner removido');
  };

  const toggleActive = (id: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Banners & Conteúdo</h1>
            <p className="text-sm text-muted-foreground">Faça upload de banners promocionais — venda espaços para lojistas</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Novo Banner</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Promoção de Verão" />
                </div>
                <div className="space-y-2">
                  <Label>Imagem do Banner</Label>
                  <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleUpload} />
                  <Button variant="outline" className="w-full rounded-lg" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Enviando...' : 'Fazer Upload da Imagem'}
                  </Button>
                  {form.image_url && (
                    <div className="aspect-[3/1] rounded-lg overflow-hidden bg-muted">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Link de Destino</Label>
                  <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="/produtos?category=..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Posição</Label>
                    <Select value={form.position} onValueChange={v => setForm(f => ({ ...f, position: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hero">Hero Principal</SelectItem>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="category">Categoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lojista (opcional)</Label>
                    <Input value={form.store_name} onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))} placeholder="Nome da loja" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                  <Label>Ativo</Label>
                </div>
                <Button className="w-full rounded-full" onClick={handleSave}>
                  {editing ? 'Salvar Alterações' : 'Criar Banner'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {banners.map(b => (
            <Card key={b.id} className={`shadow-card overflow-hidden ${!b.is_active ? 'opacity-60' : ''}`}>
              <div className="aspect-[3/1] relative bg-muted">
                <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${b.is_active ? 'bg-success text-success-foreground' : 'bg-muted-foreground text-background'}`}>
                    {b.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-card/90 text-foreground">
                    {positionLabels[b.position] || b.position}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.store_name ? `Lojista: ${b.store_name}` : 'Banner institucional'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(b.id)}>
                      <Switch checked={b.is_active} className="pointer-events-none scale-75" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {banners.length === 0 && (
          <Card className="shadow-card border-dashed">
            <CardContent className="p-6 text-center">
              <Image className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium text-sm">Nenhum banner ainda</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Crie banners com upload de imagens reais. Venda espaços para lojistas promoverem seus produtos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
