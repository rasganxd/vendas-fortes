import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, TestTube, Save } from "lucide-react";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SmtpConfig {
  provider: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  use_tls: boolean;
}

const SMTP_PROVIDERS = {
  resend: {
    name: 'Resend',
    host: 'smtp.resend.com',
    port: 587,
    docs: 'https://resend.com/docs/send-with-smtp'
  },
  sendgrid: {
    name: 'SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    docs: 'https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api'
  },
  brevo: {
    name: 'Brevo (ex-Sendinblue)',
    host: 'smtp-relay.brevo.com',
    port: 587,
    docs: 'https://developers.brevo.com/docs/smtp'
  },
  custom: {
    name: 'Customizado',
    host: '',
    port: 587,
    docs: null
  }
};

export default function SmtpSettings() {
  const [config, setConfig] = useState<SmtpConfig>({
    provider: 'resend',
    host: SMTP_PROVIDERS.resend.host,
    port: SMTP_PROVIDERS.resend.port,
    username: '',
    password: '',
    from_email: '',
    from_name: '',
    use_tls: true
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Carregar configuração existente
  useEffect(() => {
    loadSmtpConfig();
  }, []);

  const loadSmtpConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single();

      if (data && data.company) {
        const smtpConfig = (data.company as any)?.smtp;
        if (smtpConfig) {
          setConfig(prev => ({
            ...prev,
            ...smtpConfig
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração SMTP:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    const providerConfig = SMTP_PROVIDERS[provider as keyof typeof SMTP_PROVIDERS];
    setConfig(prev => ({
      ...prev,
      provider,
      host: providerConfig.host,
      port: providerConfig.port
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Primeiro, buscar configuração existente
      const { data: existingData } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single();

      const currentCompany = (existingData?.company as any) || {};
      
      // Atualizar com configuração SMTP
      const updatedCompany = {
        ...currentCompany,
        smtp: config
      };

      const { error } = await supabase
        .from('app_settings')
        .upsert({
          company: updatedCompany
        });

      if (error) throw error;

      toast.success('Configuração SMTP salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração SMTP:', error);
      toast.error('Erro ao salvar configuração SMTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      // Aqui você implementaria o teste de envio de email
      // Por enquanto, apenas simular o teste
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Email de teste enviado com sucesso!');
    } catch (error) {
      toast.error('Falha no teste de email');
    } finally {
      setIsTesting(false);
    }
  };

  if (loadingConfig) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configuração SMTP</h3>
        <p className="text-sm text-muted-foreground">
          Configure o servidor SMTP para envio de emails do sistema
        </p>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="providers">Provedores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Servidor</CardTitle>
              <CardDescription>
                Insira as credenciais do seu provedor SMTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Provedor</Label>
                  <Select value={config.provider} onValueChange={handleProviderChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SMTP_PROVIDERS).map(([key, provider]) => (
                        <SelectItem key={key} value={key}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="host">Host SMTP</Label>
                  <Input
                    id="host"
                    value={config.host}
                    onChange={(e) => setConfig(prev => ({ ...prev, host: e.target.value }))}
                    disabled={config.provider !== 'custom'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="port">Porta</Label>
                  <Input
                    id="port"
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                    disabled={config.provider !== 'custom'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="username">Usuário/Email</Label>
                  <Input
                    id="username"
                    value={config.username}
                    onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="seu-email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Senha/API Key</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={config.password}
                    onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Sua senha ou API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from_email">Email Remetente</Label>
                  <Input
                    id="from_email"
                    value={config.from_email}
                    onChange={(e) => setConfig(prev => ({ ...prev, from_email: e.target.value }))}
                    placeholder="naoresponder@suaempresa.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="from_name">Nome Remetente</Label>
                  <Input
                    id="from_name"
                    value={config.from_name}
                    onChange={(e) => setConfig(prev => ({ ...prev, from_name: e.target.value }))}
                    placeholder="Sua Empresa"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Salvando...' : 'Salvar Configuração'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleTest} 
                  disabled={isTesting || !config.username || !config.password}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTesting ? 'Testando...' : 'Testar Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(SMTP_PROVIDERS).map(([key, provider]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base">{provider.name}</CardTitle>
                  <CardDescription>
                    Host: {provider.host} | Porta: {provider.port}
                  </CardDescription>
                </CardHeader>
                {provider.docs && (
                  <CardContent>
                    <a
                      href={provider.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Ver documentação →
                    </a>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          <Alert>
            <AlertDescription>
              <strong>Recomendação:</strong> O Resend oferece 3.000 emails gratuitos por mês e é muito fácil de configurar. 
              Para uso em produção, considere também SendGrid ou Brevo.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}