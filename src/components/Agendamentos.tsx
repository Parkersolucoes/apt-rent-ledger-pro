import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormularioAgendamento } from './FormularioAgendamento';
import { ListaAgendamentos } from './ListaAgendamentos';
import { LogsAgendamentos } from './LogsAgendamentos';

export const Agendamentos = () => {
  const [activeTab, setActiveTab] = useState('lista');

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lista">Lista de Agendamentos</TabsTrigger>
            <TabsTrigger value="novo">Novo Agendamento</TabsTrigger>
            <TabsTrigger value="logs">Logs de Envios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista">
            <ListaAgendamentos onEdit={() => setActiveTab('novo')} />
          </TabsContent>
          
          <TabsContent value="novo">
            <FormularioAgendamento onSuccess={() => setActiveTab('lista')} />
          </TabsContent>
          
          <TabsContent value="logs">
            <LogsAgendamentos />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};