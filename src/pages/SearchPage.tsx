import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import ProductCard from '@/components/marketplace/ProductCard';
import { products, categories } from '@/data/mock';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SearchPage = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    params.get('cat') ? [params.get('cat')!] : []
  );
  const [showFilters, setShowFilters] = useState(true);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setQuery('');
  };

  const results = useMemo(() => {
    let filtered = [...products];

    // Filtrar por categorias selecionadas
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.categoryId));
    }

    // Filtrar por texto de busca
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.storeName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [query, selectedCategories]);

  const hasActiveFilters = selectedCategories.length > 0 || query.trim().length > 0;

  return (
    <MarketplaceLayout>
      <div className="container py-8">
        {/* Barra de busca */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por produto, loja ou categoria..."
              className="pl-10 pr-10 h-12 text-lg rounded-full"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Botão de filtros */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtrar por Categoria
            {selectedCategories.length > 0 && (
              <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                {selectedCategories.length}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground gap-1">
              <X className="h-3 w-3" />
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Filtros de Categorias */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-xl bg-secondary/30 border animate-in slide-in-from-top-2 duration-200">
            {categories.map(cat => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
                    transition-all duration-200 border
                    ${isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                      : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Resultado da busca */}
        <div className="mb-4">
          {hasActiveFilters ? (
            <p className="text-sm text-muted-foreground">
              {results.length} resultado{results.length !== 1 ? 's' : ''}
              {query.trim() && (
                <> para "<span className="font-medium text-foreground">{query}</span>"</>
              )}
              {selectedCategories.length > 0 && (
                <> em{' '}
                  {selectedCategories.map((catId, i) => {
                    const cat = categories.find(c => c.id === catId);
                    return (
                      <span key={catId}>
                        {i > 0 && ', '}
                        <span className="font-medium text-foreground">{cat?.icon} {cat?.name}</span>
                      </span>
                    );
                  })}
                </>
              )}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecione uma categoria ou digite algo para buscar
            </p>
          )}
        </div>

        {/* Grid de produtos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        {results.length === 0 && hasActiveFilters && (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-muted-foreground mb-2">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground mb-4">Tente ajustar os filtros ou buscar outro termo</p>
            <Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>
          </div>
        )}
      </div>
    </MarketplaceLayout>
  );
};

export default SearchPage;
