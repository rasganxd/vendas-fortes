
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Settings, RefreshCw, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { mobileSyncService, SyncSettings } from '@/services/supabase/mobileSyncService';
import { toast } from '@/components/ui/use-toast';

const SyncSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<number | null>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await mobileSyncService.getSyncSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading sync settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de sincronização.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      await mobileSyncService.updateSyncSettings(settings);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de sincronização foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error('Error saving sync settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cleanupExpiredTokens = async () => {
    try {
      setIsCleaning(true);
      const cleaned = await mobileSyncService.cleanupExpiredTokens();
      setLastCleanup(cleaned);
      
      toast({
        title: "Limpeza concluída",
        description: `${cleaned} tokens expirados foram removidos.`
      });
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar os tokens expirados.",
        variant: "destructive"
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const updateSetting = (key: keyof SyncSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não foi possível carregar as configurações de sincronização.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações de Sincronização
        </CardTitle>
        <CardDescription>
          Configure como os dados são sincronizados entre o sistema principal e aplicativos móveis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-sync">Sincronização automática</Label>
              <Switch
                id="auto-sync"
                checked={settings.auto_sync_enabled}
                onCheckedChange={(checked) => updateSetting('auto_sync_enabled', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sync-interval">Intervalo de sincronização (minutos)</Label>
              <Input
                id="sync-interval"
                type="number"
                value={settings.sync_interval_minutes}
                onChange={(e) => updateSetting('sync_interval_minutes', parseInt(e.target.value))}
                min="5"
                max="1440"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-offline">Máximo de dias offline</Label>
              <Input
                id="max-offline"
                type="number"
                value={settings.max_offline_days}
                onChange={(e) => updateSetting('max_offline_days', parseInt(e.target.value))}
                min="1"
                max="30"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="admin-approval">Requer aprovação do administrador</Label>
              <Switch
                id="admin-approval"
                checked={settings.require_admin_approval}
                onCheckedChange={(checked) => updateSetting('require_admin_approval', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipos de dados permitidos</Label>
              <div className="flex flex-wrap gap-2">
                {settings.allowed_data_types.map((type) => (
                  <Badge key={type} variant="outline">
                    {type === 'orders' ? 'Pedidos' : 
                     type === 'customers' ? 'Clientes' : 
                     type === 'products' ? 'Produtos' : type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Manutenção do sistema</h4>
              <p className="text-sm text-muted-foreground">
                Limpar tokens expirados e otimizar o banco de dados
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={cleanupExpiredTokens}
                disabled={isCleaning}
              >
                {isCleaning ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Limpar tokens
              </Button>
              
              <Button
                variant="outline"
                onClick={loadSettings}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
            </div>
          </div>
          
          {lastCleanup !== null && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Última limpeza removeu {lastCleanup} tokens expirados.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Salvar configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncSettingsPanel;
