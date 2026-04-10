import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { stores } from '@/data/mock';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CartPage = () => {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  if (items.length === 0) return (
    <MarketplaceLayout>
      <div className="container py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Carrinho vazio</h2>
        <p className="text-muted-foreground mb-6">Explore nossos produtos e comece a comprar!</p>
        <Button asChild><Link to="/produtos">Ver Produtos</Link></Button>
      </div>
    </MarketplaceLayout>
  );

  // Group by store
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const sid = item.product.storeId;
    if (!acc[sid]) acc[sid] = [];
    acc[sid].push(item);
    return acc;
  }, {});

  return (
    <MarketplaceLayout>
      <div className="container py-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/produtos"><ArrowLeft className="h-4 w-4 mr-1" /> Continuar Comprando</Link>
        </Button>
        <h1 className="text-2xl font-bold mb-6">Carrinho ({itemCount} itens)</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {Object.entries(grouped).map(([storeId, storeItems]) => {
              const store = stores.find(s => s.id === storeId);
              return (
                <div key={storeId} className="rounded-xl border bg-card overflow-hidden">
                  <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 text-sm font-medium">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {store?.name.charAt(0)}
                    </div>
                    {store?.name}
                  </div>
                  <div className="divide-y">
                    {storeItems.map(({ product, quantity }) => (
                      <div key={product.id} className="flex gap-4 p-4">
                        <img src={product.image} alt={product.name} className="h-20 w-20 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Link to={`/produto/${product.id}`} className="text-sm font-medium hover:text-primary line-clamp-2">{product.name}</Link>
                          <p className="text-sm font-bold text-primary mt-1">{fmt(product.promoPrice || product.price)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive" onClick={() => removeItem(product.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-40 h-fit">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h3 className="font-semibold">Resumo do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(total)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span className="text-success">Grátis</span></div>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{fmt(total)}</span>
              </div>
              <Button className="w-full rounded-full" size="lg" asChild>
                <Link to="/checkout">Finalizar Compra</Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">Pagamento seguro via Pix ou cartão</p>
            </div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
};

export default CartPage;
