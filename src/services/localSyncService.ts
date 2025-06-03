import { supabase } from '@/integrations/supabase/client';
import { DadosVendedor, MobileOrderData, SyncLog, LocalServerStatus, SalesRepSyncStatus } from '@/types/localSync';
import { Product, Customer, DeliveryRoute, PaymentTable, SalesRep, PaymentTableInstallment, PaymentTableTerm } from '@/types';
import { NetworkUtils } from '@/utils/networkUtils';

export class LocalSyncService {
  private static instance: LocalSyncService;
  private serverStatus: LocalServerStatus;
  private syncLogs: SyncLog[] = [];

  private constructor() {
    this.serverStatus = {
      isRunning: false,
      port: 3000,
      localIP: '192.168.1.100',
      connectedDevices: 0,
      totalRequests: 0,
      lastActivity: null
    };
  }

  static getInstance(): LocalSyncService {
    if (!LocalSyncService.instance) {
      LocalSyncService.instance = new LocalSyncService();
    }
    return LocalSyncService.instance;
  }

  async initializeServer(): Promise<void> {
    try {
      console.log('🚀 [LocalSyncService] Inicializando servidor local...');
      
      // Detectar IP local
      this.serverStatus.localIP = await NetworkUtils.getLocalIP();
      this.serverStatus.isRunning = true;
      this.serverStatus.lastActivity = new Date();
      
      console.log(`✅ [LocalSyncService] Servidor iniciado em ${this.serverStatus.localIP}:${this.serverStatus.port}`);
      
      this.addSyncLog({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        salesRepCode: 0,
        action: 'download_data',
        status: 'success',
        details: 'Servidor local iniciado com sucesso',
        ip: this.serverStatus.localIP
      });
    } catch (error) {
      console.error('❌ [LocalSyncService] Erro ao inicializar servidor:', error);
      this.serverStatus.isRunning = false;
      throw error;
    }
  }

  async validateSalesRep(codigo: number): Promise<SalesRep | null> {
    try {
      console.log(`🔍 [LocalSyncService] Validando vendedor código: ${codigo}`);
      
      const { data, error } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('code', codigo)
        .eq('active', true)
        .single();

      if (error || !data) {
        console.log(`❌ [LocalSyncService] Vendedor ${codigo} não encontrado`);
        return null;
      }

      // Transform database data to SalesRep type
      const salesRep: SalesRep = {
        id: data.id,
        code: data.code,
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        active: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      console.log(`✅ [LocalSyncService] Vendedor ${salesRep.name} validado com sucesso`);
      return salesRep;
    } catch (error) {
      console.error('❌ [LocalSyncService] Erro ao validar vendedor:', error);
      return null;
    }
  }

  async generateSalesRepData(codigo: number): Promise<DadosVendedor | null> {
    try {
      console.log(`📦 [LocalSyncService] Gerando pacote de dados para vendedor ${codigo}...`);
      
      // Validar vendedor
      const vendedor = await this.validateSalesRep(codigo);
      if (!vendedor) {
        throw new Error(`Vendedor com código ${codigo} não encontrado`);
      }

      // Buscar produtos
      const { data: produtos, error: produtosError } = await supabase
        .from('products')
        .select(`
          *,
          main_unit:units!products_main_unit_id_fkey(code, description),
          sub_unit:units!products_sub_unit_id_fkey(code, description)
        `)
        .eq('active', true)
        .order('code');

      if (produtosError) {
        console.error('Erro ao buscar produtos:', produtosError);
        throw produtosError;
      }

      // Buscar clientes do vendedor
      const { data: clientes, error: clientesError } = await supabase
        .from('customers')
        .select(`
          *,
          sales_reps!sales_rep_id (
            id,
            name
          )
        `)
        .eq('sales_rep_id', vendedor.id)
        .eq('active', true)
        .order('name');

      if (clientesError) {
        console.error('Erro ao buscar clientes:', clientesError);
        throw clientesError;
      }

      // Buscar rotas do vendedor
      const { data: rotas, error: rotasError } = await supabase
        .from('delivery_routes')
        .select('*')
        .eq('sales_rep_id', vendedor.id)
        .eq('active', true)
        .order('name');

      if (rotasError) {
        console.error('Erro ao buscar rotas:', rotasError);
        throw rotasError;
      }

      // Buscar tabelas de preço ativas
      const { data: tabelasPreco, error: tabelasError } = await supabase
        .from('payment_tables')
        .select('*')
        .eq('active', true)
        .order('name');

      if (tabelasError) {
        console.error('Erro ao buscar tabelas de preço:', tabelasError);
        throw tabelasError;
      }

      // Buscar configurações da empresa
      const { data: configuracoes, error: configError } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single();

      if (configError) {
        console.error('Erro ao buscar configurações:', configError);
      }

      // Transformar produtos
      const produtosTransformados = (produtos || []).map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        description: '',
        cost: item.cost_price || 0,
        price: item.sale_price || 0,
        stock: item.stock || 0,
        minStock: 0,
        maxDiscountPercent: item.max_discount_percent || 0,
        maxPrice: undefined,
        unit: item.main_unit?.code || 'UN',
        subunit: item.sub_unit?.code || undefined,
        hasSubunit: !!item.sub_unit_id,
        subunitRatio: 1,
        categoryId: item.category_id,
        groupId: item.group_id,
        brandId: item.brand_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        syncStatus: 'synced' as 'synced' | 'pending' | 'error'
      })) as Product[];

