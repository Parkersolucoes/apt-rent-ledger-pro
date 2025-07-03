-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar cron job para processar agendamentos a cada 5 minutos
SELECT cron.schedule(
    'processar-agendamentos-automaticos',
    '*/5 * * * *', -- A cada 5 minutos
    $$
    SELECT
      net.http_post(
          url:='https://qkasdxqekatlmjhadikb.supabase.co/functions/v1/processar-agendamentos',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXNkeHFla2F0bG1qaGFkaWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjU1MTMsImV4cCI6MjA2NTk0MTUxM30.GFk9RjReZ5eIKikMB8pYWKN_1clwlLIwxiILGDq2D_Q"}'::jsonb,
          body:='{"triggered_by": "cron", "timestamp": "' || now() || '"}'::jsonb
      ) as request_id;
    $$
);