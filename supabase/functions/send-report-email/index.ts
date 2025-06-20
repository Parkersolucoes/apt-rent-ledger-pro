
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReportEmailRequest {
  email: string;
  apartamento: string;
  dataInicio: string;
  dataFim: string;
  totalReceitas: number;
  totalDespesas: number;
  lucroLiquido: number;
  locacoes: any[];
  despesas: any[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      apartamento, 
      dataInicio, 
      dataFim, 
      totalReceitas, 
      totalDespesas, 
      lucroLiquido, 
      locacoes, 
      despesas 
    }: ReportEmailRequest = await req.json();

    console.log("Enviando relatório por email para:", email);

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('pt-BR');
    };

    const locacoesTable = locacoes.length > 0 ? `
      <h3 style="color: #16a34a; margin-top: 30px;">Receitas do Período</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Data</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Hóspede</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${locacoes.map(loc => `
            <tr>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">${formatDate(loc.data_entrada)}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">${loc.hospede}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: right;">${formatCurrency(loc.valor_locacao)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '';

    const despesasTable = despesas.length > 0 ? `
      <h3 style="color: #dc2626; margin-top: 30px;">Despesas do Período</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Data</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Descrição</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${despesas.map(desp => `
            <tr>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">${formatDate(desp.data)}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">${desp.descricao}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: right;">${formatCurrency(desp.valor)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '';

    const emailResponse = await resend.emails.send({
      from: "Happy Caldas <onboarding@resend.dev>",
      to: [email],
      subject: `Relatório Financeiro - Apartamento ${apartamento}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">Happy Caldas</h1>
            <p style="color: #64748b; margin: 5px 0;">Sistema de Locações</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #334155; margin: 0 0 10px 0;">Relatório Financeiro</h2>
            <p style="margin: 0; color: #64748b;">
              <strong>Apartamento:</strong> ${apartamento}<br>
              <strong>Período:</strong> ${formatDate(dataInicio)} a ${formatDate(dataFim)}<br>
              <strong>Gerado em:</strong> ${formatDate(new Date().toISOString())}
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #0ea5e9;">
              <div style="font-size: 24px; font-weight: bold; color: #16a34a; margin-bottom: 5px;">
                ${formatCurrency(totalReceitas)}
              </div>
              <div style="color: #64748b; font-size: 14px;">Total Receitas</div>
            </div>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #ef4444;">
              <div style="font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 5px;">
                ${formatCurrency(totalDespesas)}
              </div>
              <div style="color: #64748b; font-size: 14px;">Total Despesas</div>
            </div>
            
            <div style="background-color: ${lucroLiquido >= 0 ? '#f0f9ff' : '#fff7ed'}; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${lucroLiquido >= 0 ? '#0ea5e9' : '#f97316'};">
              <div style="font-size: 24px; font-weight: bold; color: ${lucroLiquido >= 0 ? '#0ea5e9' : '#f97316'}; margin-bottom: 5px;">
                ${formatCurrency(lucroLiquido)}
              </div>
              <div style="color: #64748b; font-size: 14px;">Lucro Líquido</div>
            </div>
          </div>

          ${locacoesTable}
          ${despesasTable}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
            <p>Este relatório foi gerado automaticamente pelo sistema Happy Caldas.</p>
          </div>
        </div>
      `,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
