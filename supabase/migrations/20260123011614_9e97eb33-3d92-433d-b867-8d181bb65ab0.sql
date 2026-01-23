-- Insert seed data for units
INSERT INTO units (code, description, package_quantity) VALUES 
('UN', 'Unidade', 1),
('CX', 'Caixa', 12),
('KG', 'Quilograma', 1),
('PCT', 'Pacote', 1),
('FD', 'Fardo', 6)
ON CONFLICT DO NOTHING;

-- Insert seed data for payment_methods
INSERT INTO payment_methods (name, type, description, active) VALUES 
('Dinheiro', 'cash', 'Pagamento em dinheiro', true),
('PIX', 'pix', 'Transferência via PIX', true),
('Boleto', 'boleto', 'Boleto bancário', true),
('Cartão Crédito', 'credit', 'Cartão de crédito', true),
('Cartão Débito', 'debit', 'Cartão de débito', true)
ON CONFLICT DO NOTHING;

-- Insert seed data for company_settings
INSERT INTO company_settings (name, address, phone, email, document, footer) VALUES 
('Minha Empresa', 'Endereço da empresa', '(00) 0000-0000', 'contato@empresa.com', '00.000.000/0001-00', 'Rodapé padrão')
ON CONFLICT DO NOTHING;