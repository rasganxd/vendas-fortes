-- Drop the restrictive policy on customers table
DROP POLICY IF EXISTS "Allow public access to customers" ON public.customers;

-- Create a new PERMISSIVE policy for all operations on customers
CREATE POLICY "Allow all access to customers"
ON public.customers
FOR ALL
USING (true)
WITH CHECK (true);