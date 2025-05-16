
// We're standardizing on using the Sonner toast instead
import { toast as sonnerToast } from "sonner";
import { useToast, toast, ToastProps } from "@/hooks/use-toast";

// Re-export the original useToast hook for backward compatibility
export { useToast, toast, type ToastProps };
