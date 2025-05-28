import { useToast } from "@/components/ui/use-toast";
import { customerService } from "@/services";
import { productService } from "@/services";
import { productBrandService } from "@/services";
import { productCategoryService } from "@/services";
import { productGroupService } from "@/services";
import { salesRepService } from "@/services";
import { deliveryRouteService } from "@/services";
import { loadService } from "@/services";
import { orderService } from "@/services";
import { orderItemService } from "@/services";
import { paymentService } from "@/services";
import { paymentMethodService } from "@/services";
import { paymentTableService } from "@/services";
import { vehicleService } from "@/services";
import { apiTokenService } from "@/services";
import { mobileOrderImportService } from "@/services";
import { mobileOrderService } from "@/services";
import { productUnitsService } from "@/services";
import { syncUpdateService } from '@/services/supabase/syncUpdateService';

export const useSystemOperations = () => {
  const { toast } = useToast();

  const resetDatabase = async () => {
    try {
      // Confirm with the user before proceeding
      const confirmReset = window.confirm(
        "Tem certeza de que deseja resetar o banco de dados? Esta ação é irreversível e apagará todos os dados."
      );

      if (!confirmReset) {
        toast({
          title: "Operação cancelada",
          description: "O reset do banco de dados foi cancelado.",
        });
        return;
      }

      // Call each service's reset function
      await customerService.resetDatabase();
      await productService.resetDatabase();
      await productBrandService.resetDatabase();
      await productCategoryService.resetDatabase();
      await productGroupService.resetDatabase();
      await salesRepService.resetDatabase();
      await deliveryRouteService.resetDatabase();
      await loadService.resetDatabase();
      await orderService.resetDatabase();
      await orderItemService.resetDatabase();
      await paymentService.resetDatabase();
      await paymentMethodService.resetDatabase();
      await paymentTableService.resetDatabase();
      await vehicleService.resetDatabase();
      await apiTokenService.resetDatabase();
      await mobileOrderImportService.resetDatabase();
      await mobileOrderService.resetDatabase();
      await productUnitsService.resetDatabase();

      toast({
        title: "Banco de dados resetado",
        description: "O banco de dados foi resetado com sucesso.",
      });
    } catch (error: any) {
      console.error("Error resetting database:", error);
      toast({
        title: "Erro ao resetar banco de dados",
        description:
          error.message || "Ocorreu um erro ao resetar o banco de dados.",
        variant: "destructive",
      });
    }
  };

  return {
    resetDatabase,
  };
};

export const triggerMobileSync = async (dataTypes: string[], description?: string): Promise<boolean> => {
  try {
    console.log('🔄 Triggering mobile sync for data types:', dataTypes);
    
    // Criar atualização para mobile
    const result = await syncUpdateService.createSyncUpdate(
      dataTypes,
      description || `Atualização de ${dataTypes.join(', ')} para mobile`,
      'desktop'
    );
    
    if (result.success) {
      console.log('✅ Mobile sync triggered successfully:', result.updateId);
      
      // Disparar evento para notificar outros componentes
      window.dispatchEvent(new CustomEvent('mobileSyncTriggered', {
        detail: { 
          updateId: result.updateId,
          dataTypes,
          description
        }
      }));
      
      return true;
    } else {
      console.error('❌ Failed to trigger mobile sync:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error triggering mobile sync:', error);
    return false;
  }
};

// Função para ser chamada quando dados são modificados
export const notifyDataChange = async (dataType: string, operation: 'create' | 'update' | 'delete'): Promise<void> => {
  try {
    console.log(`📢 Data change notification: ${dataType} ${operation}`);
    
    // Trigger sync para mobile quando dados importantes mudam
    if (['products', 'customers', 'payment_tables', 'product_categories', 'product_groups', 'product_brands'].includes(dataType)) {
      await triggerMobileSync([dataType], `${dataType} ${operation}d from desktop`);
    }
  } catch (error) {
    console.error('❌ Error notifying data change:', error);
  }
};
