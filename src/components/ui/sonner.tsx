import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { useAppSettings } from '@/hooks/useAppSettings';

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const { settings } = useAppSettings();
  
  // Get theme colors from app settings
  const primaryColor = settings?.theme?.primaryColor || '#1C64F2';
  const secondaryColor = settings?.theme?.secondaryColor || '#047481';
  
  // Create custom styles based on theme colors
  const customStyles = {
    success: {
      background: `linear-gradient(to right, ${secondaryColor}10, transparent)`,
      iconColor: secondaryColor
    },
    error: {
      // Keep error as red for clarity
      background: 'linear-gradient(to right, #E0242410, transparent)',
      iconColor: '#E02424'
    },
    warning: {
      // Keep warning as amber for clarity
      background: 'linear-gradient(to right, #F59E0B10, transparent)',
      iconColor: '#F59E0B'
    },
    info: {
      background: `linear-gradient(to right, ${primaryColor}10, transparent)`,
      iconColor: primaryColor
    }
  };

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: `${customStyles.success.background}`,
          error: `${customStyles.error.background}`,
          warning: `${customStyles.warning.background}`,
          info: `${customStyles.info.background}`,
        },
      }}
      position="top-right"
      expand={false}
      closeButton={true}
      richColors
      {...props}
    />
  )
}

export { Toaster }
