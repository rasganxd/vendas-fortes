
-- Criar tabela para armazenar relatórios de importação
CREATE TABLE public.import_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('import', 'reject')),
  operator TEXT NOT NULL DEFAULT 'admin',
  summary_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  orders_count INTEGER NOT NULL DEFAULT 0,
  total_value NUMERIC NOT NULL DEFAULT 0,
  sales_reps_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_import_reports_timestamp ON public.import_reports(timestamp DESC);
CREATE INDEX idx_import_reports_operation_type ON public.import_reports(operation_type);
CREATE INDEX idx_import_reports_operator ON public.import_reports(operator);

-- Habilitar RLS (mesmo sendo dados administrativos, é boa prática)
ALTER TABLE public.import_reports ENABLE ROW LEVEL SECURITY;

-- Criar política básica para permitir acesso total (pode ser refinada depois)
CREATE POLICY "Allow all operations on import_reports" 
  ON public.import_reports 
  FOR ALL 
  USING (true);
