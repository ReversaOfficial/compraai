import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import ProductCard from '@/components/marketplace/ProductCard';
import { products, categories, stores } from '@/data/mock';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const ProductsPage = () => {
  const [params] = useSearchParams();
  const [sort, setSort] = useState(params.get('sort') || 'relevance');
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [storeFilter, setStoreFilter] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let items = [...products];
    if (catFilter.length) items = items.filter(p => catFilter.includes(p.categoryId));
    if (storeFilter.length) items = items.filter(p => storeFilter.includes(p.storeId));
    if (params.get('filter') === 'promo') items = items.filter(p => p.promoPrice);

    switch (sort) {
      case 'price_asc': items.sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price)); break;
      case 'price_desc': items.sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price)); break;
      case 'newest': items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case 'sold': items.sort((a, b) => b.sold - a.sold); break;
    }
    return items;
  }, [sort, catFilter, storeFilter, params]);

  const toggleCat = (catId: string) => setCatFilter(prev => prev.includes(catId) ? prev.filter(x => x !== catId) : [...prev, catId]);
  const toggleStore = (s: string) => setStoreFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  return (
    <MarketplaceLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevância</SelectItem>
              <SelectItem value="price_asc">Menor Preço</SelectItem>
              <SelectItem value="price_desc">Maior Preço</SelectItem>
              <SelectItem value="newest">Mais Recentes</SelectItem>
              <SelectItem value="sold">Mais Vendidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Filters */}
          <aside className="space-y-6 hidden lg:block">
            <div>
              <h3 className="font-semibold mb-3 text-sm">Categorias</h3>
              <div className="space-y-2">
                {categories.map(c => (
                  <div key={c.id} className="flex items-center gap-2">
                    <Checkbox id={`cat-${c.id}`} checked={catFilter.includes(c.id)} onCheckedChange={() => toggleCat(c.id)} />
                    <Label htmlFor={`cat-${c.id}`} className="text-sm cursor-pointer flex items-center gap-1.5">
                      <span>{c.icon}</span> {c.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm">Lojas</h3>
              <div className="space-y-2">
                {stores.map(s => (
                  <div key={s.id} className="flex items-center gap-2">
                    <Checkbox id={`store-${s.id}`} checked={storeFilter.includes(s.id)} onCheckedChange={() => toggleStore(s.id)} />
                    <Label htmlFor={`store-${s.id}`} className="text-sm cursor-pointer">{s.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            {filtered.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">Nenhum produto encontrado.</p>}
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
};

export default ProductsPage;
