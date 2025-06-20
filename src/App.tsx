
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ModelosMensagem from "./pages/ModelosMensagem";
import Configuracoes from "./pages/Configuracoes";
import Relatorios from "./pages/Relatorios";
import Locacoes from "./pages/Locacoes";
import NovaLocacao from "./pages/NovaLocacao";
import Despesas from "./pages/Despesas";
import NovaDespesa from "./pages/NovaDespesa";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/modelos-mensagem" element={<ModelosMensagem />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/locacoes" element={<Locacoes />} />
                <Route path="/locacoes/novo" element={<NovaLocacao />} />
                <Route path="/despesas" element={<Despesas />} />
                <Route path="/despesas/novo" element={<NovaDespesa />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
