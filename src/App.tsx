import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
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
import NotFound from "./pages/NotFound";
import { useSchemaCheck } from "./hooks/useSchemaCheck";

const queryClient = new QueryClient();

const AppContent = () => {
  useSchemaCheck(); // Verificação automática de esquema
  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/crm" element={<Layout><CRM /></Layout>} />
          <Route path="/whatsapp" element={<Layout><WhatsApp /></Layout>} />
          <Route path="/agendamentos" element={<Layout><Agendamentos /></Layout>} />
          <Route path="/financeiro" element={<Layout><Financeiro /></Layout>} />
          <Route path="/fiscal" element={<Layout><Fiscal /></Layout>} />
          <Route path="/produtos" element={<Layout><Produtos /></Layout>} />
          <Route path="/agentes" element={<Layout><Agentes /></Layout>} />
          <Route path="/relatorios" element={<Layout><Relatorios /></Layout>} />
          <Route path="/configuracoes" element={<Layout><Configuracoes /></Layout>} />
          <Route path="/database-config" element={<Layout><DatabaseConfig /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;