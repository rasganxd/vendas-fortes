import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Play, CheckCircle2, XCircle, AlertCircle, Database } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TableCount {
  external: number;
  cloud: number;
}

interface MigrationResult {
  success: boolean;
  count: number;
  error?: string;
}

const tableLabels: Record<string, string> = {
  units: 'Unidades',
  product_groups: 'Grupos de Produtos',
  product_categories: 'Categorias de Produtos',
  product_brands: 'Marcas de Produtos',
  products: 'Produtos',
  sales_reps: 'Vendedores',
  vehicles: 'Veículos',
  delivery_routes: 'Rotas de Entrega',
  customers: 'Clientes',
  payment_methods: 'Métodos de Pagamento',
  payment_tables: 'Tabelas de Pagamento',
  orders: 'Pedidos',
  order_items: 'Itens de Pedido',
  payments: 'Pagamentos',
  loads: 'Cargas',
  load_items: 'Itens de Carga',
  route_stops: 'Paradas de Rota',
  import_reports: 'Relatórios de Importação',
  mobile_order_import: 'Importação Mobile',
  company_settings: 'Configurações da Empresa',
  app_settings: 'Configurações do App',
  admin_profiles: 'Perfis de Admin',
  system_backups: 'Backups do Sistema',
  maintenance_logs: 'Logs de Manutenção'
};

const DataMigration: React.FC = () => {
  const [counts, setCounts] = useState<Record<string, TableCount>>({});
  const [results, setResults] = useState<Record<string, MigrationResult>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migratingTable, setMigratingTable] = useState<string | null>(null);

  const fetchCounts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('migrate-data', {
        body: { action: 'count' }
      });

      if (error) throw error;
      
      if (data?.counts) {
        setCounts(data.counts);
        toast.success('Contagem atualizada!');
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
      toast.error('Erro ao buscar contagem');
    } finally {
      setIsLoading(false);
    }
  };

  const migrateAll = async () => {
    setIsMigrating(true);
    setResults({});
    try {
      toast.info('Iniciando migração de todos os dados...');
      
      const { data, error } = await supabase.functions.invoke('migrate-data', {
        body: { action: 'migrate' }
      });

      if (error) throw error;
      
      if (data?.results) {
        setResults(data.results);
        const successCount = Object.values(data.results).filter((r: MigrationResult) => r.success).length;
        const totalCount = Object.keys(data.results).length;
        
        if (successCount === totalCount) {
          toast.success(`Migração concluída! ${successCount} tabelas migradas com sucesso.`);
        } else {
          toast.warning(`Migração parcial: ${successCount}/${totalCount} tabelas migradas.`);
        }
        
        // Refresh counts
        await fetchCounts();
      }
    } catch (error) {
      console.error('Error migrating:', error);
      toast.error('Erro durante a migração');
    } finally {
      setIsMigrating(false);
      setMigratingTable(null);
    }
  };

  const migrateTable = async (tableName: string) => {
    setMigratingTable(tableName);
    try {
      toast.info(`Migrando ${tableLabels[tableName] || tableName}...`);
      
      const { data, error } = await supabase.functions.invoke('migrate-data', {
        body: { action: 'migrate', table: tableName }
      });

      if (error) throw error;
      
      if (data?.results) {
        setResults(prev => ({ ...prev, ...data.results }));
        const result = data.results[tableName];
        
        if (result?.success) {
          toast.success(`${tableLabels[tableName]}: ${result.count} registros migrados!`);
        } else {
          toast.error(`Erro ao migrar ${tableLabels[tableName]}: ${result?.error}`);
        }
        
        // Refresh counts
        await fetchCounts();
      }
    } catch (error) {
      console.error('Error migrating table:', error);
      toast.error(`Erro ao migrar ${tableLabels[tableName] || tableName}`);
    } finally {
      setMigratingTable(null);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const totalExternal = Object.values(counts).reduce((sum, c) => sum + c.external, 0);
  const totalCloud = Object.values(counts).reduce((sum, c) => sum + c.cloud, 0);
  const migrationProgress = totalExternal > 0 ? (totalCloud / totalExternal) * 100 : 0;

  return (
    <PageLayout title="Migração de Dados">
      <div className="space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Migração do Supabase Externo para Cloud
            </CardTitle>
            <CardDescription>
              Migre todos os dados do seu projeto Supabase existente para o Lovable Cloud
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{totalExternal.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Registros Externos</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{totalCloud.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Registros no Cloud</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{migrationProgress.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Progresso</p>
              </div>
            </div>

            <Progress value={migrationProgress} className="h-3" />

            <div className="flex gap-2">
              <Button 
                onClick={fetchCounts} 
                variant="outline" 
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar Contagem
              </Button>
              <Button 
                onClick={migrateAll} 
                disabled={isMigrating || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                {isMigrating ? 'Migrando...' : 'Migrar Todos os Dados'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tables Detail */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes por Tabela</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tabela</TableHead>
                  <TableHead className="text-center">Externos</TableHead>
                  <TableHead className="text-center">Cloud</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(tableLabels).map(([key, label]) => {
                  const count = counts[key] || { external: 0, cloud: 0 };
                  const result = results[key];
                  const isMigrated = count.cloud >= count.external && count.external > 0;
                  
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{label}</TableCell>
                      <TableCell className="text-center">{count.external.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{count.cloud.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {result ? (
                          result.success ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {result.count} migrados
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Erro
                            </Badge>
                          )
                        ) : isMigrated ? (
                          <Badge variant="secondary">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Sincronizado
                          </Badge>
                        ) : count.external === 0 ? (
                          <Badge variant="outline">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Vazio
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => migrateTable(key)}
                          disabled={migratingTable === key || isMigrating || count.external === 0}
                        >
                          {migratingTable === key ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            'Migrar'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DataMigration;
