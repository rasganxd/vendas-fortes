
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Key, Trash2, Plus, Copy, Eye, EyeOff } from 'lucide-react';
import { apiTokenService, ApiToken } from '@/services/supabase/apiTokenService';
import { SalesRep } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MobileTokenManagerProps {
  salesRep: SalesRep;
}

export default function MobileTokenManager({ salesRep }: MobileTokenManagerProps) {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadTokens();
  }, [salesRep.id]);

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      const tokenList = await apiTokenService.getTokensBySalesRep(salesRep.id);
      setTokens(tokenList);
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tokens",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateToken = async () => {
    if (!newTokenName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o token",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      const token = await apiTokenService.generateToken({
        sales_rep_id: salesRep.id,
        name: newTokenName.trim(),
        expires_days: 30
      });

      toast({
        title: "Token gerado",
        description: "Token de API criado com sucesso",
      });

      setNewTokenName('');
      loadTokens();
      
      // Auto-copy to clipboard
      navigator.clipboard.writeText(token);
      toast({
        title: "Token copiado",
        description: "Token copiado para a área de transferência",
      });
    } catch (error) {
      console.error('Error generating token:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar token",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    try {
      await apiTokenService.revokeToken(tokenId);
      toast({
        title: "Token revogado",
        description: "Token foi revogado com sucesso",
      });
      loadTokens();
    } catch (error) {
      console.error('Error revoking token:', error);
      toast({
        title: "Erro",
        description: "Erro ao revogar token",
        variant: "destructive"
      });
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Token copiado",
      description: "Token copiado para a área de transferência",
    });
  };

  const toggleTokenVisibility = (tokenId: string) => {
    const newVisible = new Set(visibleTokens);
    if (newVisible.has(tokenId)) {
      newVisible.delete(tokenId);
    } else {
      newVisible.add(tokenId);
    }
    setVisibleTokens(newVisible);
  };

  const maskToken = (token: string) => {
    return token.substring(0, 8) + '...' + token.substring(token.length - 8);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone size={20} />
          Tokens Mobile - {salesRep.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generate New Token */}
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Gerar Novo Token</h4>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="tokenName">Nome do Token</Label>
              <Input
                id="tokenName"
                placeholder="Ex: App Mobile 2024"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateToken()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateToken}
                disabled={isGenerating || !newTokenName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" />
                {isGenerating ? 'Gerando...' : 'Gerar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tokens List */}
        <div className="space-y-3">
          <h4 className="font-medium">Tokens Ativos</h4>
          
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">
              Carregando tokens...
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhum token encontrado
            </div>
          ) : (
            tokens.map((token) => (
              <div key={token.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{token.name}</div>
                    <div className="text-sm text-gray-500">
                      Criado {formatDistanceToNow(new Date(token.created_at), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </div>
                    {token.last_used_at && (
                      <div className="text-sm text-gray-500">
                        Último uso {formatDistanceToNow(new Date(token.last_used_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </div>
                    )}
                    {token.expires_at && (
                      <div className="text-sm text-gray-500">
                        Expira {formatDistanceToNow(new Date(token.expires_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </div>
                    )}
                  </div>
                  <Badge variant={token.is_active ? "default" : "destructive"}>
                    {token.is_active ? "Ativo" : "Revogado"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Token de API</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={visibleTokens.has(token.id) ? token.token : maskToken(token.token)}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleTokenVisibility(token.id)}
                    >
                      {visibleTokens.has(token.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToken(token.token)}
                    >
                      <Copy size={16} />
                    </Button>
                    {token.is_active && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => revokeToken(token.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Como usar no App Mobile</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Faça login no app mobile com código do vendedor e senha</li>
            <li>Configure a URL da API do desktop</li>
            <li>Cole o token de API gerado acima</li>
            <li>O app móvel poderá sincronizar dados e enviar pedidos</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
