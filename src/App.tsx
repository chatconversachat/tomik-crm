import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CRM from "./pages/CRM";
import WhatsApp from "./pages/WhatsApp";
import Agendamentos from "./pages/Agendamentos";
import Financeiro from "./pages/Financeiro";
import Fiscal from "./pages/Fiscal";
import Agentes from "./pages/Agentes";
import Configuracoes from "./pages/Configuracoes";
import Produtos from "./pages/Produtos";
import Relatorios from "./pages/Relatorios";
import DatabaseConfig from "./pages/DatabaseConfig";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute><Layout><CRM /></Layout></ProtectedRoute>} />
            <Route path="/whatsapp" element={<ProtectedRoute><Layout><WhatsApp /></Layout></ProtectedRoute>} />
            <Route path="/agendamentos" element={<ProtectedRoute><Layout><Agendamentos /></Layout></ProtectedRoute>} />
            <Route path="/financeiro" element={<ProtectedRoute><Layout><Financeiro /></Layout></ProtectedRoute>} />
            <Route path="/fiscal" element={<ProtectedRoute><Layout><Fiscal /></Layout></ProtectedRoute>} />
            <Route path="/produtos" element={<ProtectedRoute><Layout><Produtos /></Layout></ProtectedRoute>} />
            <Route path="/agentes" element={<ProtectedRoute><Layout><Agentes /></Layout></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Layout><Relatorios /></Layout></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Layout><Configuracoes /></Layout></ProtectedRoute>} />
            <Route path="/database-config" element={<ProtectedRoute><Layout><DatabaseConfig /></Layout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Layout><Admin /></Layout></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;