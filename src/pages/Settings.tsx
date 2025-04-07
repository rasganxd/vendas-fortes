import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useBackups } from '@/hooks/useBackups';
import { toast } from '@/components/ui/use-toast';
import PageLayout from '@/components/layout/PageLayout';

export default function Settings() {
  const { backups, createBackup } = useBackups();
  
  // Configurações de backup
  const [autoBackupDaily, setAutoBackupDaily] = useState(false);
  const [autoBackupMonthly, setAutoBackupMonthly] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDesc, setBackupDesc] = useState('');

  // Efeito para verificar configurações salvas
  useEffect(() => {
    const savedAutoBackupDaily = localStorage.getItem('autoBackupDaily');
    const savedAutoBackupMonthly = localStorage.getItem('autoBackupMonthly');
    
    if (savedAutoBackupDaily) {
      setAutoBackupDaily(savedAutoBackupDaily === 'true');
    }
    
    if (savedAutoBackupMonthly) {
      setAutoBackupMonthly(savedAutoBackupMonthly === 'true');
    }
  }, []);

  // Salvar configurações
  const saveBackupSettings = () => {
    localStorage.setItem('autoBackupDaily', String(autoBackupDaily));
    localStorage.setItem('autoBackupMonthly', String(autoBackupMonthly));
    
    toast({
      title: "Configurações salvas",
      description: "As configurações de backup foram salvas com sucesso.",
    });
  };

  // Criar backup manualmente
  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe um nome para o backup.",
        variant: "destructive"
      });
      return;
    }
    
    createBackup(backupName, backupDesc);
    setBackupName('');
    setBackupDesc('');
    
    toast({
      title: "Backup criado",
      description: "Backup manual criado com sucesso.",
    });
  };
  
  // Iniciar novo dia
  const startNewDay = () => {
    // Cria backup antes de iniciar novo dia
    const date = new Date();
    const backupName = `Diário - ${date.toLocaleDateString('pt-BR')}`;
    createBackup(backupName, "Backup automático criado ao iniciar um novo dia");
    
    // Implementação em AppContext
    
    toast({
      title: "Novo dia iniciado",
      description: "O sistema está pronto para um novo dia de operações.",
    });
  };
  
  // Iniciar novo mês
  const startNewMonth = () => {
    // Cria backup antes de iniciar novo mês
    const date = new Date();
    const backupName = `Mensal - ${date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
    createBackup(backupName, "Backup automático criado ao iniciar um novo mês");
    
    // Implementação em AppContext
    
    toast({
      title: "Novo mês iniciado",
      description: "O sistema está pronto para um novo mês de operações.",
    });
  };

  return (
    <PageLayout 
      title="Configurações do Sistema"
      subtitle="Gerencie as configurações do sistema"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Backup automático */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Backup Automático</CardTitle>
            <CardDescription>Configure os backups automáticos do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Backup Diário</p>
                <p className="text-sm text-muted-foreground">
                  Cria um backup automático todos os dias
                </p>
              </div>
              <Switch 
                checked={autoBackupDaily}
                onCheckedChange={setAutoBackupDaily}
              />
            </div>
            
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Backup Mensal</p>
                <p className="text-sm text-muted-foreground">
                  Cria um backup automático no início de cada mês
                </p>
              </div>
              <Switch 
                checked={autoBackupMonthly}
                onCheckedChange={setAutoBackupMonthly}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveBackupSettings}>Salvar configurações</Button>
          </CardFooter>
        </Card>
        
        {/* Backup manual */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Backup Manual</CardTitle>
            <CardDescription>Crie backups manualmente quando precisar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="backupName">Nome do Backup</Label>
              <Input 
                id="backupName" 
                placeholder="Ex: Antes da atualização v2.0"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="backupDesc">Descrição (opcional)</Label>
              <Input 
                id="backupDesc" 
                placeholder="Descrição para ajudar a identificar este backup"
                value={backupDesc}
                onChange={(e) => setBackupDesc(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateBackup}>Criar backup agora</Button>
          </CardFooter>
        </Card>
        
        {/* Manutenção */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Manutenção do Sistema</CardTitle>
            <CardDescription>Gerencie ciclos de operação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Iniciar novo dia</p>
                <p className="text-sm text-muted-foreground">
                  Arquiva pedidos pendentes e prepara para um novo dia
                </p>
              </div>
              <Button variant="outline" onClick={startNewDay}>Iniciar</Button>
            </div>
            
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Iniciar novo mês</p>
                <p className="text-sm text-muted-foreground">
                  Arquiva dados do mês e prepara para um novo ciclo
                </p>
              </div>
              <Button variant="outline" onClick={startNewMonth}>Iniciar</Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Gerenciamento Avançado</p>
                <p className="text-sm text-muted-foreground">
                  Restaure backups e gerencie dados do sistema
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href="/manutencao">Acessar</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
