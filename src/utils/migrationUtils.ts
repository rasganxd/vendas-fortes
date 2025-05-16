
import { toast } from '@/components/ui/use-toast';

/**
 * This file is now simplified since we're using Firebase directly and not migrating data
 */

export const migrateOrdersToFirebase = async (): Promise<number> => {
  // Since we're not migrating data anymore, this just returns 0
  return 0;
};

export const migrateAllDataToFirebase = async (): Promise<void> => {
  toast({
    title: "Firebase Integração",
    description: "O aplicativo agora está usando o Firebase diretamente. Não é necessária migração."
  });
};