      // Transformar clientes
      const clientesTransformados = (clientes || []).map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        companyName: item.company_name || '',
        phone: item.phone || '',
        email: item.email || '',
        address: item.address || '',
        city: item.city || '',
        state: item.state || '',
        zip: item.zip_code || '',
        document: item.document || '',
        notes: item.notes || '',
        visitDays: item.visit_days || [],
        visitFrequency: item.visit_frequency || '',
        visitSequence: item.visit_sequence || 0,
        salesRepId: item.sales_rep_id,
        salesRepName: item.sales_reps?.name,
        deliveryRouteId: item.delivery_route_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      })) as Customer[];

      // Transformar rotas
      const rotasTransformadas = (rotas || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        salesRepId: item.sales_rep_id,
        salesRepName: item.sales_rep_name || '',
        driverId: item.driver_id || '',
        driverName: item.driver_name || '',
        vehicleId: item.vehicle_id || '',
        vehicleName: item.vehicle_name || '',
        active: item.active,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.last_updated)
      })) as DeliveryRoute[];

      // Transformar tabelas de preço com correção de tipos
      const tabelasTransformadas = (tabelasPreco || []).map(item => {
        // Converter installments de Json para PaymentTableInstallment[]
        let installments: PaymentTableInstallment[] = [];
        if (item.installments && Array.isArray(item.installments)) {
          installments = item.installments.map((inst: any) => ({
            installment: inst.installment || 1,
            percentage: inst.percentage || 100,
            days: inst.days || 0,
            id: inst.id,
            description: inst.description
          }));
        }

        // Converter terms de Json para PaymentTableTerm[]
        let terms: PaymentTableTerm[] = [];
        if (item.terms && Array.isArray(item.terms)) {
          terms = item.terms.map((term: any) => ({
            id: term.id || crypto.randomUUID(),
            days: term.days || 0,
            percentage: term.percentage || 0,
            description: term.description || '',
            installment: term.installment || 1
          }));
        }

        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          type: item.type,
          terms: terms,
          installments: installments,
          notes: item.notes || '',
          payableTo: item.payable_to || '',
          paymentLocation: item.payment_location || '',
          active: item.active,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at)
        };
      }) as PaymentTable[];

      const dadosVendedor: DadosVendedor = {
        vendedor: {
          id: vendedor.id,
          codigo: vendedor.code,
          nome: vendedor.name,
          email: vendedor.email || '',
          senha: vendedor.password || ''
        },
        produtos: produtosTransformados,
        clientes: clientesTransformados,
        rotas: rotasTransformadas,
        tabelasPreco: tabelasTransformadas,
        configuracoes: configuracoes || {} as any,
        timestamp: new Date().toISOString(),
        versao: '1.0.0'
      };

      console.log(`✅ [LocalSyncService] Pacote gerado: ${produtosTransformados.length} produtos, ${clientesTransformados.length} clientes`);

      this.addSyncLog({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        salesRepCode: codigo,
        action: 'download_data',
        status: 'success',
        details: `Dados gerados: ${produtosTransformados.length} produtos, ${clientesTransformados.length} clientes`,
        dataSize: JSON.stringify(dadosVendedor).length
      });

      this.serverStatus.totalRequests++;
      this.serverStatus.lastActivity = new Date();

      return dadosVendedor;
    } catch (error) {
      console.error('❌ [LocalSyncService] Erro ao gerar dados do vendedor:', error);
      
      this.addSyncLog({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        salesRepCode: codigo,
        action: 'download_data',
        status: 'error',
        details: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });

      return null;
    }
  }

  async processMobileOrders(codigo: number, orders: MobileOrderData[]): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      console.log(`📥 [LocalSyncService] Processando ${orders.length} pedidos do vendedor ${codigo}...`);

      for (const order of orders) {
        try {
          // Inserir pedido na tabela orders_mobile
          const { error: orderError } = await supabase
            .from('orders_mobile')
            .insert({
              code: order.codigo,
              customer_id: order.cliente_id,
              customer_name: order.cliente_nome,
              sales_rep_id: order.vendedor_id,
              sales_rep_name: order.vendedor_nome,
              date: order.data,
              total: order.total,
              status: 'pending',
              payment_status: 'pending',
              source_project: 'mobile',
              imported: false
            });

          if (orderError) {
            console.error('Erro ao inserir pedido:', orderError);
            errors.push(`Pedido ${order.codigo}: ${orderError.message}`);
            failed++;
            continue;
          }

          success++;
        } catch (error) {
          console.error('Erro ao processar pedido:', error);
          errors.push(`Pedido ${order.codigo}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          failed++;
        }
      }

      this.addSyncLog({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        salesRepCode: codigo,
        action: 'upload_orders',
        status: failed > 0 ? 'error' : 'success',
        details: `Processados: ${success} sucesso, ${failed} falhas`,
        dataSize: JSON.stringify(orders).length
      });

      console.log(`✅ [LocalSyncService] Pedidos processados: ${success} sucesso, ${failed} falhas`);

    } catch (error) {
      console.error('❌ [LocalSyncService] Erro ao processar pedidos:', error);
      errors.push(`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    return { success, failed, errors };
  }

  async getSalesRepSyncStatus(): Promise<SalesRepSyncStatus[]> {
    try {
      console.log('📊 [LocalSyncService] Buscando status de sincronização dos vendedores...');

      const { data: salesReps, error } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar vendedores:', error);
        return [];
      }

      const statusList: SalesRepSyncStatus[] = [];

      for (const rep of salesReps) {
        // Buscar pedidos pendentes
        const { data: pendingOrders, error: ordersError } = await supabase
          .from('orders_mobile')
          .select('id')
          .eq('sales_rep_id', rep.id)
          .eq('imported', false);

        if (ordersError) {
          console.error('Erro ao buscar pedidos pendentes:', ordersError);
        }

        // Buscar último log de sync
        const lastSyncLog = this.syncLogs
          .filter(log => log.salesRepCode === rep.code)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

        statusList.push({
          salesRepId: rep.id,
          salesRepCode: rep.code,
          salesRepName: rep.name,
          lastSync: lastSyncLog?.timestamp || null,
          isConnected: false, // TODO: implementar detecção de conexão em tempo real
          pendingOrders: pendingOrders?.length || 0,
          totalDataSize: 0, // TODO: calcular tamanho dos dados
          syncVersion: '1.0.0'
        });
      }

      return statusList;
    } catch (error) {
      console.error('❌ [LocalSyncService] Erro ao buscar status de sincronização:', error);
      return [];
    }
  }

  getServerStatus(): LocalServerStatus {
    return { ...this.serverStatus };
  }

  getSyncLogs(): SyncLog[] {
    return [...this.syncLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private addSyncLog(log: SyncLog): void {
    this.syncLogs.push(log);
    
    // Manter apenas os últimos 100 logs
    if (this.syncLogs.length > 100) {
      this.syncLogs = this.syncLogs.slice(-100);
    }
  }

  clearSyncLogs(): void {
    this.syncLogs = [];
  }
}

export const localSyncService = LocalSyncService.getInstance();
