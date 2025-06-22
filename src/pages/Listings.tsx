
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ListingFilters from '@/components/listings/ListingFilters';
import ListingResults from '@/components/listings/ListingResults';
import { useListings } from '@/hooks/useListings';
import { Button } from '@/components/ui/button';
import { Printer, FileSpreadsheet } from 'lucide-react';

export default function Listings() {
  const {
    selectedType,
    setSelectedType,
    filters,
    setFilters,
    orderBy,
    setOrderBy,
    orderDirection,
    setOrderDirection,
    results,
    loading,
    handlePrint,
    handleExport
  } = useListings();

  return (
    <PageLayout 
      title="Listagens Avançadas" 
      subtitle="Crie relatórios personalizados com filtros flexíveis"
    >
      <div className="space-y-6">
        {/* Seleção do Tipo de Listagem */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Listagem</CardTitle>
          </CardHeader>
          <CardContent>
            <ListingFilters
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              filters={filters}
              onFiltersChange={setFilters}
              orderBy={orderBy}
              onOrderByChange={setOrderBy}
              orderDirection={orderDirection}
              onOrderDirectionChange={setOrderDirection}
            />
          </CardContent>
        </Card>

        {/* Ações de Impressão/Export */}
        {results.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button 
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Relatório
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleExport}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>
              Resultados da Listagem
              {results.length > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({results.length} registros encontrados)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ListingResults
              type={selectedType}
              data={results}
              loading={loading}
              orderBy={orderBy}
              orderDirection={orderDirection}
              onSort={(field) => {
                if (orderBy === field) {
                  setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  setOrderBy(field);
                  setOrderDirection('asc');
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
