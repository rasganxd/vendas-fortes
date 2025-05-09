
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { migrateAllData } from '@/utils/dataMigration';
import { AlertCircle, ArrowRight, CheckCircle, Database, Loader2 } from 'lucide-react';
import { supabase } from '@/services/supabaseService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const DatabaseMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState<Record<string, any> | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  
  const handleMigrateData = async () => {
    try {
      setIsMigrating(true);
      setMigrationError(null);
      
      // Check Supabase connection
      const { error: connectionError } = await supabase.from('customers').select('count', { count: 'exact', head: true });
      
      if (connectionError) {
        setMigrationError("Não foi possível conectar ao Supabase. Verifique suas credenciais e conexão.");
        return;
      }
      
      const result = await migrateAllData();
      setMigrationResults(result.results);
    } catch (error) {
      console.error("Error starting migration:", error);
      setMigrationError("Erro ao iniciar migração: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsMigrating(false);
    }
  };
  
  const getTotalMigratedRecords = () => {
    if (!migrationResults) return 0;
    
    return Object.values(migrationResults).reduce((total, result) => {
      return total + (result.count || 0);
    }, 0);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={20} />
          Migração Firebase para Supabase
        </CardTitle>
        <CardDescription>
          Migre todos os seus dados do Firebase Firestore para o Supabase PostgreSQL
        </CardDescription>
      </CardHeader>
      <CardContent>
        {migrationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{migrationError}</AlertDescription>
          </Alert>
        )}
        
        {migrationResults && (
          <div className="space-y-4">
            <Alert variant={migrationResults.success ? "default" : "destructive"}>
              {migrationResults.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {migrationResults.success ? "Migração bem-sucedida" : "Migração parcial"}
              </AlertTitle>
              <AlertDescription>
                {getTotalMigratedRecords()} registros migrados no total
              </AlertDescription>
            </Alert>
            
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coleção</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registros</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(migrationResults).map(([collection, result]) => (
                    <tr key={collection}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{collection}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.success ? (
                          <span className="text-green-500 flex items-center">
                            <CheckCircle size={16} className="mr-1" /> Sucesso
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center">
                            <AlertCircle size={16} className="mr-1" /> Falha
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleMigrateData} 
          disabled={isMigrating} 
          className="w-full"
        >
          {isMigrating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrando...
            </>
          ) : (
            <>
              Migrar dados para Supabase <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseMigration;
