
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormularioLocacao } from "@/components/FormularioLocacao";
import { ListaLocacoes } from "@/components/ListaLocacoes";

const Locacoes = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lista">Lista de Locações</TabsTrigger>
            <TabsTrigger value="nova">Nova Locação</TabsTrigger>
          </TabsList>
          <TabsContent value="lista">
            <ListaLocacoes />
          </TabsContent>
          <TabsContent value="nova">
            <FormularioLocacao />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Locacoes;
