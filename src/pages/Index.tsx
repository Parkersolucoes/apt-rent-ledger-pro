
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/Dashboard';
import { FormularioLocacao } from '@/components/FormularioLocacao';
import { ListaLocacoes } from '@/components/ListaLocacoes';
import { House, Calendar, User, Receipt } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Locações
          </h1>
          <p className="text-lg text-gray-600">
            Controle financeiro completo para locações de apartamentos
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <House className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="nova-locacao" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Nova Locação
            </TabsTrigger>
            <TabsTrigger value="locacoes" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Locações
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="nova-locacao">
            <FormularioLocacao />
          </TabsContent>

          <TabsContent value="locacoes">
            <ListaLocacoes />
          </TabsContent>

          <TabsContent value="relatorios">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">Relatórios</h3>
              <p className="text-gray-600">
                Funcionalidade de relatórios em desenvolvimento.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
