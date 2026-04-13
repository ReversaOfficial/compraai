import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, Globe, RotateCcw, Save, Store, Megaphone, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteConfig, SiteTexts, DEFAULT_TEXTS } from '@/contexts/SiteConfigContext';

const Field = ({ label, value, onChange, area = false, hint }: {
  label: string; value: string;
  onChange: (v: string) => void;
  area?: boolean; hint?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
    {area
      ? <Textarea value={value} onChange={e => onChange(e.target.value)} rows={2} className="text-sm" />
      : <Input value={value} onChange={e => onChange(e.target.value)} className="text-sm" />
    }
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

const AdminSettings = () => {
  const { lang, setLang, langs } = useLanguage();
  const { texts, setTexts } = useSiteConfig();
  const [local, setLocal] = useState<SiteTexts>({ ...texts });

  const set = (k: keyof SiteTexts) => (v: string) => setLocal(t => ({ ...t, [k]: v }));

  const handleSave = () => {
    setTexts(local);
    toast.success('Configurações salvas! As alterações já estão no site.');
  };

  const handleReset = () => {
    setLocal({ ...DEFAULT_TEXTS });
    setTexts({ ...DEFAULT_TEXTS });
    toast.success('Textos restaurados para o padrão.');
  };

  const handleLangChange = (v: string) => {
    setLang(v as any);
    toast.success(`Idioma alterado para ${langs.find(l => l.value === v)?.label}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Configurações do Site</h1>
            <p className="text-sm text-muted-foreground">Controle todos os textos e configurações do marketplace</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full gap-2" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" /> Restaurar Padrão
            </Button>
            <Button className="rounded-full gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" /> Salvar Tudo
            </Button>
          </div>
        </div>

        <Tabs defaultValue="geral">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="geral" className="gap-2"><Type className="h-4 w-4" /> Geral</TabsTrigger>
            <TabsTrigger value="hero" className="gap-2"><Megaphone className="h-4 w-4" /> Hero</TabsTrigger>
            <TabsTrigger value="secoes" className="gap-2"><LayoutGrid className="h-4 w-4" /> Seções</TabsTrigger>
            <TabsTrigger value="lojista" className="gap-2"><Store className="h-4 w-4" /> CTA Lojista</TabsTrigger>
            <TabsTrigger value="idioma" className="gap-2"><Globe className="h-4 w-4" /> Idioma</TabsTrigger>
          </TabsList>

          {/* ── GERAL ── */}
          <TabsContent value="geral">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-base">Informações Gerais</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <Field label="Nome do Site" value={local.site_name} onChange={set('site_name')} hint="Aparece no cabeçalho e na sidebar do admin" />
                <Field label="Barra de Anúncio (topo do site)" value={local.announcement_bar} onChange={set('announcement_bar')} hint="Exibido na faixa verde no topo. Suporta emojis." />
                <Field label="Rodapé — Texto de Copyright" value={local.footer_copyright} onChange={set('footer_copyright')} />

                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm font-semibold">Barra de Benefícios</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Benefício 1 — Título" value={local.benefits_1_title} onChange={set('benefits_1_title')} />
                    <Field label="Benefício 1 — Descrição" value={local.benefits_1_desc} onChange={set('benefits_1_desc')} />
                    <Field label="Benefício 2 — Título" value={local.benefits_2_title} onChange={set('benefits_2_title')} />
                    <Field label="Benefício 2 — Descrição" value={local.benefits_2_desc} onChange={set('benefits_2_desc')} />
                    <Field label="Benefício 3 — Título" value={local.benefits_3_title} onChange={set('benefits_3_title')} />
                    <Field label="Benefício 3 — Descrição" value={local.benefits_3_desc} onChange={set('benefits_3_desc')} />
                    <Field label="Benefício 4 — Título" value={local.benefits_4_title} onChange={set('benefits_4_title')} />
                    <Field label="Benefício 4 — Descrição" value={local.benefits_4_desc} onChange={set('benefits_4_desc')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── HERO ── */}
          <TabsContent value="hero">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Hero Principal</CardTitle>
                <p className="text-sm text-muted-foreground">Configure os textos padrão do carrossel hero. Para imagens e conteúdo de cada slide, use a aba <strong>Banners</strong>.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Tag padrão dos slides" value={local.hero_default_tag} onChange={set('hero_default_tag')} hint='Exibido como etiqueta laranja acima do título (ex: "Novidades 2026")' />
                <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                  💡 Os textos de título, subtítulo e botões de cada slide são configurados individualmente em <strong>Banners → Carrossel Hero</strong>.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SEÇÕES ── */}
          <TabsContent value="secoes">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-base">Títulos das Seções da Homepage</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { l1: 'Promoções — Label', k1: 'section_promo_label', l2: 'Promoções — Título', k2: 'section_promo_title' },
                    { l1: 'Mais Vendidos — Label', k1: 'section_bestsellers_label', l2: 'Mais Vendidos — Título', k2: 'section_bestsellers_title' },
                    { l1: 'Novidades — Label', k1: 'section_new_label', l2: 'Novidades — Título', k2: 'section_new_title' },
                    { l1: 'Categorias — Label', k1: 'section_categories_label', l2: 'Categorias — Título', k2: 'section_categories_title' },
                    { l1: 'Lojas — Label', k1: 'section_stores_label', l2: 'Lojas — Título', k2: 'section_stores_title' },
                  ].map(row => (
                    <div key={row.k1} className="space-y-3 p-4 rounded-lg border">
                      <Field label={row.l1} value={local[row.k1 as keyof SiteTexts]} onChange={set(row.k1 as keyof SiteTexts)} hint="Etiqueta pequena em laranja acima do título" />
                      <Field label={row.l2} value={local[row.k2 as keyof SiteTexts]} onChange={set(row.k2 as keyof SiteTexts)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── CTA LOJISTA ── */}
          <TabsContent value="lojista">
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-base">Banner CTA — Para Lojistas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg overflow-hidden p-6 bg-primary text-white relative mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">{local.cta_seller_label}</p>
                  <h3 className="text-2xl font-extrabold mb-2">{local.cta_seller_title}</h3>
                  <p className="text-white/70 mb-4">{local.cta_seller_subtitle}</p>
                  <span className="bg-accent text-white text-sm font-bold px-6 py-3">{local.cta_seller_button}</span>
                </div>
                <Field label="Label (texto pequeno)" value={local.cta_seller_label} onChange={set('cta_seller_label')} />
                <Field label="Título principal" value={local.cta_seller_title} onChange={set('cta_seller_title')} />
                <Field label="Subtítulo" value={local.cta_seller_subtitle} onChange={set('cta_seller_subtitle')} area />
                <Field label="Texto do botão" value={local.cta_seller_button} onChange={set('cta_seller_button')} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── IDIOMA ── */}
          <TabsContent value="idioma">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Idioma do Site</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Troque o idioma da interface pública com um clique.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {langs.map(l => (
                    <Button key={l.value} variant={lang === l.value ? 'default' : 'outline'}
                      className="h-12 text-base rounded-full" onClick={() => handleLangChange(l.value)}>
                      {l.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button className="rounded-full gap-2 px-10" onClick={handleSave}>
            <Save className="h-4 w-4" /> Salvar Tudo
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
