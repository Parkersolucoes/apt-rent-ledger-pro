
import { useLocacoes } from './useLocacoes';
import { useDisponibilidade } from './useDisponibilidade';
import { isWithinInterval, isSameDay } from 'date-fns';

export const useValidacaoDisponibilidade = () => {
  const { locacoes } = useLocacoes();
  const { disponibilidades } = useDisponibilidade();

  const validarDisponibilidade = (
    apartamento: string,
    dataEntrada: Date,
    dataSaida: Date,
    locacaoId?: string // Para edição, excluir a própria locação da validação
  ) => {
    // Verificar conflitos com locações existentes
    const conflitosLocacoes = locacoes.filter(locacao => {
      // Excluir a própria locação se estivermos editando
      if (locacaoId && locacao.id === locacaoId) {
        return false;
      }

      // Verificar apenas o mesmo apartamento
      if (locacao.apartamento !== apartamento) {
        return false;
      }

      const locacaoEntrada = new Date(locacao.dataEntrada);
      const locacaoSaida = new Date(locacao.dataSaida);

      // Permitir entrada e saída no mesmo dia
      if (isSameDay(dataSaida, locacaoEntrada) || isSameDay(dataEntrada, locacaoSaida)) {
        return false;
      }

      // Verificar sobreposição de períodos
      return (
        isWithinInterval(dataEntrada, { start: locacaoEntrada, end: locacaoSaida }) ||
        isWithinInterval(dataSaida, { start: locacaoEntrada, end: locacaoSaida }) ||
        isWithinInterval(locacaoEntrada, { start: dataEntrada, end: dataSaida }) ||
        isWithinInterval(locacaoSaida, { start: dataEntrada, end: dataSaida })
      );
    });

    // Verificar conflitos com disponibilidades/reservas
    const conflitosDisponibilidades = disponibilidades.filter(disp => {
      // Verificar apenas o mesmo apartamento
      if (disp.apartamento_numero !== apartamento) {
        return false;
      }

      // Verificar apenas disponibilidades ocupadas
      if (disp.status !== 'ocupado') {
        return false;
      }

      const dispEntrada = new Date(disp.data_inicio);
      const dispSaida = new Date(disp.data_fim);

      // Permitir entrada e saída no mesmo dia
      if (isSameDay(dataSaida, dispEntrada) || isSameDay(dataEntrada, dispSaida)) {
        return false;
      }

      // Verificar sobreposição de períodos
      return (
        isWithinInterval(dataEntrada, { start: dispEntrada, end: dispSaida }) ||
        isWithinInterval(dataSaida, { start: dispEntrada, end: dispSaida }) ||
        isWithinInterval(dispEntrada, { start: dataEntrada, end: dataSaida }) ||
        isWithinInterval(dispSaida, { start: dataEntrada, end: dataSaida })
      );
    });

    const todosConflitos = [...conflitosLocacoes, ...conflitosDisponibilidades];

    return {
      isValido: todosConflitos.length === 0,
      conflitos: todosConflitos,
      mensagemErro: todosConflitos.length > 0 
        ? `Período conflita com ${todosConflitos.length} reserva(s) existente(s) no apartamento ${apartamento}.`
        : null
    };
  };

  return {
    validarDisponibilidade
  };
};
