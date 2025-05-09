
// We'll standardize on using the Sonner toast instead
import { toast as sonnerToast } from "sonner";
import { useToast } from "@/hooks/use-toast";

// Re-export the original useToast hook for backward compatibility
export { useToast };

// Export a modified toast function that uses Sonner under the hood
export const toast = (props: any) => {
  // Map the props from our custom toast to Sonner's toast format
  const { title, description, variant, ...rest } = props;
  
  if (variant === "destructive") {
    return sonnerToast.error(title, { description });
  }
  
  return sonnerToast(title, { description });
};
