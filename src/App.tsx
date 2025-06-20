
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ListaApartamentos } from './components/ListaApartamentos';
import { FormularioLocacao } from './components/FormularioLocacao';
import { ListaLocacoes } from './components/ListaLocacoes';
import { Dashboard as Index } from './components/Dashboard';
import { NotFound } from './components/NotFound';
import { FormularioDespesa } from './components/FormularioDespesa';
import { ListaDespesas } from './components/ListaDespesas';
import { Configuracoes } from './components/Configuracoes';
import { Relatorios } from './components/Relatorios';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';

function App() {
  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-slate-50">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-white px-4 shadow-sm">
              <SidebarTrigger className="text-slate-600 hover:text-slate-900" />
              <div className="flex-1" />
            </header>
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/apartamentos" element={<ListaApartamentos />} />
                <Route path="/locacoes/novo" element={<FormularioLocacao />} />
                <Route path="/locacoes" element={<ListaLocacoes />} />
                <Route path="/despesas/novo" element={<FormularioDespesa />} />
                <Route path="/despesas" element={<ListaDespesas />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </Router>
  );
}

export default App;
