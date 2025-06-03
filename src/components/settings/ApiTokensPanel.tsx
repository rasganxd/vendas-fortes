import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, Plus, Trash2, AlertCircle, CheckCircle, Smartphone, Shield, Code, Wifi, WifiOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { apiTokenService, ApiToken, CreateTokenRequest } from '@/services/supabase/apiTokenService';
import { useSalesReps } from '@/hooks/useSalesReps';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const ApiTokensPanel: React.FC = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState<string>('');
  const [newTokenName, setNewTokenName] = useState('');
  const [expirationDays, setExpirationDays] = useState<string>('30');
  const [generatedToken, setGeneratedToken] = useState<string>('');
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ isOnline: boolean; lastChecked?: Date }>({
    isOnline: false
  });

  const { salesReps, isLoading: salesRepsLoading } = useSalesReps();

  // Quick API status check
  const checkApiStatus = async () => {
    try {
      const response = await fetch('https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/orders-api', {
        method: 'OPTIONS',
      });
      setApiStatus({
        isOnline: response.ok,
        lastChecked: new Date()
      });
    } catch (error) {
      setApiStatus({
        isOnline: false,
        lastChecked: new Date()
      });
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  // Debug logging for sales reps
  useEffect(() => {
    console.log("=== API TOKENS PANEL DEBUG ===");
    console.log("Sales reps loading:", salesRepsLoading);
    console.log("Sales reps data:", salesReps);
    console.log("Sales reps count:", salesReps?.length || 0);
    console.log("Selected sales rep:", selectedSalesRep);
    
    if (salesReps && salesReps.length > 0) {
      salesReps.forEach((rep, index) => {
        console.log(`Sales rep ${index}:`, {
          id: rep.id,
          name: rep.name,
          email: rep.email,
          code: rep.code,
          active: rep.active
        });
      });
    }
  }, [salesReps, salesRepsLoading, selectedSalesRep]);

  const loadTokens = async () => {
    if (!selectedSalesRep) {
      setTokens([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Loading tokens for sales rep:", selectedSalesRep);
      const data = await apiTokenService.getTokensBySalesRep(selectedSalesRep);
      console.log("Loaded tokens:", data);
      setTokens(data);
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tokens de API.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, [selectedSalesRep]);

  const handleCreateToken = async () => {
    console.log("=== CREATING TOKEN ===");
    console.log("Selected sales rep:", selectedSalesRep);
    console.log("Token name:", newTokenName);
    console.log("Expiration days:", expirationDays);

    if (!selectedSalesRep || !newTokenName.trim()) {
      console.log("Validation failed - missing sales rep or token name");
      toast({
        title: "Erro",
        description: "Selecione um vendedor e informe um nome para o token.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingToken(true);
    try {
      console.log("Creating token for sales rep:", selectedSalesRep, "with name:", newTokenName);
      
      // Convert "never" to undefined for no expiration
      const expirationValue = expirationDays === "never" ? undefined : parseInt(expirationDays);
      
      const request: CreateTokenRequest = {
        sales_rep_id: selectedSalesRep,
        name: newTokenName.trim(),
        expires_days: expirationValue
      };

      console.log("Token request:", request);

      const token = await apiTokenService.generateToken(request);
      console.log("Token created successfully:", token ? "✅ token received" : "❌ no token returned");
      
      if (!token) {
        throw new Error("Nenhum token foi retornado pelo serviço");
      }

      setGeneratedToken(token);
      setShowTokenDialog(true);
      setIsDialogOpen(false);
      setNewTokenName('');
      setExpirationDays('30');
      
      // Reload tokens
      await loadTokens();

      toast({
        title: "Token criado",
        description: "Token de API criado com sucesso!"
      });
    } catch (error) {
      console.error('❌ Error creating token:', error);
      let errorMessage = "Não foi possível criar o token de API.";
      
      if (error instanceof Error) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreatingToken(false);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    try {
      await apiTokenService.revokeToken(tokenId);
      await loadTokens();
      
      toast({
        title: "Token revogado",
        description: "Token de API revogado com sucesso!"
      });
    } catch (error) {
      console.error('Error revoking token:', error);
      toast({
        title: "Erro",
        description: "Não foi possível revogar o token.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    try {
      await apiTokenService.deleteToken(tokenId);
      await loadTokens();
      
      toast({
        title: "Token excluído",
        description: "Token de API excluído com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting token:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o token.",
        variant: "destructive"
      });
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    toast({
      title: "Copiado!",
      description: "Token copiado para a área de transferência."
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isTokenExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Filter valid sales reps with proper validation
  const validSalesReps = salesReps?.filter(rep => {
    const isValid = rep.id && rep.id.trim() !== '' && rep.name && rep.name.trim() !== '';
    if (!isValid) {
      console.log("Filtering out invalid sales rep:", rep);
    }
    return isValid;
  }) || [];

  console.log("Valid sales reps for dropdown:", validSalesReps);

  return (
    <div className="space-y-6">
      {/* Status da API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {apiStatus.isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Status da API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                API de Pedidos: {apiStatus.isOnline ? 'Online' : 'Offline'}
              </p>
              {apiStatus.lastChecked && (
                <p className="text-sm text-muted-foreground">
                  Verificado em: {apiStatus.lastChecked.toLocaleString()}
                </p>
              )}
            </div>
            <Badge variant={apiStatus.isOnline ? "default" : "destructive"}>
              {apiStatus.isOnline ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Tokens de API REST
          </CardTitle>
          <p className="text-sm text-gray-600">
            Gerencie tokens de acesso para a API REST de pedidos. Estes tokens permitem que aplicações mobile e externas acessem os endpoints de forma segura.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="salesRep">Vendedor</Label>
              {salesRepsLoading ? (
                <div className="flex items-center justify-center p-3 border rounded">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Carregando vendedores...
                </div>
              ) : validSalesReps.length === 0 ? (
                <div className="p-3 border rounded bg-yellow-50 text-yellow-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Nenhum vendedor encontrado. Cadastre vendedores primeiro.</span>
                  </div>
                </div>
              ) : (
                <Select value={selectedSalesRep} onValueChange={setSelectedSalesRep}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {validSalesReps.map((rep) => {
                      console.log(`Rendering sales rep: ${rep.name} (ID: ${rep.id}, Code: ${rep.code})`);
                      return (
                        <SelectItem key={rep.id} value={rep.id}>
                          {rep.name} (#{rep.code})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => setIsDialogOpen(true)}
                disabled={!selectedSalesRep || salesRepsLoading}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Token
              </Button>
            </div>
          </div>

          {selectedSalesRep && (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Carregando tokens...
                      </TableCell>
                    </TableRow>
                  ) : tokens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Nenhum token encontrado para este vendedor
                      </TableCell>
                    </TableRow>
                  ) : (
                    tokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell className="font-medium">{token.name}</TableCell>
                        <TableCell>
                          {!token.is_active ? (
                            <Badge variant="destructive">Revogado</Badge>
                          ) : isTokenExpired(token.expires_at) ? (
                            <Badge variant="destructive">Expirado</Badge>
                          ) : (
                            <Badge variant="default">Ativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(token.created_at)}</TableCell>
                        <TableCell>
                          {token.expires_at ? formatDate(token.expires_at) : 'Nunca'}
                        </TableCell>
                        <TableCell>
                          {token.last_used_at ? formatDate(token.last_used_at) : 'Nunca'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {token.is_active && !isTokenExpired(token.expires_at) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeToken(token.id)}
                              >
                                Revogar
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteToken(token.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentação Corrigida da API */}
      <Card>
        <CardHeader>
          <CardTitle>Documentação da API - Endpoints Corretos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Orders API (CRUD) */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">Orders API (CRUD)</h3>
              <Badge variant="outline">Protegida</Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-3">
              <code className="text-sm font-mono">
                https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/orders-api
              </code>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              <strong>Finalidade:</strong> Gerenciar pedidos já importados no sistema. Requer autenticação com token API.
            </p>
            
            <div className="space-y-2">
              <p className="font-medium text-sm">Endpoints disponíveis:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li><code>GET /</code> - Listar pedidos importados (com filtros)</li>
                <li><code>GET /:id</code> - Buscar pedido específico</li>
                <li><code>PUT /:id</code> - Atualizar pedido</li>
                <li><code>DELETE /:id</code> - Excluir pedido</li>
                <li className="text-red-600"><code>POST /</code> - ⚠️ NÃO aceita criação de pedidos mobile</li>
              </ul>
            </div>

            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Esta API é para gerenciar pedidos já no sistema, não para receber novos pedidos do mobile.
              </p>
            </div>
          </div>

          {/* Mobile Import API */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-lg">Mobile Orders Import API</h3>
              <Badge variant="default" className="bg-green-500">Para Mobile</Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-3">
              <code className="text-sm font-mono">
                https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/mobile-orders-import
              </code>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              <strong>Finalidade:</strong> Receber pedidos enviados pelos aplicativos mobile. Use este endpoint nos apps mobile.
            </p>
            
            <div className="space-y-2">
              <p className="font-medium text-sm">Endpoints disponíveis:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li><code>POST /</code> - Enviar pedidos do mobile</li>
                <li><code>GET /:sales_rep_id</code> - Listar pedidos pendentes por vendedor</li>
              </ul>
            </div>

            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                <strong>Use este endpoint</strong> para enviar pedidos dos aplicativos mobile. Os pedidos ficam pendentes até serem importados manualmente.
              </p>
            </div>
          </div>

          {/* Mobile Sync API */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-lg">Mobile Sync API</h3>
              <Badge variant="default" className="bg-purple-500">Sincronização</Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-3">
              <code className="text-sm font-mono">
                https://ufvnubabpcyimahbubkd.supabase.co/functions/v1/mobile-sync
              </code>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              <strong>Finalidade:</strong> Sincronização completa para aplicativos mobile - dados e pedidos.
            </p>
            
            <div className="space-y-2">
              <p className="font-medium text-sm">Funcionalidades:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Baixar produtos e clientes atualizados</li>
                <li>• Enviar pedidos em lote</li>
                <li>• Obter estatísticas de sincronização</li>
                <li>• Gerenciar tokens de sincronização</li>
              </ul>
            </div>
          </div>

          {/* Authentication Guide */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Autenticação</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-sm">Para Orders API:</p>
                <code className="text-sm bg-gray-100 p-2 rounded border block mt-1">
                  x-api-key: seu_token_aqui
                </code>
              </div>
              <div>
                <p className="font-medium text-sm">Para Mobile APIs:</p>
                <p className="text-sm text-gray-600">Use as credenciais do vendedor ou tokens de sincronização</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para criar token */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Token de API</DialogTitle>
            <DialogDescription>
              Crie um token de acesso para permitir que aplicações externas acessem a API de pedidos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tokenName">Nome do Token</Label>
              <Input
                id="tokenName"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                placeholder="Ex: App Mobile - iOS"
              />
            </div>
            <div>
              <Label htmlFor="expiration">Expiração (dias)</Label>
              <Select value={expirationDays} onValueChange={setExpirationDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="365">1 ano</SelectItem>
                  <SelectItem value="never">Nunca expira</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateToken}
                disabled={isCreatingToken || !selectedSalesRep || !newTokenName.trim()}
              >
                {isCreatingToken ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Criando...
                  </>
                ) : (
                  'Criar Token'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para mostrar token gerado */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Token Criado com Sucesso
            </DialogTitle>
            <DialogDescription>
              Copie o token abaixo. Por segurança, ele só será exibido uma vez.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800">Importante!</p>
                  <p className="text-sm text-yellow-700">
                    Guarde este token em local seguro. Ele não poderá ser visualizado novamente.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Seu Token de API:</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedToken}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyToken}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={() => setShowTokenDialog(false)}>
              Entendi, fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiTokensPanel;
