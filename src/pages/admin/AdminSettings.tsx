import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Type, Globe, RotateCcw, Save, Store, Megaphone, LayoutGrid, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteConfig, SiteTexts, SiteTheme, DEFAULT_TEXTS, DEFAULT_THEME, FONT_OPTIONS } from '@/contexts/SiteConfigContext';

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

/* ── HSL ↔ HEX helpers ─────────────────────────────────────────────── */
function hslToHex(hslStr: string): string {
  const parts = hslStr.trim().split(/\s+/);
  const h = parseFloat(parts[0] || '0');
  const s = parseFloat(parts[1] || '0') / 100;
  const l = parseFloat(parts[2] || '0') / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  const h6 = hex.replace('#', '');
  r = parseInt(h6.substring(0, 2), 16) / 255;
  g = parseInt(h6.substring(2, 4), 16) / 255;
  b = parseInt(h6.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0, sat = 0;
  const light = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: hue = ((b - r) / d + 2); break;
      case b: hue = ((r - g) / d + 4); break;
    }
    hue *= 60;
  }
  return `${Math.round(hue)} ${Math.round(sat * 100)}% ${Math.round(light * 100)}%`;
}

/* ── Color Picker Row ──────────────────────────────────────────────── */
const ColorField = ({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string;
}) => (
  <div className="flex items-center gap-3">
    <input
      type="color"
      value={hslToHex(value)}
      onChange={e => onChange(hexToHsl(e.target.value))}
      className="h-10 w-14 rounded-lg border border-input cursor-pointer shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <code className="text-[10px] text-muted-foreground">{value}</code>
    </div>
  </div>
);

