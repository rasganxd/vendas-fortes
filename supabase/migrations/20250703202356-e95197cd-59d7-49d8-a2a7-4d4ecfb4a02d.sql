
-- Add visit_sequences field to customers table
ALTER TABLE public.customers 
ADD COLUMN visit_sequences JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.customers.visit_sequences IS 'JSON object with day-specific visit sequences. Format: {"monday": 1, "tuesday": 3, "wednesday": 2}';
