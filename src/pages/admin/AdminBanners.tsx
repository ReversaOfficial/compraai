import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Image, GripVertical, MonitorPlay, LayoutPanelLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSiteConfig, HeroSlide, SectionBanner } from '@/contexts/SiteConfigContext';

const positionLabel: Record<string, string> = {
  dual_left: 'Banner Duplo — Esquerda',
  dual_right: 'Banner Duplo — Direita',
  fullwidth: 'Banner Full Width',
  triple_1: 'Banner Triplo — 1',
  triple_2: 'Banner Triplo — 2',
  triple_3: 'Banner Triplo — 3',
};

// ─── Hero Slides Tab ──────────────────────────────────────────────────────────

const HeroSlidesTab = () => {
  const { heroSlides, setHeroSlides } = useSiteConfig();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState<Omit<HeroSlide, 'id' | 'sort_order'>>({
    image: '', tag: '', title: '', subtitle: '',
    cta1Text: 'Ver Produtos', cta1Link: '/produtos',
    cta2Text: 'Saiba Mais', cta2Link: '/',
    is_active: true, store_name: '',
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const openNew = () => {
    setEditing(null);
    setForm({ image: '', tag: '', title: '', subtitle: '', cta1Text: 'Ver Produtos', cta1Link: '/produtos', cta2Text: 'Saiba Mais', cta2Link: '/', is_active: true, store_name: '' });
    setOpen(true);
  };

  const openEdit = (s: HeroSlide) => {
    setEditing(s);
    const { id, sort_order, ...rest } = s;
    setForm(rest);
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.image || !form.title) { toast.error('Imagem e título são obrigatórios'); return; }
    if (editing) {
      setHeroSlides(heroSlides.map(s => s.id === editing.id ? { ...s, ...form } : s));
      toast.success('Slide atualizado!');
    } else {
      setHeroSlides([...heroSlides, { id: crypto.randomUUID(), sort_order: heroSlides.length, ...form }]);
      toast.success('Slide criado!');
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setHeroSlides(heroSlides.filter(s => s.id !== id));
    toast.success('Slide removido');
  };

  const toggleActive = (id: string) => {
    setHeroSlides(heroSlides.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...heroSlides];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setHeroSlides(next.map((s, i) => ({ ...s, sort_order: i })));
  };

  const moveDown = (idx: number) => {
    if (idx === heroSlides.length - 1) return;
    const next = [...heroSlides];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setHeroSlides(next.map((s, i) => ({ ...s, sort_order: i })));
  };

  const sorted = [...heroSlides].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Gerencie os slides do carrossel principal. Use URL de imagem pública (Unsplash, CDN, etc) ou cole o link direto.
        </p>
        <Button onClick={openNew} className="rounded-full gap-2"><Plus className="h-4 w-4" /> Novo Slide</Button>
      </div>

      <div className="space-y-3">
        {sorted.map((slide, idx) => (
          <Card key={slide.id} className={`shadow-card overflow-hidden ${!slide.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-stretch">
              {/* Thumb */}
              <div className="relative w-48 shrink-0 bg-muted overflow-hidden">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-end p-3">
                  <span className="text-xs font-bold text-white truncate">{slide.title.split('\n')[0]}</span>
                </div>
              </div>
              <CardContent className="flex-1 p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={slide.is_active ? 'default' : 'secondary'} className="text-[10px]">
                      {slide.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Slide #{idx + 1}</span>
                    {slide.store_name && <Badge variant="outline" className="text-[10px]">📦 {slide.store_name}</Badge>}
                  </div>
                  <p className="font-semibold text-sm">{slide.title.split('\n')[0]}</p>
                  <p className="text-xs text-muted-foreground">{slide.tag} · {slide.cta1Text} → {slide.cta1Link}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex flex-col gap-0.5 mr-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveUp(idx)}>▲</Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveDown(idx)}>▼</Button>
                  </div>
                  <Switch checked={slide.is_active} onCheckedChange={() => toggleActive(slide.id)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(slide)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(slide.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}

        {heroSlides.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <MonitorPlay className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-medium text-sm">Nenhum slide criado</p>
              <p className="text-xs text-muted-foreground mt-1">Crie slides para o carrossel principal da homepage</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Slide' : 'Novo Slide do Hero'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Preview */}
            {form.image && (
              <div className="relative rounded-lg overflow-hidden aspect-[16/6] bg-muted">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-end p-4">
                  <div>
                    <span className="inline-block bg-accent text-white text-xs px-3 py-1 font-bold mb-2">{form.tag || 'Tag'}</span>
                    <p className="text-white font-extrabold text-xl">{form.title.split('\n')[0] || 'Título'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>URL da Imagem de Fundo *</Label>
              <Input value={form.image} onChange={sf('image')} placeholder="https://images.unsplash.com/..." />
              <p className="text-xs text-muted-foreground">Use fotos do Unsplash ou outro CDN público. Tamanho ideal: 1600×900px</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tag / Etiqueta</Label>
                <Input value={form.tag} onChange={sf('tag')} placeholder="Ex: Novidades 2026" />
              </div>
              <div className="space-y-2">
                <Label>Lojista anunciante (opcional)</Label>
                <Input value={form.store_name} onChange={sf('store_name')} placeholder="Nome da loja" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título (use Enter para quebra de linha) *</Label>
              <Textarea value={form.title} onChange={sf('title')} placeholder="Compre local,&#10;receba rápido." rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Textarea value={form.subtitle} onChange={sf('subtitle')} placeholder="Descrição do slide..." rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Botão 1 — Texto</Label>
                <Input value={form.cta1Text} onChange={sf('cta1Text')} placeholder="Ver Produtos" />
              </div>
              <div className="space-y-2">
                <Label>Botão 1 — Link</Label>
                <Input value={form.cta1Link} onChange={sf('cta1Link')} placeholder="/produtos" />
              </div>
              <div className="space-y-2">
                <Label>Botão 2 — Texto</Label>
                <Input value={form.cta2Text} onChange={sf('cta2Text')} placeholder="Saiba Mais" />
              </div>
              <div className="space-y-2">
                <Label>Botão 2 — Link</Label>
                <Input value={form.cta2Link} onChange={sf('cta2Link')} placeholder="/cadastro-lojista" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Slide ativo</Label>
            </div>

            <Button className="w-full rounded-full" onClick={handleSave}>
              {editing ? 'Salvar Alterações' : 'Criar Slide'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Section Banners Tab ──────────────────────────────────────────────────────

const SectionBannersTab = () => {
  const { sectionBanners, setSectionBanners } = useSiteConfig();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SectionBanner | null>(null);
  const [form, setForm] = useState<Omit<SectionBanner, 'id'>>({
    position: 'dual_left', image: '', tag: '', title: '', subtitle: '',
    cta: 'Ver Produtos', link: '/', is_active: true, store_name: '',
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const openEdit = (b: SectionBanner) => {
    setEditing(b);
    const { id, ...rest } = b;
    setForm(rest);
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.image || !form.title) { toast.error('Imagem e título são obrigatórios'); return; }
    if (editing) {
      setSectionBanners(sectionBanners.map(b => b.id === editing.id ? { ...b, ...form } : b));
      toast.success('Banner atualizado!');
    }
    setOpen(false);
  };

  const toggleActive = (id: string) => {
    setSectionBanners(sectionBanners.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b));
  };

  const groups: { label: string; positions: SectionBanner['position'][] }[] = [
    { label: 'Banner Duplo (linha 1)', positions: ['dual_left', 'dual_right'] },
    { label: 'Banner Full Width', positions: ['fullwidth'] },
    { label: 'Banner Triplo (linha 2)', positions: ['triple_1', 'triple_2', 'triple_3'] },
  ];

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Edite os banners de cada seção da homepage. Esses espaços podem ser vendidos para lojistas anunciarem seus produtos.
      </p>

      {groups.map(g => (
        <div key={g.label}>
          <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">{g.label}</h3>
          <div className={`grid gap-4 ${g.positions.length === 1 ? 'grid-cols-1' : g.positions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {g.positions.map(pos => {
              const banner = sectionBanners.find(b => b.position === pos);
              if (!banner) return null;
              return (
                <Card key={pos} className={`overflow-hidden shadow-card ${!banner.is_active ? 'opacity-60' : ''}`}>
                  <div className={`relative bg-muted overflow-hidden ${pos === 'fullwidth' ? 'aspect-[4/1]' : 'aspect-[3/2]'}`}>
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                      <div>
                        <span className="text-[10px] font-bold text-accent uppercase">{banner.tag}</span>
                        <p className="text-white text-sm font-bold">{banner.title}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant={banner.is_active ? 'default' : 'secondary'} className="text-[10px]">
                        {banner.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">{positionLabel[pos]}</p>
                        {banner.store_name && <p className="text-xs text-primary">📦 {banner.store_name}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Switch checked={banner.is_active} onCheckedChange={() => toggleActive(banner.id)} />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(banner)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Banner — {positionLabel[form.position]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {form.image && (
              <div className="relative rounded-lg overflow-hidden aspect-[3/1] bg-muted">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <p className="text-white font-bold text-sm">{form.title || 'Título'}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>URL da Imagem *</Label>
              <Input value={form.image} onChange={sf('image')} placeholder="https://images.unsplash.com/..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tag / Etiqueta</Label>
                <Input value={form.tag} onChange={sf('tag')} placeholder="Ex: Até 30% OFF" />
              </div>
              <div className="space-y-2">
                <Label>Lojista anunciante</Label>
                <Input value={form.store_name} onChange={sf('store_name')} placeholder="Nome da loja" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={sf('title')} placeholder="Ex: Cama, Mesa & Banho" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texto do botão</Label>
                <Input value={form.cta} onChange={sf('cta')} placeholder="Ver Produtos" />
              </div>
              <div className="space-y-2">
                <Label>Link de destino</Label>
                <Input value={form.link} onChange={sf('link')} placeholder="/busca?cat=..." />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Banner ativo</Label>
            </div>
            <Button className="w-full rounded-full" onClick={handleSave}>Salvar Banner</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminBanners = () => (
  <AdminLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Banners & Publicidade</h1>
        <p className="text-sm text-muted-foreground">Gerencie o carrossel hero e todos os banners da homepage. Venda espaços para lojistas.</p>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="mb-6">
          <TabsTrigger value="hero" className="gap-2"><MonitorPlay className="h-4 w-4" /> Carrossel Hero</TabsTrigger>
          <TabsTrigger value="sections" className="gap-2"><LayoutPanelLeft className="h-4 w-4" /> Banners de Seção</TabsTrigger>
        </TabsList>
        <TabsContent value="hero"><HeroSlidesTab /></TabsContent>
        <TabsContent value="sections"><SectionBannersTab /></TabsContent>
      </Tabs>
    </div>
  </AdminLayout>
);

export default AdminBanners;
