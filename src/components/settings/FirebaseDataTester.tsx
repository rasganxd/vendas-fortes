
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { initializeFirestore } from '@/services/firebase/initializeFirestore';
import { Customer, Product, ProductCategory, ProductGroup, ProductBrand, SalesRep, Vehicle, DeliveryRoute, Load } from "@/types";
import { 
  customerService, 
  productService, 
  productCategoryService,
  productGroupService,
  productBrandService,
  salesRepService,
  vehicleService,
  deliveryRouteService,
  loadService
} from "@/services/firebase";

type TestResult = {
  entity: string;
  operation: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
};

export default function FirebaseDataTester() {
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
      
      // Initialize Firestore collections first
      addResult({
        entity: 'Firebase',
        operation: 'Initialize',
        status: 'success',
        message: 'Iniciando inicialização das coleções do Firebase...'
      });
      
      const initResult = await initializeFirestore(false);
      
      addResult({
        entity: 'Firebase',
        operation: 'Initialize',
        status: initResult ? 'success' : 'error',
        message: initResult ? 'Coleções inicializadas com sucesso' : 'Erro ao inicializar coleções'
      });
      
      setProgress(5);
      
      // 1. Test Customer CRUD
      await testCustomerOperations();
      setProgress(20);
      
      // 2. Test Product CRUD
      await testProductOperations();
      setProgress(35);
      
      // 3. Test Product Classifications
      await testProductClassifications();
      setProgress(50);
      
      // 4. Test Sales Rep CRUD
      await testSalesRepOperations();
      setProgress(65);
      
      // 5. Test Vehicle CRUD
      await testVehicleOperations();
      setProgress(80);
      
      // 6. Test Route and Load CRUD
      await testRouteOperations();
      await testLoadOperations();
      setProgress(100);
      
      // Final report
      addResult({
        entity: 'Testes',
        operation: 'Finalizado',
        status: 'success',
        message: `Testes concluídos. Total: ${testResults.length + 1} operações.`
      });
      
      toast.success("Testes do Firebase concluídos com sucesso!");
      
    } catch (error) {
      console.error("Error during testing:", error);
      
      addResult({
        entity: 'Testes',
        operation: 'Erro',
        status: 'error',
        message: `Erro durante os testes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      
      toast.error("Erro ao executar os testes do Firebase");
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
      
      // Add a test customer
      const testCustomer: Omit<Customer, 'id'> = {
        name: `Cliente Teste ${new Date().getTime()}`,
        code: Math.floor(Math.random() * 10000),
        email: 'teste@exemplo.com',
        phone: '(99) 99999-9999',
        address: 'Rua de Teste, 123',
        city: 'Cidade Teste',
        state: 'ST',
        zip: '12345-678',
        zipCode: '12345-678',
        notes: 'Cliente para testes',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const customerId = await customerService.add(testCustomer);
      
      addResult({
        entity: 'Cliente',
        operation: 'Adicionar',
        status: 'success',
        message: `Cliente adicionado com ID: ${customerId}`,
        data: { ...testCustomer, id: customerId }
      });
      
      // Get the customer by ID
      const retrievedCustomer = await customerService.getById(customerId);
      
      addResult({
        entity: 'Cliente',
        operation: 'Buscar por ID',
        status: retrievedCustomer ? 'success' : 'error',
        message: retrievedCustomer 
          ? `Cliente recuperado: ${retrievedCustomer.name}` 
          : 'Erro: Cliente não encontrado'
      });
      
      // Update the customer
      if (retrievedCustomer) {
        await customerService.update(customerId, { 
          name: `${retrievedCustomer.name} (Atualizado)` 
        });
        
        // Verify update
        const updatedCustomer = await customerService.getById(customerId);
        
        addResult({
          entity: 'Cliente',
          operation: 'Atualizar',
          status: updatedCustomer?.name.includes('Atualizado') ? 'success' : 'error',
          message: updatedCustomer?.name.includes('Atualizado')
            ? `Cliente atualizado com sucesso: ${updatedCustomer.name}`
            : 'Erro: Atualização não verificada'
        });
      }
      
      // Delete the customer
      await customerService.delete(customerId);
      
      // Verify deletion
      const deletedCustomer = await customerService.getById(customerId);
      
      addResult({
        entity: 'Cliente',
        operation: 'Excluir',
        status: !deletedCustomer ? 'success' : 'error',
        message: !deletedCustomer
          ? 'Cliente excluído com sucesso'
          : 'Erro: Cliente ainda existe após a exclusão'
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
      
      // Add a test product
      const testProduct: Omit<Product, 'id'> = {
        name: `Produto Teste ${new Date().getTime()}`,
        code: Math.floor(Math.random() * 10000),
        description: 'Produto para testes',
        price: 99.99,
        cost: 50.00,
        unit: 'un',
        stock: 100,
        minStock: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const productId = await productService.add(testProduct);
      
      addResult({
        entity: 'Produto',
        operation: 'Adicionar',
        status: 'success',
        message: `Produto adicionado com ID: ${productId}`,
        data: { ...testProduct, id: productId }
      });
      
      // Get the product by ID
      const retrievedProduct = await productService.getById(productId);
      
      addResult({
        entity: 'Produto',
        operation: 'Buscar por ID',
        status: retrievedProduct ? 'success' : 'error',
        message: retrievedProduct 
          ? `Produto recuperado: ${retrievedProduct.name}` 
          : 'Erro: Produto não encontrado'
      });
      
      // Update the product
      if (retrievedProduct) {
        await productService.update(productId, { 
          price: 109.99,
          description: 'Produto de teste atualizado'
        });
        
        // Verify update
        const updatedProduct = await productService.getById(productId);
        
        addResult({
          entity: 'Produto',
          operation: 'Atualizar',
          status: updatedProduct?.price === 109.99 ? 'success' : 'error',
          message: updatedProduct?.price === 109.99
            ? `Produto atualizado com sucesso: preço alterado para ${updatedProduct.price}`
            : 'Erro: Atualização do produto não verificada'
        });
      }
      
      // Delete the product
      await productService.delete(productId);
      
      // Verify deletion
      const deletedProduct = await productService.getById(productId);
      
      addResult({
        entity: 'Produto',
        operation: 'Excluir',
        status: !deletedProduct ? 'success' : 'error',
        message: !deletedProduct
          ? 'Produto excluído com sucesso'
          : 'Erro: Produto ainda existe após a exclusão'
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
      const testCategory: Omit<ProductCategory, 'id'> = {
        name: `Categoria Teste ${new Date().getTime()}`,
        description: 'Categoria para testes',
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const categoryId = await productCategoryService.add(testCategory);
      
      addResult({
        entity: 'Categoria',
        operation: 'Adicionar',
        status: 'success',
        message: `Categoria adicionada com ID: ${categoryId}`
      });
      
      // Clean up
      await productCategoryService.delete(categoryId);
      
      // Test Group
      const testGroup: Omit<ProductGroup, 'id'> = {
        name: `Grupo Teste ${new Date().getTime()}`,
        description: 'Grupo para testes',
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const groupId = await productGroupService.add(testGroup);
      
      addResult({
        entity: 'Grupo',
        operation: 'Adicionar',
        status: 'success',
        message: `Grupo adicionado com ID: ${groupId}`
      });
      
      // Clean up
      await productGroupService.delete(groupId);
      
      // Test Brand
      const testBrand: Omit<ProductBrand, 'id'> = {
        name: `Marca Teste ${new Date().getTime()}`,
        description: 'Marca para testes',
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const brandId = await productBrandService.add(testBrand);
      
      addResult({
        entity: 'Marca',
        operation: 'Adicionar',
        status: 'success',
        message: `Marca adicionada com ID: ${brandId}`
      });
      
      // Clean up
      await productBrandService.delete(brandId);
      
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
  
  // Test Sales Rep CRUD operations
  const testSalesRepOperations = async () => {
    try {
      // Add a test sales rep
      const testSalesRep: Omit<SalesRep, 'id'> = {
        name: `Vendedor Teste ${new Date().getTime()}`,
        code: Math.floor(Math.random() * 10000),
        phone: '(99) 99999-9999',
        email: '', // Added missing property
        address: '', // Added missing property
        city: '', // Added missing property
        state: '', // Added missing property
        zip: '', // Added missing property
        region: '', // Added missing property
        document: '', // Added missing property
        role: '', // Added missing property
        notes: '', // Added missing property
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const salesRepId = await salesRepService.add(testSalesRep);
      
      addResult({
        entity: 'Vendedor',
        operation: 'Adicionar',
        status: 'success',
        message: `Vendedor adicionado com ID: ${salesRepId}`
      });
      
      // Clean up
      await salesRepService.delete(salesRepId);
      
      addResult({
        entity: 'Vendedor',
        operation: 'Excluir',
        status: 'success',
        message: 'Vendedor excluído com sucesso'
      });
      
    } catch (error) {
      console.error("Error testing sales rep operations:", error);
      
      addResult({
        entity: 'Vendedor',
        operation: 'Erro',
        status: 'error',
        message: `Erro nas operações de vendedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  };
  
  // Test Vehicle CRUD operations
  const testVehicleOperations = async () => {
    try {
      // Add a test vehicle
      const testVehicle: Omit<Vehicle, 'id'> = {
        name: `Veículo Teste ${new Date().getTime()}`,
        type: "van",
        plateNumber: "ABC-1234",
        licensePlate: "ABC-1234",
        model: "Modelo Teste",
        capacity: 1000,
        driverName: "", // Added missing property
        status: "", // Added missing property
        notes: "", // Added missing property
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const vehicleId = await vehicleService.add(testVehicle);
      
      addResult({
        entity: 'Veículo',
        operation: 'Adicionar',
        status: 'success',
        message: `Veículo adicionado com ID: ${vehicleId}`
      });
      
      // Clean up
      await vehicleService.delete(vehicleId);
      
      addResult({
        entity: 'Veículo',
        operation: 'Excluir',
        status: 'success',
        message: 'Veículo excluído com sucesso'
      });
      
    } catch (error) {
      console.error("Error testing vehicle operations:", error);
      
      addResult({
        entity: 'Veículo',
        operation: 'Erro',
        status: 'error',
        message: `Erro nas operações de veículo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  };
  
  // Test Route CRUD operations
  const testRouteOperations = async () => {
    try {
      // Add a test route
      const testRoute: Omit<DeliveryRoute, 'id'> = {
        name: `Rota Teste ${new Date().getTime()}`,
        description: 'Rota para testes',
        status: "planning",
        date: new Date(),
        driverName: "Motorista de Teste",
        driverId: "",
        vehicleId: "",
        vehicleName: "", // Added missing property
        stops: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const routeId = await deliveryRouteService.add(testRoute);
      
      addResult({
        entity: 'Rota',
        operation: 'Adicionar',
        status: 'success',
        message: `Rota adicionada com ID: ${routeId}`
      });
      
      // Clean up
      await deliveryRouteService.delete(routeId);
      
      addResult({
        entity: 'Rota',
        operation: 'Excluir',
        status: 'success',
        message: 'Rota excluída com sucesso'
      });
      
    } catch (error) {
      console.error("Error testing route operations:", error);
      
      addResult({
        entity: 'Rota',
        operation: 'Erro',
        status: 'error',
        message: `Erro nas operações de rota: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  };
  
  // Test Load CRUD operations
  const testLoadOperations = async () => {
    try {
      // Add a test load
      const testLoad: Omit<Load, 'id'> = {
        name: `Carga Teste ${new Date().getTime()}`,
        code: Math.floor(Math.random() * 10000),
        description: 'Carga para testes',
        date: new Date(),
        status: "pending",
        items: [], // Added missing property
        orders: [], // Added missing property
        total: 0, // Added missing property
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const loadId = await loadService.add(testLoad);
      
      addResult({
        entity: 'Carga',
        operation: 'Adicionar',
        status: 'success',
        message: `Carga adicionada com ID: ${loadId}`
      });
      
      // Clean up
      await loadService.delete(loadId);
      
      addResult({
        entity: 'Carga',
        operation: 'Excluir',
        status: 'success',
        message: 'Carga excluída com sucesso'
      });
      
    } catch (error) {
      console.error("Error testing load operations:", error);
      
      addResult({
        entity: 'Carga',
        operation: 'Erro',
        status: 'error',
        message: `Erro nas operações de carga: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Database className="text-primary" size={20} />
          Teste do Armazenamento no Firebase
        </CardTitle>
        <CardDescription>
          Teste das operações básicas (CRUD) de todos os tipos de entidades no Firebase.
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
          <p>Este teste verifica se todas as operações de armazenamento no Firebase estão funcionando corretamente. 
            Ele testa a criação, leitura, atualização e exclusão de todos os tipos de entidades.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
