import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import ClientesList from "@/pages/clientes/ClientesList";
import ClienteDetail from "@/pages/clientes/ClienteDetail";
import TrabajosList from "@/pages/trabajos/TrabajosList";
import TrabajoDetail from "@/pages/trabajos/TrabajoDetail";
import KanbanBoard from "@/pages/kanban/KanbanBoard";
import CalendarioPage from "@/pages/calendario/CalendarioPage";
import PagosPage from "@/pages/pagos/PagosPage";
import DocumentosPage from "@/pages/documentos/DocumentosPage";
import ReportesPage from "@/pages/reportes/ReportesPage";
import ConfiguracionPage from "@/pages/configuracion/ConfiguracionPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<ClientesList />} />
            <Route path="/clientes/:id" element={<ClienteDetail />} />
            <Route path="/trabajos" element={<TrabajosList />} />
            <Route path="/trabajos/:id" element={<TrabajoDetail />} />
            <Route path="/kanban" element={<KanbanBoard />} />
            <Route path="/calendario" element={<CalendarioPage />} />
            <Route path="/pagos" element={<PagosPage />} />
            <Route path="/documentos" element={<DocumentosPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
