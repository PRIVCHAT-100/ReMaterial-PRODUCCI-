import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import ScrollToTop from "@/components/ScrollToTop"; // <-- Importa el nuevo componente
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import ProductDetail from "./pages/ProductDetail";
import SellProduct from "./pages/SellProduct";
import Messages from "./pages/Messages";
import Companies from "./pages/Companies";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyProducts from "./pages/MyProducts";
import Favorites from "./pages/Favorites";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Statistics from "./pages/Statistics";
import RepairData from "./pages/RepairData";
import CompanyProfile from "./pages/CompanyProfile";
import Settings from "./pages/Settings"; // ← NUEVO
import Category from "@/pages/Category";
import EditProduct from "@/pages/EditProduct"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Forzar scroll to top on cada cambio de ruta */}
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

const AppRoutes = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <Routes>
      {/* Home con Hero funcional */}
      <Route path="/" element={<Index onSearch={handleSearch} />} />

      {/* Rutas públicas */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/companies" element={<Companies />} />
      <Route path="/company/:id" element={<CompanyProfile />} />
      <Route path="/empresa/:id" element={<CompanyProfile />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/c/:cat" element={<Category />} />
      <Route path="/c/:cat/:sub" element={<Category />} />

      {/* 🔒 Editar producto ahora es PRIVADO */}
      <Route
        path="/product/:id/edit"
        element={
          <PrivateRoute>
            <EditProduct />
          </PrivateRoute>
        }
      />

      {/* Rutas protegidas */}
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
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/sell"
        element={
          <PrivateRoute requireSeller>
            <SellProduct />
          </PrivateRoute>
        }
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
        path="/my-products"
        element={
          <PrivateRoute>
            <MyProducts />
          </PrivateRoute>
        }
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
        path="/payment-success"
        element={
          <PrivateRoute>
            <PaymentSuccess />
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
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />  {/* ← AHORA USA Settings */}
          </PrivateRoute>
        }
      />
      <Route
        path="/repair-data"
        element={
          <PrivateRoute>
            <RepairData />
          </PrivateRoute>
        }
      />
      <Route path="/seller/:id" element={<Companies />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
