
import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const EnhancedTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { 
    maxHeight?: string
    isLoading?: boolean
  }
>(({ className, maxHeight = "600px", isLoading, children, ...props }, ref) => (
  <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-soft">
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Carregando...</span>
        </div>
      </div>
    )}
    <div className={cn("overflow-auto", `max-h-[${maxHeight}]`)}>
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  </div>
))
EnhancedTable.displayName = "EnhancedTable"

const EnhancedTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "bg-gradient-to-r from-gray-50 to-blue-50/30 border-b-2 border-blue-100 sticky top-0 z-10",
      className
    )} 
    {...props} 
  />
))
EnhancedTableHeader.displayName = "EnhancedTableHeader"

const EnhancedTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:nth-child(even)]:bg-blue-50/20 [&_tr:hover]:bg-blue-50/40 [&_tr]:transition-colors [&_tr]:duration-200",
      className
    )}
    {...props}
  />
))
EnhancedTableBody.displayName = "EnhancedTableBody"

const EnhancedTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-gray-100 transition-all duration-200 hover:shadow-sm",
      className
    )}
    {...props}
  />
))
EnhancedTableRow.displayName = "EnhancedTableRow"

const EnhancedTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-6 text-left align-middle font-semibold text-gray-700 text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
EnhancedTableHead.displayName = "EnhancedTableHead"

const EnhancedTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-6 py-4 align-middle text-gray-600 [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
EnhancedTableCell.displayName = "EnhancedTableCell"

export {
  EnhancedTable,
  EnhancedTableHeader,
  EnhancedTableBody,
  EnhancedTableRow,
  EnhancedTableHead,
  EnhancedTableCell,
}
