import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RecordatoriosProvider } from "@/components/recordatorios/RecordatoriosProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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
import LoginPage from "@/pages/auth/LoginPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <RecordatoriosProvider />
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
    </AppProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ProtectedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
