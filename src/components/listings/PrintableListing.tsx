
import React from 'react';
import { formatCurrency } from '@/lib/format-utils';
import { formatDateToBR } from '@/lib/date-utils';
import { ListingType } from './ListingFilters';

interface PrintableListingProps {
  type: ListingType;
  data: any[];
  filters: Record<string, any>;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
  companyData?: any;
}

export default function PrintableListing({
  type,
  data,
  filters,
  orderBy,
  orderDirection,
  companyData
}: PrintableListingProps) {
  const getTypeLabel = () => {
    switch (type) {
      case 'customers': return 'Clientes';
      case 'products': return 'Produtos';
      case 'orders': return 'Pedidos';
      case 'sales_reps': return 'Vendedores';
      default: return 'Listagem';
    }
  };

  const getFiltersDescription = () => {
    const descriptions: string[] = [];
    
    if (filters.salesRepId) descriptions.push(`Vendedor: ${filters.salesRepName || 'Selecionado'}`);
    if (filters.visitDay) descriptions.push(`Dia da semana: ${filters.visitDay}`);
    if (filters.city) descriptions.push(`Cidade: ${filters.city}`);
    if (filters.categoryId) descriptions.push(`Categoria: ${filters.categoryName || 'Selecionada'}`);
    if (filters.groupId) descriptions.push(`Grupo: ${filters.groupName || 'Selecionado'}`);
    if (filters.brandId) descriptions.push(`Marca: ${filters.brandName || 'Selecionada'}`);
    if (filters.status) descriptions.push(`Status: ${filters.status}`);
    if (filters.startDate) descriptions.push(`Data inicial: ${formatDateToBR(filters.startDate)}`);
    if (filters.endDate) descriptions.push(`Data final: ${formatDateToBR(filters.endDate)}`);
    if (filters.activeOnly) descriptions.push('Apenas ativos');
    if (filters.withStock) descriptions.push('Apenas com estoque');
    
    return descriptions.length > 0 ? descriptions.join(' • ') : 'Todos os registros';
  };

  const getOrderDescription = () => {
    const orderLabels: Record<string, string> = {
      name: 'Nome',
      code: 'Código',
      city: 'Cidade',
      visitSequence: 'Sequência de Visita',
      sale_price: 'Preço',
      stock: 'Estoque',
      date: 'Data',
      customerName: 'Cliente',
      total: 'Valor Total',
      status: 'Status',
      createdAt: 'Data de Cadastro'
    };
    
    const fieldLabel = orderLabels[orderBy] || orderBy;
    const directionLabel = orderDirection === 'asc' ? 'Crescente' : 'Decrescente';
    
    return `${fieldLabel} (${directionLabel})`;
  };

  return (
    <div className="print-container bg-white p-8 max-w-full">
      {/* Cabeçalho */}
      <div className="mb-8 text-center border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {companyData?.name || 'Sistema de Gestão'}
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Relatório de {getTypeLabel()}
        </h2>
        <div className="text-sm text-gray-600">
          <p>Gerado em: {formatDateToBR(new Date())} às {new Date().toLocaleTimeString('pt-BR')}</p>
          <p>Filtros aplicados: {getFiltersDescription()}</p>
          <p>Ordenação: {getOrderDescription()}</p>
          <p>Total de registros: {data.length}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden">
        {type === 'customers' && (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Código</th>
                <th className="border border-gray-300 p-2 text-left">Nome</th>
                <th className="border border-gray-300 p-2 text-left">Cidade</th>
                <th className="border border-gray-300 p-2 text-left">Vendedor</th>
                <th className="border border-gray-300 p-2 text-center">Seq. Visita</th>
                <th className="border border-gray-300 p-2 text-left">Dias de Visita</th>
              </tr>
            </thead>
            <tbody>
              {data.map((customer, index) => (
                <tr key={customer.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="border border-gray-300 p-2 font-mono">{customer.code}</td>
                  <td className="border border-gray-300 p-2 font-medium">{customer.name}</td>
                  <td className="border border-gray-300 p-2">{customer.city}</td>
                  <td className="border border-gray-300 p-2">{customer.salesRepName || '-'}</td>
                  <td className="border border-gray-300 p-2 text-center">{customer.visitSequence || '-'}</td>
                  <td className="border border-gray-300 p-2">
                    {customer.visitDays?.length > 0 ? customer.visitDays.join(', ') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'products' && (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Código</th>
                <th className="border border-gray-300 p-2 text-left">Nome</th>
                <th className="border border-gray-300 p-2 text-left">Categoria</th>
                <th className="border border-gray-300 p-2 text-left">Grupo</th>
                <th className="border border-gray-300 p-2 text-right">Preço</th>
                <th className="border border-gray-300 p-2 text-center">Estoque</th>
              </tr>
            </thead>
            <tbody>
              {data.map((product, index) => (
                <tr key={product.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="border border-gray-300 p-2 font-mono">{product.code}</td>
                  <td className="border border-gray-300 p-2 font-medium">{product.name}</td>
                  <td className="border border-gray-300 p-2">{product.categoryName || '-'}</td>
                  <td className="border border-gray-300 p-2">{product.groupName || '-'}</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(product.sale_price || 0)}</td>
                  <td className="border border-gray-300 p-2 text-center">{product.stock || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'orders' && (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Código</th>
                <th className="border border-gray-300 p-2 text-left">Data</th>
                <th className="border border-gray-300 p-2 text-left">Cliente</th>
                <th className="border border-gray-300 p-2 text-left">Vendedor</th>
                <th className="border border-gray-300 p-2 text-right">Total</th>
                <th className="border border-gray-300 p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((order, index) => (
                <tr key={order.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="border border-gray-300 p-2 font-mono">{order.code}</td>
                  <td className="border border-gray-300 p-2">{formatDateToBR(order.date)}</td>
                  <td className="border border-gray-300 p-2 font-medium">{order.customerName}</td>
                  <td className="border border-gray-300 p-2">{order.salesRepName || '-'}</td>
                  <td className="border border-gray-300 p-2 text-right">{formatCurrency(order.total)}</td>
                  <td className="border border-gray-300 p-2 text-center">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {type === 'sales_reps' && (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Código</th>
                <th className="border border-gray-300 p-2 text-left">Nome</th>
                <th className="border border-gray-300 p-2 text-left">Email</th>
                <th className="border border-gray-300 p-2 text-left">Telefone</th>
                <th className="border border-gray-300 p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((salesRep, index) => (
                <tr key={salesRep.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="border border-gray-300 p-2 font-mono">{salesRep.code}</td>
                  <td className="border border-gray-300 p-2 font-medium">{salesRep.name}</td>
                  <td className="border border-gray-300 p-2">{salesRep.email || '-'}</td>
                  <td className="border border-gray-300 p-2">{salesRep.phone || '-'}</td>
                  <td className="border border-gray-300 p-2 text-center">{salesRep.active ? 'Ativo' : 'Inativo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rodapé */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
        <p>{companyData?.footer || 'Sistema de Gestão Comercial'}</p>
      </div>
    </div>
  );
}
