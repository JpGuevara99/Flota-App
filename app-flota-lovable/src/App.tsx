import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FleetProvider } from "@/contexts/FleetContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import VehiclesPage from "./pages/VehiclesPage";
import DocumentsPage from "./pages/DocumentsPage";
import LibraryPage from "./pages/LibraryPage";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FleetProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/vehiculos" element={<VehiclesPage />} />
              <Route path="/documentos" element={<DocumentsPage />} />
              <Route path="/biblioteca" element={<LibraryPage />} />
              <Route path="/historial" element={<HistoryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </FleetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
