import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { ListingType } from '@/components/listings/ListingFilters';
import PrintableListing from '@/components/listings/PrintableListing';
import { renderToString } from 'react-dom/server';
import { getDayLabel } from '@/components/customers/constants';

export function useListings() {
  const [selectedType, setSelectedType] = useState<ListingType>('customers');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [orderBy, setOrderBy] = useState('name');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  
  const { 
    customers, 
    products, 
    orders, 
    salesReps, 
    productCategories, 
    productGroups, 
    productBrands,
    settings
  } = useAppContext();

  // Reset filters when type changes
  useEffect(() => {
    setFilters({});
    
    // Set default order field based on type
    switch (selectedType) {
      case 'customers':
        setOrderBy('name');
        break;
      case 'products':
        setOrderBy('name');
        break;
      case 'orders':
        setOrderBy('date');
        setOrderDirection('desc');
        break;
      case 'sales_reps':
        setOrderBy('name');
        break;
    }
  }, [selectedType]);

  // Filter and sort data
  const results = useMemo(() => {
    let data: any[] = [];

    // Get base data
    switch (selectedType) {
      case 'customers':
        data = [...customers];
        break;
      case 'products':
        data = [...products];
        break;
      case 'orders':
        data = [...orders];
        break;
      case 'sales_reps':
        data = [...salesReps];
        break;
    }

    // Apply filters
    data = data.filter(item => {
      // Common filters
      if (filters.activeOnly && !item.active) return false;

      // Customer specific filters
      if (selectedType === 'customers') {
        if (filters.salesRepId && item.salesRepId !== filters.salesRepId) return false;
        if (filters.city && !item.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
        if (filters.visitDay && !item.visitDays?.includes(filters.visitDay)) return false;
      }

      // Product specific filters
      if (selectedType === 'products') {
        if (filters.categoryId && item.categoryId !== filters.categoryId) return false;
        if (filters.groupId && item.groupId !== filters.groupId) return false;
        if (filters.brandId && item.brandId !== filters.brandId) return false;
        if (filters.withStock && (!item.stock || item.stock <= 0)) return false;
      }

      // Order specific filters
      if (selectedType === 'orders') {
        if (filters.status && item.status !== filters.status) return false;
        if (filters.salesRepId && item.salesRepId !== filters.salesRepId) return false;
        if (filters.startDate && new Date(item.date) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(item.date) > new Date(filters.endDate)) return false;
      }

      return true;
    });

    // Enrich data with related information
    if (selectedType === 'customers') {
      data = data.map(customer => ({
        ...customer,
        salesRepName: salesReps.find(rep => rep.id === customer.salesRepId)?.name,
        visitDaysInPortuguese: customer.visitDays?.map((day: string) => getDayLabel(day)) || []
      }));
    }

    if (selectedType === 'products') {
      data = data.map(product => ({
        ...product,
        categoryName: productCategories.find(cat => cat.id === product.categoryId)?.name,
        groupName: productGroups.find(group => group.id === product.groupId)?.name,
        brandName: productBrands.find(brand => brand.id === product.brandId)?.name
      }));
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return orderDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return orderDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [
    selectedType, 
    filters, 
    orderBy, 
    orderDirection, 
    customers, 
    products, 
    orders, 
    salesReps,
    productCategories,
    productGroups,
    productBrands
  ]);

  const handlePrint = () => {
    console.log('🖨️ Iniciando impressão da listagem...');
    
    // Check if company data is loaded
    const companyData = settings?.company;
    const isCompanyDataLoaded = companyData && 
      companyData.name && 
      companyData.name !== 'Carregando...' && 
      companyData.name.trim() !== '';
    
    if (!isCompanyDataLoaded) {
      console.warn("⏳ Aguardando carregamento dos dados da empresa...");
      return;
    }

    // Check if running in Electron
    if (window.electronAPI && window.electronAPI.printContent) {
      handleElectronPrint();
    } else {
      handleWebPrint();
    }
  };

  const handleElectronPrint = async () => {
    try {
      console.log("🖨️ Usando impressão nativa do Electron...");
      
      const htmlContent = generatePrintHTML();
      
      const result = await window.electronAPI.printContent(htmlContent, {
        printBackground: true,
        color: true,
        margins: {
          marginType: 'custom',
          top: 0.5,
          bottom: 0.5,
          left: 0.5,
          right: 0.5
        }
      });
      
      if (!result.success) {
        console.error('❌ Erro na impressão Electron:', result.error);
        handleWebPrint();
      } else {
        console.log('✅ Impressão Electron concluída com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao imprimir com Electron:', error);
      handleWebPrint();
    }
  };

  const handleWebPrint = () => {
    console.log("🖨️ Usando impressão web...");
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      console.error("❌ Não foi possível abrir janela de impressão");
      return;
    }

    const htmlContent = generatePrintHTML();
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          console.log('✅ Impressão web concluída');
        }, 2000);
      }, 500);
    };
  };

  const generatePrintHTML = () => {
    const printableComponent = (
      <PrintableListing
        type={selectedType}
        data={results}
        filters={filters}
        orderBy={orderBy}
        orderDirection={orderDirection}
        companyData={settings?.company}
      />
    );

    const componentHTML = renderToString(printableComponent);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório de ${selectedType}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              background: white;
            }
            .print-container { 
              padding: 20px; 
              max-width: none; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            @media print {
              body { margin: 0; }
              .print-container { padding: 10px; }
            }
          </style>
        </head>
        <body>
          ${componentHTML}
        </body>
      </html>
    `;
  };

  const handleExport = () => {
    console.log('📊 Exportação para Excel não implementada ainda');
    // TODO: Implementar exportação para Excel
  };

  return {
    selectedType,
    setSelectedType,
    filters,
    setFilters,
    orderBy,
    setOrderBy,
    orderDirection,
    setOrderDirection,
    results,
    loading: false, // Add loading state if needed
    handlePrint,
    handleExport
  };
}
