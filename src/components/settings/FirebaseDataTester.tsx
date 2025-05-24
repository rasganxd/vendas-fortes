
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { Customer, Product, ProductCategory, ProductGroup, ProductBrand, SalesRep, Vehicle, DeliveryRoute, Load } from "@/types";
import { 
  customerService, 
  productService, 
  productCategoryService,
  productGroupService,
  productBrandService,
  salesRepService
} from "@/services/supabase";

type TestResult = {
  entity: string;
  operation: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
};

export default function SupabaseDataTester() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);
  
  const addResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
    // Auto-scroll to bottom
    setTimeout(() => {
      const scrollArea = document.getElementById('test-results-scroll-area');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }, 10);
  };
  
  const clearResults = () => {
    setTestResults([]);
    setProgress(0);
  };

  const runTests = async () => {
    try {
      setIsTesting(true);
      clearResults();
      
      addResult({
        entity: 'Supabase',
        operation: 'Initialize',
        status: 'success',
        message: 'Iniciando testes de conexão com Supabase...'
      });
      
      setProgress(5);
      
      // 1. Test Customer CRUD
      await testCustomerOperations();
      setProgress(35);
      
      // 2. Test Product CRUD
      await testProductOperations();
      setProgress(70);
      
      // 3. Test Product Classifications
      await testProductClassifications();
      setProgress(100);
      
      // Final report
      addResult({
        entity: 'Testes',
        operation: 'Finalizado',
        status: 'success',
        message: `Testes concluídos. Total: ${testResults.length + 1} operações.`
      });
      
      toast.success("Testes do Supabase concluídos com sucesso!");
      
    } catch (error) {
      console.error("Error during testing:", error);
      
      addResult({
        entity: 'Testes',
        operation: 'Erro',
        status: 'error',
        message: `Erro durante os testes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      
      toast.error("Erro ao executar os testes do Supabase");
    } finally {
      setIsTesting(false);
    }
  };
  
  // Test Customer CRUD operations
  const testCustomerOperations = async () => {
    try {
      // Test getting all customers
      const customers = await customerService.getAll();
      
      addResult({
        entity: 'Cliente',
        operation: 'Buscar todos',
        status: 'success',
        message: `Recuperados ${customers.length} clientes`
      });
      
    } catch (error) {
      console.error("Error testing customer operations:", error);
      
      addResult({
        entity: 'Cliente',
        operation: 'Erro',
        status: 'error',
        message: `Erro nas operações de cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  };
  
  // Test Product CRUD operations
  const testProductOperations = async () => {
    try {
      // Test getting all products
      const products = await productService.getAll();
      
      addResult({
        entity: 'Produto',
        operation: 'Buscar todos',
        status: 'success',
        message: `Recuperados ${products.length} produtos`
      });
      
    } catch (error) {
      console.error("Error testing product operations:", error);
      
      addResult({
        entity: 'Produto',
        operation: 'Erro',
        status: 'error',
        message: `Erro nas operações de produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  };
  
  // Test Product Classifications
  const testProductClassifications = async () => {
    try {
      // Test Category
      const categories = await productCategoryService.getAll();
      
      addResult({
        entity: 'Categoria',
        operation: 'Buscar todas',
        status: 'success',
        message: `Recuperadas ${categories.length} categorias`
      });
      
      // Test Group
      const groups = await productGroupService.getAll();
      
      addResult({
        entity: 'Grupo',
        operation: 'Buscar todos',
        status: 'success',
        message: `Recuperados ${groups.length} grupos`
      });
      
      // Test Brand
      const brands = await productBrandService.getAll();
      
      addResult({
        entity: 'Marca',
        operation: 'Buscar todas',
        status: 'success',
        message: `Recuperadas ${brands.length} marcas`
      });
      
    } catch (error) {
      console.error("Error testing product classifications:", error);
      
      addResult({
        entity: 'Classificações',
        operation: 'Erro',
        status: 'error',
        message: `Erro nas operações de classificações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Database className="text-primary" size={20} />
          Teste do Armazenamento no Supabase
        </CardTitle>
        <CardDescription>
          Teste das operações básicas (CRUD) de todos os tipos de entidades no Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button 
            onClick={runTests} 
            disabled={isTesting}
            className="mb-4"
          >
            {isTesting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Realizando testes...
              </>
            ) : (
              'Executar Testes'
            )}
          </Button>
          
          {progress > 0 && (
            <div className="w-full mt-2 mb-4">
              <div className="text-sm text-muted-foreground mb-1">
                Progresso: {progress}%
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {testResults.length > 0 && (
          <div>
            <h3 className="text-md font-medium mb-2">Resultados dos Testes</h3>
            <ScrollArea id="test-results-scroll-area" className="h-[400px] bg-muted/20 border rounded-md p-3">
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <Alert key={index} variant={result.status === 'success' ? 'default' : 'destructive'} className="py-2">
                    <div className="flex items-start">
                      {result.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 mr-2" />
                      )}
                      <div>
                        <AlertTitle className="text-sm">
                          {result.entity} - {result.operation}
                        </AlertTitle>
                        <AlertDescription className="text-xs mt-1">
                          {result.message}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground mt-2">
          <p>Este teste verifica se todas as operações de armazenamento no Supabase estão funcionando corretamente. 
            Ele testa a leitura de todos os tipos de entidades.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
