
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormularioDespesa } from "@/components/FormularioDespesa";
import { ListaDespesas } from "@/components/ListaDespesas";

const Despesas = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lista">Lista de Despesas</TabsTrigger>
            <TabsTrigger value="nova">Nova Despesa</TabsTrigger>
          </TabsList>
          <TabsContent value="lista">
            <ListaDespesas />
          </TabsContent>
          <TabsContent value="nova">
            <FormularioDespesa />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Despesas;
