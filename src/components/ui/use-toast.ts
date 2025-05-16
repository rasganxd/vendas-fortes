
// We're standardizing on using the Sonner toast instead
import { toast as sonnerToast } from "sonner";
import { useToast } from "@/hooks/use-toast";

// Re-export the original useToast hook for backward compatibility
export { useToast };

// Re-export toast directly from hooks/use-toast
export { toast } from "@/hooks/use-toast";
