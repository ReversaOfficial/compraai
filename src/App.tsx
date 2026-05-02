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
import SellerPayouts from "./pages/seller/SellerPayouts";
import SellerSettings from "./pages/seller/SellerSettings";
import SellerPlans from "./pages/seller/SellerPlans";
import SellerMedia from "./pages/seller/SellerMedia";
import SellerDelivery from "./pages/seller/SellerDelivery";

import CourierAvailable from "./pages/courier/CourierAvailable";
import CourierHistory from "./pages/courier/CourierHistory";
import CourierEarnings from "./pages/courier/CourierEarnings";
import CourierProfile from "./pages/courier/CourierProfile";
import CourierSignup from "./pages/courier/CourierSignup";

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
import AdminFreightTable from "./pages/admin/AdminFreightTable";
import AdminCouriers from "./pages/admin/AdminCouriers";
import AdminDeliveries from "./pages/admin/AdminDeliveries";
import AdminCourierFinancials from "./pages/admin/AdminCourierFinancials";

import NotFound from "./pages/NotFound";
import PromoPopup from "./components/marketplace/PromoPopup";
import ProtectedRoute from "./components/ProtectedRoute";

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
                      <Route path="/conta" element={<ProtectedRoute requiredRole="customer"><AccountPage /></ProtectedRoute>} />
                      <Route path="/loja/:id" element={<StorePage />} />

                      {/* Seller */}
                      <Route path="/lojista" element={<ProtectedRoute requiredRole="seller"><SellerDashboard /></ProtectedRoute>} />
                      <Route path="/lojista/produtos" element={<ProtectedRoute requiredRole="seller"><SellerProducts /></ProtectedRoute>} />
                      <Route path="/lojista/pedidos" element={<ProtectedRoute requiredRole="seller"><SellerOrders /></ProtectedRoute>} />
                      <Route path="/lojista/financeiro" element={<ProtectedRoute requiredRole="seller"><SellerFinancials /></ProtectedRoute>} />
                      <Route path="/lojista/repasses" element={<ProtectedRoute requiredRole="seller"><SellerPayouts /></ProtectedRoute>} />
                      <Route path="/lojista/planos" element={<ProtectedRoute requiredRole="seller"><SellerPlans /></ProtectedRoute>} />
                      <Route path="/lojista/midia" element={<ProtectedRoute requiredRole="seller"><SellerMedia /></ProtectedRoute>} />
                      <Route path="/lojista/entregas" element={<ProtectedRoute requiredRole="seller"><SellerDelivery /></ProtectedRoute>} />
                      <Route path="/lojista/configuracoes" element={<ProtectedRoute requiredRole="seller"><SellerSettings /></ProtectedRoute>} />

                      {/* Courier */}
                      <Route path="/freteiro" element={<ProtectedRoute requiredRole="courier"><CourierAvailable /></ProtectedRoute>} />
                      <Route path="/freteiro/cadastro" element={<CourierSignup />} />
                      <Route path="/freteiro/historico" element={<ProtectedRoute requiredRole="courier"><CourierHistory /></ProtectedRoute>} />
                      <Route path="/freteiro/ganhos" element={<ProtectedRoute requiredRole="courier"><CourierEarnings /></ProtectedRoute>} />
                      <Route path="/freteiro/perfil" element={<ProtectedRoute requiredRole="courier"><CourierProfile /></ProtectedRoute>} />

                      {/* Admin */}
                      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                      <Route path="/admin/lojistas" element={<ProtectedRoute requiredRole="admin"><AdminStores /></ProtectedRoute>} />
                      <Route path="/admin/produtos" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
                      <Route path="/admin/pedidos" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
                      <Route path="/admin/financeiro" element={<ProtectedRoute requiredRole="admin"><AdminFinancials /></ProtectedRoute>} />
                      <Route path="/admin/planos" element={<ProtectedRoute requiredRole="admin"><AdminPlans /></ProtectedRoute>} />
                      <Route path="/admin/banners" element={<ProtectedRoute requiredRole="admin"><AdminBanners /></ProtectedRoute>} />
                      <Route path="/admin/pagamentos" element={<ProtectedRoute requiredRole="admin"><AdminPayments /></ProtectedRoute>} />
                      <Route path="/admin/avaliacoes" element={<ProtectedRoute requiredRole="admin"><AdminReviews /></ProtectedRoute>} />
                      <Route path="/admin/notificacoes" element={<ProtectedRoute requiredRole="admin"><AdminNotifications /></ProtectedRoute>} />
                      <Route path="/admin/popup" element={<ProtectedRoute requiredRole="admin"><AdminPopup /></ProtectedRoute>} />
                      <Route path="/admin/tabela-frete" element={<ProtectedRoute requiredRole="admin"><AdminFreightTable /></ProtectedRoute>} />
                      <Route path="/admin/freteiros" element={<ProtectedRoute requiredRole="admin"><AdminCouriers /></ProtectedRoute>} />
                      <Route path="/admin/entregas" element={<ProtectedRoute requiredRole="admin"><AdminDeliveries /></ProtectedRoute>} />
                      <Route path="/admin/financeiro-freteiros" element={<ProtectedRoute requiredRole="admin"><AdminCourierFinancials /></ProtectedRoute>} />
                      <Route path="/admin/configuracoes" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

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
