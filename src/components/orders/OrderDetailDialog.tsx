
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Order, Customer } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { useAppContext } from '@/hooks/useAppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Archive, Printer, X } from 'lucide-react';

interface OrderDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: Order | null;
  selectedCustomer: Customer | null;
  formatCurrency: (value: number | undefined) => string;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedOrder,
  selectedCustomer,
  formatCurrency,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { settings } = useAppContext();
  const companyData = settings?.company;
  
  // Debug company data
  console.log('🖨️ OrderDetailDialog - Company data for printing:', {
    settingsExists: !!settings,
    companyExists: !!companyData,
    companyName: companyData?.name,
    fullCompanyData: companyData
  });
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Pedido-${selectedOrder?.customerName}`,
    removeAfterPrint: true,
  });

  if (!selectedOrder) return null;

  // Show loading state if settings are still loading
  if (!settings || settings.id === 'loading') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p>Carregando configurações da empresa...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center">
              <span>Detalhes do Pedido</span>
              {selectedOrder?.archived && (
                <Badge variant="outline" className="ml-2">
                  <Archive size={12} className="mr-1" /> Arquivado
                </Badge>
              )}
            </DialogTitle>
            <Button 
              variant="outline" 
              onClick={() => handlePrint()} 
              className="flex items-center gap-2 mr-8"
            >
              <Printer size={16} /> Imprimir
            </Button>
          </div>
        </DialogHeader>
        
        <div ref={printRef} className="p-4">
          <style>
            {`
              @media print {
                @page {
                  margin: 0.8cm;
                  size: A4 portrait;
                }
                
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  margin: 0;
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                  font-size: 10pt;
                  line-height: 1.4;
                  color: #333;
                }
                
                /* Enhanced company header */
                .individual-print-container .company-header {
                  text-align: center;
                  margin-bottom: 0.6cm;
                  padding: 0.5cm;
                  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
                  color: white;
                  border-radius: 8px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                }
                
                .individual-print-container .company-header h2 {
                  font-weight: 700;
                  font-size: 16pt;
                  margin: 0 0 0.3cm 0;
                  letter-spacing: 0.8px;
                  text-transform: uppercase;
                }
                
                .individual-print-container .company-header p {
                  font-size: 9pt;
                  margin: 2px 0;
                  opacity: 0.95;
                  font-weight: 300;
                }
                
                /* Order date and info */
                .individual-print-container .order-date {
                  text-align: center;
                  margin-bottom: 0.5cm;
                  padding: 0.3cm;
                  background: #f8f9fa;
                  border-radius: 6px;
                  border: 1px solid #e9ecef;
                }
                
                .individual-print-container .order-date p {
                  font-size: 11pt;
                  margin: 0;
                  font-weight: 600;
                  color: #495057;
                }
                
                /* Information containers */
                .individual-print-container .info-container {
                  display: flex;
                  margin-bottom: 0.6cm;
                  gap: 0.4cm;
                }
                
                .individual-print-container .info-box {
                  border: 1px solid #dee2e6;
                  border-radius: 8px;
                  padding: 0.4cm;
                  flex: 1;
                  background: white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
                }
                
                .individual-print-container .info-box h3 {
                  font-weight: 700;
                  margin-top: 0;
                  margin-bottom: 0.3cm;
                  font-size: 11pt;
                  color: #495057;
                  border-bottom: 2px solid #e9ecef;
                  padding-bottom: 0.2cm;
                  text-transform: uppercase;
                  letter-spacing: 0.4px;
                }
                
                .individual-print-container .info-box p {
                  font-size: 9pt;
                  margin: 3px 0;
                  line-height: 1.5;
                  color: #6c757d;
                }
                
                .individual-print-container .info-box p span {
                  color: #495057;
                  font-weight: 600;
                }
                
                /* Order items section */
                .individual-print-container .order-items {
                  margin-bottom: 0.6cm;
                }
                
                .individual-print-container .order-items h3 {
                  font-size: 12pt;
                  margin-bottom: 0.4cm;
                  color: #495057;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.4px;
                  border-bottom: 3px solid #4a90e2;
                  padding-bottom: 0.2cm;
                }
                
                /* Enhanced table styles */
                .individual-print-container .order-table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 9pt;
                  background: white;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                }
                
                .individual-print-container .order-table th {
                  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
                  color: white;
                  padding: 0.3cm;
                  text-align: left;
                  font-size: 10pt;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.4px;
                }
                
                .individual-print-container .order-table td {
                  padding: 0.25cm;
                  border-bottom: 1px solid #f1f3f4;
                  font-size: 9pt;
                  line-height: 1.4;
                }
                
                .individual-print-container .order-table tbody tr:nth-child(even) {
                  background-color: #f8f9fa;
                }
                
                .individual-print-container .order-table tbody tr:hover {
                  background-color: #e3f2fd;
                }
                
                .individual-print-container .order-table .text-right {
                  text-align: right;
                  font-weight: 600;
                  color: #495057;
                }
                
                .individual-print-container .order-table .text-center {
                  text-align: center;
                  font-weight: 600;
                }
                
                /* Enhanced totals section */
                .individual-print-container .order-totals {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 0.5cm;
                  padding: 0.4cm;
                  background: #f8f9fa;
                  border-radius: 8px;
                  border: 1px solid #e9ecef;
                  font-size: 10pt;
                }
                
                .individual-print-container .payment-info {
                  text-align: left;
                  flex: 1;
                }
                
                .individual-print-container .payment-info p {
                  margin: 3px 0;
                  color: #6c757d;
                  font-weight: 500;
                }
                
                .individual-print-container .total-info {
                  text-align: right;
                  flex: 1;
                }
                
                .individual-print-container .total-info p {
                  margin: 3px 0;
                  color: #495057;
                }
                
                .individual-print-container .total-value {
                  font-weight: 700;
                  font-size: 14pt;
                  color: #28a745;
                  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                
                /* Enhanced notes section */
                .individual-print-container .order-notes {
                  margin-top: 0.5cm;
                  padding: 0.4cm;
                  background: #fff3cd;
                  border: 1px solid #ffeaa7;
                  border-radius: 8px;
                  border-left: 5px solid #f39c12;
                }
                
                .individual-print-container .order-notes h3 {
                  font-weight: 700;
                  margin-bottom: 0.3cm;
                  font-size: 11pt;
                  color: #856404;
                  text-transform: uppercase;
                  letter-spacing: 0.4px;
                }
                
                .individual-print-container .order-notes p {
                  font-size: 9pt;
                  line-height: 1.5;
                  color: #856404;
                  font-style: italic;
                }
                
                /* Enhanced footer */
                .individual-print-container .footer {
                  margin-top: 0.5cm;
                  text-align: center;
                  font-size: 8pt;
                  color: #6c757d;
                  padding: 0.3cm;
                  background: #f8f9fa;
                  border-radius: 6px;
                  border-top: 3px solid #4a90e2;
                }
                
                .individual-print-container .footer p {
                  margin: 2px 0;
                  font-weight: 500;
                }
                
                /* Hide non-printable elements */
                .no-print {
                  display: none !important;
                }
              }
            `}
          </style>
          
          <div className="individual-print-container">
            {companyData?.name && companyData.name !== 'Carregando...' && (
              <div className="company-header">
                <h2>{companyData.name}</h2>
                {companyData.document && (
                  <p>CNPJ: {companyData.document}</p>
                )}
                {companyData.address && (
                  <p>{companyData.address}</p>
                )}
                {companyData.phone && (
                  <p>Tel: {companyData.phone}</p>
                )}
              </div>
            )}
            
            <div className="order-date">
              <p>
                Pedido #{selectedOrder.code || 'N/A'} - {selectedOrder ? formatDateToBR(selectedOrder.createdAt) : ''}
              </p>
            </div>
            
            <div className="info-container">
              <div className="info-box">
                <h3>Dados do Cliente</h3>
                <p><span>Nome:</span> {selectedCustomer?.name}</p>
                <p><span>Telefone:</span> {selectedCustomer?.phone}</p>
                {selectedCustomer?.document && (
                  <p><span>CPF/CNPJ:</span> {selectedCustomer.document}</p>
                )}
              </div>
              
              {selectedCustomer?.address && (
                <div className="info-box">
                  <h3>Endereço de Entrega</h3>
                  <p>{selectedCustomer.address}</p>
                  <p>{selectedCustomer.city} - {selectedCustomer.state}, {selectedCustomer.zipCode}</p>
                </div>
              )}
            </div>
            
            <div className="order-items">
              <h3>Itens do Pedido</h3>
              <table className="order-table">
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Produto</th>
                    <th className="text-center" style={{ width: '15%' }}>Qtd</th>
                    <th className="text-right" style={{ width: '17.5%' }}>Preço Unit.</th>
                    <th className="text-right" style={{ width: '17.5%' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder?.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td style={{ fontWeight: '500', color: '#495057' }}>{item.productName}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="text-right" style={{ fontWeight: '700', color: '#28a745' }}>
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic', padding: '0.5cm' }}>
                        Nenhum item encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="order-totals">
              <div className="payment-info">
                {selectedOrder.paymentStatus !== 'pending' && (
                  <p><strong>Status:</strong> {selectedOrder?.paymentStatus}</p>
                )}
                {selectedOrder.paymentMethod && (
                  <p><strong>Forma de Pagamento:</strong> {selectedOrder.paymentMethod}</p>
                )}
              </div>
              <div className="total-info">
                <p className="total-value">Total: {formatCurrency(selectedOrder?.total)}</p>
              </div>
            </div>
            
            {selectedOrder?.notes && (
              <div className="order-notes">
                <h3>Observações Importantes</h3>
                <p>{selectedOrder.notes}</p>
              </div>
            )}
            
            <div className="footer">
              {companyData?.footer ? (
                <p>{companyData.footer}</p>
              ) : (
                <>
                  <p>{companyData?.name && companyData.name !== 'Carregando...' ? companyData.name : 'ForcaVendas'} - Sistema de Gestão de Vendas</p>
                  <p>Suporte: {companyData?.phone || '(11) 9999-8888'}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
