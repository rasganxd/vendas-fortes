
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { generateCompleteSQL } from '@/utils/sqlGenerator';
import { AlertCircle, Check, Copy, Database, Download, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/services/supabaseService';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DatabaseSchemaGenerator = () => {
  const [sql, setSql] = useState<string>('');
  const [includeDrops, setIncludeDrops] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const generateSQL = () => {
    setIsGenerating(true);
    try {
      const generatedSQL = generateCompleteSQL(includeDrops);
      setSql(generatedSQL);
      setExecutionResult(null);
      setExecutionError(null);
      toast({
        title: "SQL gerado com sucesso",
        description: "O script SQL foi gerado com base nas interfaces TypeScript."
      });
    } catch (error) {
      console.error("Error generating SQL:", error);
      toast({
        title: "Erro ao gerar SQL",
        description: "Houve um problema ao gerar o script SQL.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(sql)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copiado!",
          description: "O SQL foi copiado para a área de transferência."
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o texto.",
          variant: "destructive"
        });
      });
  };
  
  const downloadSQL = () => {
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'supabase_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download iniciado",
      description: "O arquivo SQL está sendo baixado."
    });
  };
  
  const executeSQL = async () => {
    if (!sql) {
      toast({
        title: "Nenhum SQL para executar",
        description: "Primeiro gere o script SQL.",
        variant: "destructive"
      });
      return;
    }
    
    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);
    
    try {
      // Use Supabase's rpc to execute raw SQL
      // Note: This requires appropriate permissions in Supabase
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
      
      if (error) {
        throw error;
      }
      
      setExecutionResult("Script SQL executado com sucesso no Supabase!");
      toast({
        title: "SQL executado",
        description: "O script SQL foi executado no Supabase."
      });
    } catch (error) {
      console.error("Error executing SQL:", error);
      setExecutionError(
        "Erro ao executar SQL. Você precisa criar uma função RPC no Supabase chamada 'execute_sql' " +
        "com permissão para executar SQL arbitrário. Alternativamente, você pode copiar o SQL e executá-lo " +
        "manualmente no editor SQL do Supabase."
      );
      toast({
        title: "Erro ao executar SQL",
        description: "Houve um problema ao executar o script no Supabase.",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={20} />
          Gerador de Esquema SQL
        </CardTitle>
        <CardDescription>
          Gere scripts SQL para criar tabelas no Supabase a partir das interfaces TypeScript
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeDrops" 
              checked={includeDrops} 
              onCheckedChange={(checked) => setIncludeDrops(checked === true)}
            />
            <label 
              htmlFor="includeDrops" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Incluir comandos DROP TABLE (cuidado: isso apagará dados existentes)
            </label>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={generateSQL} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Gerar SQL
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={copyToClipboard}
              disabled={!sql || isGenerating}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar SQL
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadSQL}
              disabled={!sql || isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar SQL
            </Button>
          </div>
          
          {sql && (
            <Tabs defaultValue="sql">
              <TabsList>
                <TabsTrigger value="sql">SQL</TabsTrigger>
                <TabsTrigger value="execute">Executar</TabsTrigger>
              </TabsList>
              <TabsContent value="sql">
                <Textarea
                  className="h-[400px] font-mono text-sm"
                  value={sql}
                  readOnly
                />
              </TabsContent>
              <TabsContent value="execute">
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                      Para executar SQL diretamente no Supabase, é necessário configurar uma função RPC chamada "execute_sql" 
                      no painel do Supabase. Alternativamente, você pode copiar o SQL e executá-lo manualmente no editor SQL do Supabase.
                    </AlertDescription>
                  </Alert>
                  
                  <Button
                    onClick={executeSQL}
                    disabled={!sql || isExecuting}
                    className="w-full"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Executando...
                      </>
                    ) : (
                      "Executar SQL no Supabase"
                    )}
                  </Button>
                  
                  {executionResult && (
                    <Alert>
                      <Check className="h-4 w-4" />
                      <AlertTitle>Sucesso</AlertTitle>
                      <AlertDescription>
                        {executionResult}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {executionError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro</AlertTitle>
                      <AlertDescription>
                        {executionError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseSchemaGenerator;