const AdminSettings = () => {
  const { lang, setLang, langs } = useLanguage();
  const { texts, setTexts, theme, setTheme } = useSiteConfig();
  const [local, setLocal] = useState<SiteTexts>({ ...texts });
  const [localTheme, setLocalTheme] = useState<SiteTheme>({ ...theme });

  const set = (k: keyof SiteTexts) => (v: string) => setLocal(t => ({ ...t, [k]: v }));
  const setT = (k: keyof SiteTheme) => (v: string) => setLocalTheme(t => ({ ...t, [k]: v }));

  const handleSave = () => {
    setTexts(local);
    setTheme(localTheme);
    toast.success('Configurações salvas! As alterações já estão no site.');
  };

  const handleReset = () => {
    setLocal({ ...DEFAULT_TEXTS });
    setTexts({ ...DEFAULT_TEXTS });
    setLocalTheme({ ...DEFAULT_THEME });
    setTheme({ ...DEFAULT_THEME });
    toast.success('Tudo restaurado para o padrão.');
  };

  const handleLangChange = (v: string) => {
    setLang(v as any);
    toast.success(`Idioma alterado para ${langs.find(l => l.value === v)?.label}`);
  };

  const radiusNum = parseFloat(localTheme.buttonRadius) || 0.75;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Configurações do Site</h1>
            <p className="text-sm text-muted-foreground">Controle todos os textos, cores e fontes do marketplace</p>
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

        <Tabs defaultValue="aparencia">
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="aparencia" className="gap-2"><Palette className="h-4 w-4" /> Aparência</TabsTrigger>
            <TabsTrigger value="geral" className="gap-2"><Type className="h-4 w-4" /> Geral</TabsTrigger>
            <TabsTrigger value="hero" className="gap-2"><Megaphone className="h-4 w-4" /> Hero</TabsTrigger>
            <TabsTrigger value="secoes" className="gap-2"><LayoutGrid className="h-4 w-4" /> Seções</TabsTrigger>
            <TabsTrigger value="lojista" className="gap-2"><Store className="h-4 w-4" /> CTA Lojista</TabsTrigger>
            <TabsTrigger value="idioma" className="gap-2"><Globe className="h-4 w-4" /> Idioma</TabsTrigger>
          </TabsList>

          {/* ── APARÊNCIA ── */}
          <TabsContent value="aparencia">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Cores */}
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Cores do Site</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <ColorField label="Cor Primária" value={localTheme.primaryColor} onChange={setT('primaryColor')} hint="Botões, links, header, sidebar" />
                  <ColorField label="Cor de Destaque" value={localTheme.accentColor} onChange={setT('accentColor')} hint="Tags, promoções, CTAs secundários" />
                  <ColorField label="Fundo do Site" value={localTheme.backgroundColor} onChange={setT('backgroundColor')} hint="Cor de fundo geral" />
                  <ColorField label="Cor dos Textos" value={localTheme.foregroundColor} onChange={setT('foregroundColor')} hint="Títulos e textos principais" />
                  <ColorField label="Cor dos Cards" value={localTheme.cardColor} onChange={setT('cardColor')} hint="Cards de produto, popups" />
                  <ColorField label="Cor de Muted" value={localTheme.mutedColor} onChange={setT('mutedColor')} hint="Fundos secundários, inputs" />
                  <ColorField label="Cor das Bordas" value={localTheme.borderColor} onChange={setT('borderColor')} hint="Bordas, separadores" />
                </CardContent>
              </Card>

              {/* Fontes e Raio */}
              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader><CardTitle className="text-base">Tipografia</CardTitle></CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fonte dos Títulos</Label>
                      <Select value={localTheme.fontHeading} onValueChange={setT('fontHeading')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map(f => (
                            <SelectItem key={f} value={f}><span style={{ fontFamily: `'${f}', sans-serif` }}>{f}</span></SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-3xl font-bold" style={{ fontFamily: `'${localTheme.fontHeading}', sans-serif` }}>
                        Compra Aí
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fonte do Corpo</Label>
                      <Select value={localTheme.fontBody} onValueChange={setT('fontBody')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map(f => (
                            <SelectItem key={f} value={f}><span style={{ fontFamily: `'${f}', sans-serif` }}>{f}</span></SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm" style={{ fontFamily: `'${localTheme.fontBody}', sans-serif` }}>
                        Produtos incríveis de lojas da sua cidade. Entrega no mesmo dia, retirada na loja.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader><CardTitle className="text-base">Arredondamento dos Botões</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Slider
                      value={[radiusNum]}
                      onValueChange={([v]) => setT('buttonRadius')(`${v}rem`)}
                      min={0} max={2} step={0.125}
                    />
                    <div className="flex items-center gap-3">
                      <code className="text-xs text-muted-foreground">{localTheme.buttonRadius}</code>
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 text-sm font-medium text-white"
                          style={{
                            background: `hsl(${localTheme.primaryColor})`,
                            borderRadius: localTheme.buttonRadius,
                          }}
                        >
                          Botão Primário
                        </button>
                        <button
                          className="px-4 py-2 text-sm font-medium text-white"
                          style={{
                            background: `hsl(${localTheme.accentColor})`,
                            borderRadius: localTheme.buttonRadius,
                          }}
                        >
                          Botão Destaque
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Preview */}
                <Card className="shadow-card">
                  <CardHeader><CardTitle className="text-base">Pré-visualização</CardTitle></CardHeader>
                  <CardContent>
                    <div
                      className="rounded-xl overflow-hidden border"
                      style={{ background: `hsl(${localTheme.backgroundColor})` }}
                    >
                      <div className="px-4 py-3 flex items-center gap-2" style={{ background: `hsl(${localTheme.primaryColor})` }}>
                        <div className="h-6 w-6 rounded-md bg-white/20" />
                        <span className="text-sm font-bold text-white" style={{ fontFamily: `'${localTheme.fontHeading}', sans-serif` }}>
                          {local.site_name}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        <h3 className="text-lg font-bold" style={{ color: `hsl(${localTheme.foregroundColor})`, fontFamily: `'${localTheme.fontHeading}', sans-serif` }}>
                          Título de Exemplo
                        </h3>
                        <p className="text-sm" style={{ color: `hsl(${localTheme.foregroundColor} / 0.7)`, fontFamily: `'${localTheme.fontBody}', sans-serif` }}>
                          Texto do corpo do site com a fonte selecionada.
                        </p>
                        <div className="flex gap-2">
                          <span
                            className="px-3 py-1.5 text-xs font-bold text-white"
                            style={{ background: `hsl(${localTheme.primaryColor})`, borderRadius: localTheme.buttonRadius }}
                          >
                            Comprar
                          </span>
                          <span
                            className="px-3 py-1.5 text-xs font-bold text-white"
                            style={{ background: `hsl(${localTheme.accentColor})`, borderRadius: localTheme.buttonRadius }}
                          >
                            Promoção
                          </span>
                        </div>
                        <div
                          className="p-3 rounded-lg border"
                          style={{ background: `hsl(${localTheme.cardColor})`, borderColor: `hsl(${localTheme.borderColor})` }}
                        >
                          <p className="text-xs" style={{ color: `hsl(${localTheme.foregroundColor})` }}>Card de produto</p>
                          <p className="text-lg font-bold" style={{ color: `hsl(${localTheme.primaryColor})` }}>R$ 49,90</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

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
