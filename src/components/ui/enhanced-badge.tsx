
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const enhancedBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 animate-scale-in",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
        secondary: "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200",
        destructive: "border-transparent bg-red-500 text-white hover:bg-red-600 shadow-sm",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600 shadow-sm",
        warning: "border-transparent bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
        info: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
        outline: "text-gray-600 border-gray-300 hover:bg-gray-50",
        gradient: "border-transparent bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-sm"
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-xs px-2 py-0.5",
        lg: "text-sm px-3 py-1"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
)

export interface EnhancedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedBadgeVariants> {}

function EnhancedBadge({ className, variant, size, ...props }: EnhancedBadgeProps) {
  return (
    <div className={cn(enhancedBadgeVariants({ variant, size }), className)} {...props} />
  )
}

export { EnhancedBadge, enhancedBadgeVariants }
