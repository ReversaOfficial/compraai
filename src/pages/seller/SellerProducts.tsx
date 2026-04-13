import { useState, useRef } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Upload, Download, Sparkles } from 'lucide-react';
import SellerLayout from '@/components/seller/SellerLayout';
import { products, categories } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useMedia } from '@/contexts/MediaContext';
import { Link } from 'react-router-dom';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const storeProducts = products.filter(p => p.storeId === 's1' || p.storeId === 's2');

const CSV_TEMPLATE = 'nome,descricao,preco,preco_promo,categoria,estoque,imagem\nCamiseta Básica,Camiseta de algodão,49.90,,Moda,100,https://exemplo.com/img.jpg';

const SellerProducts = () => {
  const [search, setSearch] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [promoteOpen, setPromoteOpen] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { isProductHighlighted } = useMedia();

  const filtered = storeProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'template_produtos.csv'; a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setImportData(text);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importData) { toast.error('Nenhum arquivo carregado'); return; }
    const lines = importData.trim().split('\n').slice(1).filter(l => l.trim());
    toast.success(`${lines.length} produto(s) processado(s)! (Simulação — conecte ao banco de dados)`);
    setImportOpen(false);
    setImportData('');
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Produtos</h1>
            <p className="text-sm text-muted-foreground">{storeProducts.length} produtos cadastrados</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" /> Importar CSV
            </Button>
            <Button className="rounded-full gap-2" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" /> Novo Produto
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar produtos..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Badge variant="secondary">{filtered.length} resultado(s)</Badge>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Produto</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">Categoria</th>
                  <th className="text-right p-3 font-medium">Preço</th>
                  <th className="text-center p-3 font-medium hidden sm:table-cell">Estoque</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                          {isProductHighlighted(p.id) && (
                            <div className="absolute -top-1 -right-1 bg-accent rounded-full p-0.5">
                              <Sparkles className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{p.name}</span>
                          {isProductHighlighted(p.id) && (
                            <Badge className="ml-2 bg-accent/10 text-accent text-[10px] py-0">Patrocinado</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{p.category}</td>
                    <td className="p-3 text-right font-medium">
                      <div>
                        {p.promoPrice ? (
                          <>
                            <p className="text-accent font-bold">{fmt(p.promoPrice)}</p>
                            <p className="text-xs text-muted-foreground line-through">{fmt(p.price)}</p>
                          </>
                        ) : fmt(p.price)}
                      </div>
                    </td>
                    <td className="p-3 text-center hidden sm:table-cell">
                      <span className={p.stock < 5 ? 'text-destructive font-bold' : ''}>{p.stock}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={`border-0 text-xs ${p.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {p.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem>{p.isActive ? <><EyeOff className="h-4 w-4 mr-2" /> Desativar</> : <><Eye className="h-4 w-4 mr-2" /> Ativar</>}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-accent font-medium" onClick={() => setPromoteOpen(p.id)}>
                            <Sparkles className="h-4 w-4 mr-2" /> Promover produto
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Product Dialog */}
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Cadastrar Produto</DialogTitle></DialogHeader>
            <Tabs defaultValue="basic">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="basic" className="flex-1">Dados básicos</TabsTrigger>
                <TabsTrigger value="images" className="flex-1">Imagens</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div><Label>Nome do produto *</Label><Input placeholder="Ex: Camiseta Básica Branca" /></div>
                <div><Label>Descrição</Label><Textarea placeholder="Descreva o produto..." rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Preço *</Label><Input type="number" placeholder="0,00" /></div>
                  <div><Label>Preço Promocional</Label><Input type="number" placeholder="0,00" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Categoria</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Estoque</Label><Input type="number" placeholder="0" /></div>
                </div>
                <div className="flex items-center gap-2 text-sm p-3 bg-muted rounded-lg">
                  <input type="checkbox" id="delivery" className="rounded" />
                  <Label htmlFor="delivery">Disponível para entrega</Label>
                  <input type="checkbox" id="pickup" className="rounded ml-3" />
                  <Label htmlFor="pickup">Retirada na loja</Label>
                </div>
              </TabsContent>
              <TabsContent value="images" className="space-y-4">
                <div><Label>URL da imagem principal *</Label><Input placeholder="https://..." /></div>
                <div><Label>Imagens adicionais (URLs separadas por vírgula)</Label>
                  <Textarea placeholder="https://img1.com, https://img2.com..." rows={3} /></div>
                <div className="rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>Upload direto disponível em breve</p>
                </div>
              </TabsContent>
            </Tabs>
            <Button className="w-full rounded-full mt-2" onClick={() => { toast.success('Produto cadastrado!'); setNewOpen(false); }}>
              Cadastrar Produto
            </Button>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Importar Produtos via CSV</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                <p className="font-semibold">Formato do arquivo CSV:</p>
                <code className="block text-xs bg-white border rounded p-2 whitespace-pre">nome,descricao,preco,preco_promo,categoria,estoque,imagem</code>
                <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
                  <Download className="h-4 w-4" /> Baixar template
                </Button>
              </div>
              <div>
                <Label>Arquivo CSV</Label>
                <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileUpload} />
                <div className="mt-2 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileRef.current?.click()}>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{importData ? '✅ Arquivo carregado!' : 'Clique para selecionar o arquivo'}</p>
                  <p className="text-xs text-muted-foreground mt-1">CSV ou Excel até 5MB</p>
                </div>
              </div>
              {importData && (
                <div className="rounded-lg bg-muted p-3 text-xs max-h-32 overflow-y-auto">
                  <pre>{importData.split('\n').slice(0, 5).join('\n')}</pre>
                  {importData.split('\n').length > 5 && <p className="text-muted-foreground">...e mais {importData.split('\n').length - 5} linhas</p>}
                </div>
              )}
              <Button className="w-full gap-2" onClick={handleImport} disabled={!importData}>
                <Upload className="h-4 w-4" /> Importar {importData ? importData.split('\n').filter(l => l.trim()).length - 1 : 0} produto(s)
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Promote Dialog */}
        <Dialog open={!!promoteOpen} onOpenChange={o => { if (!o) setPromoteOpen(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Promover Produto</DialogTitle></DialogHeader>
            <div className="py-4 text-center space-y-3">
              <Sparkles className="h-12 w-12 mx-auto text-accent" />
              <p className="text-sm text-muted-foreground">Quer destacar este produto com badge "Patrocinado"?</p>
              <Button className="w-full bg-accent hover:bg-accent/90 gap-2" asChild>
                <Link to="/lojista/midia" onClick={() => setPromoteOpen(null)}>
                  <Sparkles className="h-4 w-4" /> Ir para Mídia & Publicidade
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SellerLayout>
  );
};

export default SellerProducts;
