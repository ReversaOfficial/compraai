import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Type, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminSettings = () => {
  const { lang, setLang, langs } = useLanguage();
  const [settings, setSettings] = useState({
    site_name: 'Vitrine',
    site_description: 'Marketplace local da sua cidade',
    hero_title: 'Descubra o melhor da sua cidade',
    hero_subtitle: 'Compre online de lojas locais com entrega rápida ou retire na loja',
    footer_text: '© 2026 Vitrine. Todos os direitos reservados.',
    primary_color: '#16a34a',
    accent_color: '#22c55e',
  });

  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  const handleLangChange = (v: string) => {
    setLang(v as any);
    toast.success(`Idioma alterado para ${langs.find(l => l.value === v)?.label}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configurações da Loja</h1>
            <p className="text-sm text-muted-foreground">Personalize textos, cores e idioma do marketplace</p>
          </div>
          <Button className="rounded-full" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Salvar Tudo
          </Button>
        </div>

        {/* Language Switch */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" /> Idioma do Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Troque o idioma de toda a loja com um clique. Isso altera todos os textos da interface pública.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {langs.map(l => (
                <Button
                  key={l.value}
                  variant={lang === l.value ? 'default' : 'outline'}
                  className="rounded-full h-12 text-base"
                  onClick={() => handleLangChange(l.value)}
                >
                  {l.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Texts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Type className="h-5 w-5 text-primary" /> Textos do Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do site</Label>
                <Input
                  value={settings.site_name}
                  onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={settings.site_description}
                  onChange={e => setSettings(s => ({ ...s, site_description: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título do Hero</Label>
              <Input
                value={settings.hero_title}
                onChange={e => setSettings(s => ({ ...s, hero_title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo do Hero</Label>
              <Textarea
                value={settings.hero_subtitle}
                onChange={e => setSettings(s => ({ ...s, hero_subtitle: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Texto do Rodapé</Label>
              <Input
                value={settings.footer_text}
                onChange={e => setSettings(s => ({ ...s, footer_text: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-primary" /> Cores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={e => setSettings(s => ({ ...s, primary_color: e.target.value }))}
                    className="h-10 w-14 rounded-lg border cursor-pointer"
                  />
                  <Input
                    value={settings.primary_color}
                    onChange={e => setSettings(s => ({ ...s, primary_color: e.target.value }))}
                    className="flex-1"
                  />
                </div>
                <div className="h-8 rounded-lg" style={{ backgroundColor: settings.primary_color }} />
              </div>
              <div className="space-y-2">
                <Label>Cor de Destaque</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.accent_color}
                    onChange={e => setSettings(s => ({ ...s, accent_color: e.target.value }))}
                    className="h-10 w-14 rounded-lg border cursor-pointer"
                  />
                  <Input
                    value={settings.accent_color}
                    onChange={e => setSettings(s => ({ ...s, accent_color: e.target.value }))}
                    className="flex-1"
                  />
                </div>
                <div className="h-8 rounded-lg" style={{ backgroundColor: settings.accent_color }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
