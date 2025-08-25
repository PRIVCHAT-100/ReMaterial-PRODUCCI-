import React from "react";
import "./i18n";
import "@/setupAutoToasts";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import ScrollToTop from "@/components/ScrollToTop";
import LanguageNudge from "@/components/i18n/LanguageNudge";

// Páginas
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import ProductDetail from "@/pages/ProductDetail";
import Messages from "@/pages/Messages";
import SellProduct from "@/pages/SellProduct";
import MyProducts from "@/pages/MyProducts";
import EditProduct from "@/pages/EditProduct";
import Favorites from "@/pages/Favorites";
import Companies from "@/pages/Companies";
import CompanyProfile from "@/pages/CompanyProfile";
import Category from "@/pages/Category";
import Statistics from "@/pages/Statistics";
import SettingsPage from "@/pages/Settings/index";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import RepairData from "@/pages/RepairData";
import PaymentSuccess from "@/pages/PaymentSuccess";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { useTranslation } from "react-i18next";


// ✅ NUEVO: páginas públicas de ayuda
import HelpCenter from "@/pages/HelpCenter";
import HowItWorks from "@/pages/HowItWorks";
import SellerRoute from "@/components/SellerRoute";
import UpgradeSeller from "@/pages/UpgradeSeller";

const queryClient = new QueryClient();
const maintenance = import.meta.env.VITE_MAINTENANCE === 'true';

function MaintenanceScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-bold mb-2">Estamos en mantenimiento</h1>
        <p className="text-muted-foreground mb-4">
          Volvemos en breve. Gracias por tu paciencia.
        </p>
        <small className="opacity-70">
          {t('ui.si-ves-esto-por-error-revisa-la-variable')}
          <code>VITE_MAINTENANCE</code> y vuelve a desplegar.
        </small>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  if (maintenance) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <MaintenanceScreen />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <LanguageNudge />
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />

              {/* 🚑 Alias para "explorar" productos usados por Favoritos/botones */}
              <Route path="/explore" element={<Index />} />
              <Route path="/explorar" element={<Index />} />

              {/* Públicas: detalle de producto */}
              <Route path="/products/:id" element={<ProductDetail />} />
              {/* ➕ ALIAS nuevo para tu error reportado */}
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* ✅ NUEVO: páginas públicas de ayuda */}
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/how-it-works" element={<HowItWorks />} />

              {/* Legales / públicas */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/repair-data" element={<RepairData />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />

              {/* Protegidas */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={<SellerRoute><PrivateRoute>
                    <Dashboard />
                  </PrivateRoute></SellerRoute>}
              />
              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <Messages />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sell"
                element={<SellerRoute>
                  <PrivateRoute>
                    <SellProduct />
                  </PrivateRoute>
                </SellerRoute>}
              />
              <Route
                path="/my-products"
                element={<SellerRoute>
                  <PrivateRoute>
                    <MyProducts />
                  </PrivateRoute>
                </SellerRoute>}
              />
              <Route
                path="/edit/:id"
                element={<SellerRoute>
                  <PrivateRoute>
                    <EditProduct />
                  </PrivateRoute>
                </SellerRoute>}
              />
              <Route
                path="/favorites"
                element={
                  <PrivateRoute>
                    <Favorites />
                  </PrivateRoute>
                }
              />
              <Route
                path="/companies"
                element={
                  <PrivateRoute>
                    <Companies />
                  </PrivateRoute>
                }
              />
              <Route
                path="/companies/:id"
                element={
                  <PrivateRoute>
                    <CompanyProfile />
                  </PrivateRoute>
                }
              />
              {/* ➕ ALIAS nuevo para tu error reportado */}
              <Route
                path="/company/:id"
                element={
                  <PrivateRoute>
                    <CompanyProfile />
                  </PrivateRoute>
                }
              />
              {/* ➕ ALIAS nuevo en español para tu error reportado */}
              <Route
                path="/empresa/:id"
                element={
                  <PrivateRoute>
                    <CompanyProfile />
                  </PrivateRoute>
                }
              />

              <Route
                path="/category/:category"
                element={
                  <PrivateRoute>
                    <Category />
                  </PrivateRoute>
                }
              />
              <Route
                path="/statistics"
                element={
                  <PrivateRoute>
                    <Statistics />
                  </PrivateRoute>
                }
              />
              {/* ➕ ALIAS nuevo: /analytics → Statistics */}
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <Statistics />
                  </PrivateRoute>
                }
              />

              {/* Configuración */}
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
              <Route path="/upgrade-seller" element={<UpgradeSeller />} />
</Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;