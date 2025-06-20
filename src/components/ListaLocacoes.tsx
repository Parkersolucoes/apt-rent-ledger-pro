
import { useState } from 'react';
import { useLocacoes } from '@/hooks/useLocacoes';
import { FiltrosLocacao } from '@/types/locacao';
import { ConfirmacaoExclusaoLocacao } from './ConfirmacaoExclusaoLocacao';
import { EdicaoLocacao } from './EdicaoLocacao';
import { toast } from '@/hooks/use-toast';
import { Locacao } from '@/types/locacao';
import { FiltrosLocacao as FiltrosComponent } from './ListaLocacoes/FiltrosLocacao';
import { FiltrosRapidos } from './ListaLocacoes/FiltrosRapidos';
import { ResumoApartamentos } from './ListaLocacoes/ResumoApartamentos';
import { ListagemLocacoes } from './ListaLocacoes/ListagemLocacoes';

export const ListaLocacoes = () => {
  const { locacoes, obterApartamentos, obterAnos, filtrarLocacoes, removerLocacao } = useLocacoes();
  const [filtros, setFiltros] = useState<FiltrosLocacao>({});
  const [locacaoParaExcluir, setLocacaoParaExcluir] = useState<Locacao | null>(null);
  const [locacaoParaEditar, setLocacaoParaEditar] = useState<Locacao | null>(null);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);

  const locacoesFiltradas = filtrarLocacoes(filtros);
  const apartamentos = obterApartamentos();
  const anos = obterAnos();

  const limparFiltros = () => {
    setFiltros({});
  };

  const aplicarFiltroRapido = (tipo: 'apartamento' | 'ano' | 'mes', valor: string | number) => {
    if (tipo === 'apartamento') {
      setFiltros({...filtros, apartamento: valor as string});
    } else if (tipo === 'ano') {
      setFiltros({...filtros, ano: valor as number});
    } else if (tipo === 'mes') {
      setFiltros({...filtros, mes: valor as number});
    }
  };

  const handleExcluir = (locacao: Locacao) => {
    setLocacaoParaExcluir(locacao);
    setModalExclusaoAberto(true);
  };

  const handleEditar = (locacao: Locacao) => {
    setLocacaoParaEditar(locacao);
    setModalEdicaoAberto(true);
  };

  const confirmarExclusao = async () => {
    if (locacaoParaExcluir) {
      await removerLocacao(locacaoParaExcluir.id);
      toast({
        title: "Sucesso!",
        description: "Locação excluída com sucesso.",
      });
      setModalExclusaoAberto(false);
      setLocacaoParaExcluir(null);
    }
  };

  // Calcular totais por apartamento
  const totaisPorApartamento = apartamentos.reduce((acc, apartamento) => {
    const locacoesApartamento = locacoesFiltradas.filter(loc => loc.apartamento === apartamento);
    const valorTotal = locacoesApartamento.reduce((sum, loc) => sum + loc.valorLocacao, 0);
    const totalLimpeza = locacoesApartamento.reduce((sum, loc) => sum + loc.taxaLimpeza, 0);
    const comissaoTotal = locacoesApartamento.reduce((sum, loc) => sum + loc.comissao, 0);
    const valorProprietario = valorTotal - totalLimpeza - comissaoTotal;
    
    acc[apartamento] = {
      valorTotal,
      totalLimpeza,
      comissaoTotal,
      valorProprietario,
      quantidade: locacoesApartamento.length
    };
    return acc;
  }, {} as Record<string, { valorTotal: number; totalLimpeza: number; comissaoTotal: number; valorProprietario: number; quantidade: number }>);

  return (
    <div className="min-h-screen gradient-bg-page p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <FiltrosComponent
          filtros={filtros}
          setFiltros={setFiltros}
          apartamentos={apartamentos}
          anos={anos}
          onLimparFiltros={limparFiltros}
        />

        <FiltrosRapidos
          filtros={filtros}
          apartamentos={apartamentos}
          anos={anos}
          onAplicarFiltroRapido={aplicarFiltroRapido}
        />

        <ResumoApartamentos
          apartamentos={apartamentos}
          totaisPorApartamento={totaisPorApartamento}
        />

        <ListagemLocacoes
          locacoesFiltradas={locacoesFiltradas}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
        />

        <ConfirmacaoExclusaoLocacao
          locacao={locacaoParaExcluir}
          open={modalExclusaoAberto}
          onOpenChange={setModalExclusaoAberto}
          onConfirm={confirmarExclusao}
        />

        <EdicaoLocacao
          locacao={locacaoParaEditar}
          open={modalEdicaoAberto}
          onOpenChange={setModalEdicaoAberto}
        />
      </div>
    </div>
  );
};
