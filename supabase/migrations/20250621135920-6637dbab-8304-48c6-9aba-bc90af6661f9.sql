
-- Criar tabela para armazenar metadados dos backups no Supabase
CREATE TABLE public.system_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('daily', 'monthly', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_size BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'failed')),
  data_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT DEFAULT 'system',
  notes TEXT
);

-- Criar tabela para logs de operações de manutenção
CREATE TABLE public.maintenance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('start_new_day', 'start_new_month', 'daily_backup', 'monthly_backup', 'cache_clear')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  details JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  duration_seconds INTEGER,
  created_by TEXT DEFAULT 'system'
);

-- Criar tabela para configurações de manutenção
CREATE TABLE public.maintenance_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT DEFAULT 'system'
);

-- Inserir configurações padrão
INSERT INTO public.maintenance_settings (setting_key, setting_value, description) VALUES
('daily_backup_time', '{"hour": 23, "minute": 0}', 'Horário para backup diário automático'),
('monthly_backup_time', '{"day": 1, "hour": 2, "minute": 0}', 'Horário para backup mensal automático'),
('backup_retention', '{"daily": 7, "monthly": 12}', 'Quantos backups manter de cada tipo'),
('auto_maintenance', '{"daily_update": true, "monthly_close": true}', 'Configurações de manutenção automática'),
('notification_settings', '{"show_toasts": true, "log_operations": true}', 'Configurações de notificações');

-- Criar índices para melhor performance
CREATE INDEX idx_system_backups_type_date ON public.system_backups(backup_type, created_at DESC);
CREATE INDEX idx_maintenance_logs_operation_date ON public.maintenance_logs(operation_type, started_at DESC);
CREATE INDEX idx_maintenance_settings_key ON public.maintenance_settings(setting_key);

-- Habilitar RLS nas tabelas
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas (acesso total para simplificar - pode ser refinado depois)
CREATE POLICY "Allow all operations on system_backups" ON public.system_backups FOR ALL USING (true);
CREATE POLICY "Allow all operations on maintenance_logs" ON public.maintenance_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on maintenance_settings" ON public.maintenance_settings FOR ALL USING (true);
