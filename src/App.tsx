import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PortalLayout from "./components/PortalLayout"; // Import the new layout
import Dashboard from "./pages/Dashboard"; // Import the new dashboard

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} /> {/* Redirect /portal to /portal/dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            {/* Placeholder routes for other navigation items */}
            <Route path="transactions" element={<div className="p-4 text-center">Página de Transações (Em breve)</div>} />
            <Route path="goals" element={<div className="p-4 text-center">Página de Metas (Em breve)</div>} />
            <Route path="billing" element={<div className="p-4 text-center">Página de Plano (Em breve)</div>} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;