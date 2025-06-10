
-- Adicionar campos para suportar pedidos negativados
ALTER TABLE public.orders 
ADD COLUMN rejection_reason text,
ADD COLUMN visit_notes text;

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.orders.rejection_reason IS 'Motivo da recusa do pedido (sem_interesse, fechado, etc.)';
COMMENT ON COLUMN public.orders.visit_notes IS 'Observações da visita realizada pelo vendedor';
