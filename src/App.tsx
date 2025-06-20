
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { ListaApartamentos } from './components/ListaApartamentos';
import { FormularioLocacao } from './components/FormularioLocacao';
import { ListaLocacoes } from './components/ListaLocacoes';
import { Dashboard as Index } from './components/Dashboard';
import { NotFound } from './components/NotFound';
import { FormularioDespesa } from './components/FormularioDespesa';
import { ListaDespesas } from './components/ListaDespesas';
import { Configuracoes } from './components/Configuracoes';

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sistema de Locações</h1>
          <div className="flex gap-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded transition-colors hover:bg-primary-foreground hover:text-primary ${
                location.pathname === '/' ? 'bg-primary-foreground text-primary' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/apartamentos" 
              className={`px-3 py-2 rounded transition-colors hover:bg-primary-foreground hover:text-primary ${
                location.pathname === '/apartamentos' ? 'bg-primary-foreground text-primary' : ''
              }`}
            >
              Apartamentos
            </Link>
            <Link 
              to="/locacoes/novo" 
              className={`px-3 py-2 rounded transition-colors hover:bg-primary-foreground hover:text-primary ${
                location.pathname === '/locacoes/novo' ? 'bg-primary-foreground text-primary' : ''
              }`}
            >
              Nova Locação
            </Link>
            <Link 
              to="/locacoes" 
              className={`px-3 py-2 rounded transition-colors hover:bg-primary-foreground hover:text-primary ${
                location.pathname === '/locacoes' ? 'bg-primary-foreground text-primary' : ''
              }`}
            >
              Locações
            </Link>
            <Link 
              to="/despesas/novo" 
              className={`px-3 py-2 rounded transition-colors hover:bg-primary-foreground hover:text-primary ${
                location.pathname === '/despesas/novo' ? 'bg-primary-foreground text-primary' : ''
              }`}
            >
              Nova Despesa
            </Link>
            <Link 
              to="/despesas" 
              className={`px-3 py-2 rounded transition-colors hover:bg-primary-foreground hover:text-primary ${
                location.pathname === '/despesas' ? 'bg-primary-foreground text-primary' : ''
              }`}
            >
              Despesas
            </Link>
            <Link 
              to="/configuracoes" 
              className={`px-3 py-2 rounded transition-colors hover:bg-primary-foreground hover:text-primary ${
                location.pathname === '/configuracoes' ? 'bg-primary-foreground text-primary' : ''
              }`}
            >
              Configurações
            </Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/apartamentos" element={<ListaApartamentos />} />
        <Route path="/locacoes/novo" element={<FormularioLocacao />} />
        <Route path="/locacoes" element={<ListaLocacoes />} />
        <Route path="/despesas/novo" element={<FormularioDespesa />} />
        <Route path="/despesas" element={<ListaDespesas />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
