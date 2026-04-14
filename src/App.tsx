import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { PlansProvider } from "@/contexts/PlansContext";
import { MediaProvider } from "@/contexts/MediaContext";

import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AccountPage from "./pages/AccountPage";
import StorePage from "./pages/StorePage";
import SellerSignupPage from "./pages/SellerSignupPage";

import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerFinancials from "./pages/seller/SellerFinancials";
import SellerSettings from "./pages/seller/SellerSettings";
import SellerPlans from "./pages/seller/SellerPlans";
import SellerMedia from "./pages/seller/SellerMedia";
import SellerDelivery from "./pages/seller/SellerDelivery";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStores from "./pages/admin/AdminStores";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminFinancials from "./pages/admin/AdminFinancials";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminPopup from "./pages/admin/AdminPopup";

import NotFound from "./pages/NotFound";
import PromoPopup from "./components/marketplace/PromoPopup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SiteConfigProvider>
        <PlansProvider>
          <MediaProvider>
            <LanguageProvider>
              <AuthProvider>
                <CartProvider>
                  <Toaster />
                  <Sonner />
                  <PromoPopup />
                  <BrowserRouter>
                    <Routes>
                      {/* Public */}
                      <Route path="/" element={<Index />} />
                      <Route path="/produtos" element={<ProductsPage />} />
                      <Route path="/produto/:id" element={<ProductDetailPage />} />
                      <Route path="/carrinho" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/busca" element={<SearchPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/cadastro" element={<SignupPage />} />
                      <Route path="/cadastro-lojista" element={<SellerSignupPage />} />
                      <Route path="/conta" element={<AccountPage />} />
                      <Route path="/loja/:id" element={<StorePage />} />

                      {/* Seller */}
                      <Route path="/lojista" element={<SellerDashboard />} />
                      <Route path="/lojista/produtos" element={<SellerProducts />} />
                      <Route path="/lojista/pedidos" element={<SellerOrders />} />
                      <Route path="/lojista/financeiro" element={<SellerFinancials />} />
                      <Route path="/lojista/planos" element={<SellerPlans />} />
                      <Route path="/lojista/midia" element={<SellerMedia />} />
                      <Route path="/lojista/entregas" element={<SellerDelivery />} />
                      <Route path="/lojista/configuracoes" element={<SellerSettings />} />

                      {/* Admin */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/lojistas" element={<AdminStores />} />
                      <Route path="/admin/produtos" element={<AdminProducts />} />
                      <Route path="/admin/pedidos" element={<AdminOrders />} />
                      <Route path="/admin/financeiro" element={<AdminFinancials />} />
                      <Route path="/admin/planos" element={<AdminPlans />} />
                      <Route path="/admin/banners" element={<AdminBanners />} />
                      <Route path="/admin/pagamentos" element={<AdminPayments />} />
                      <Route path="/admin/avaliacoes" element={<AdminReviews />} />
                      <Route path="/admin/notificacoes" element={<AdminNotifications />} />
                      <Route path="/admin/popup" element={<AdminPopup />} />
                      <Route path="/admin/configuracoes" element={<AdminSettings />} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </CartProvider>
              </AuthProvider>
            </LanguageProvider>
          </MediaProvider>
        </PlansProvider>
      </SiteConfigProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
