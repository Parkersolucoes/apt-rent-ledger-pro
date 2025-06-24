
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContractEmailRequest {
  email: string;
  assunto: string;
  mensagem: string;
  pdfBase64: string;
  nomeArquivo: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, assunto, mensagem, pdfBase64, nomeArquivo }: ContractEmailRequest = await req.json();

    if (!email || !assunto || !mensagem || !pdfBase64 || !nomeArquivo) {
      return new Response(
        JSON.stringify({ error: "Todos os campos são obrigatórios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Convert base64 to Uint8Array
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

    const emailResponse = await resend.emails.send({
      from: "Contratos <onboarding@resend.dev>",
      to: [email],
      subject: assunto,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Contrato Anexado</h2>
          ${mensagem.split('\n').map(linha => `<p>${linha}</p>`).join('')}
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Este e-mail contém um contrato em PDF anexado. 
            Se você tiver alguma dúvida, entre em contato conosco.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: nomeArquivo,
          content: pdfBuffer,
          type: 'application/pdf'
        }
      ]
    });

    console.log("E-mail enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar e-mail:", error);
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
