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
import Agentes from "./pages/Agentes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/agentes" element={<Layout><Agentes /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
