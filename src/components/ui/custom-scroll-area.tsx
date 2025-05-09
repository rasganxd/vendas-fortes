
import React from "react";
import { ScrollArea as ShadcnScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CustomScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ShadcnScrollArea> {
  hideScrollbar?: boolean;
}

export const CustomScrollArea = React.forwardRef<
  React.ElementRef<typeof ShadcnScrollArea>,
  CustomScrollAreaProps
>(({ className, hideScrollbar = false, children, ...props }, ref) => {
  return (
    <ShadcnScrollArea ref={ref} className={cn(className)} {...props}>
      {children}
      {!hideScrollbar && <ScrollBar />}
    </ShadcnScrollArea>
  );
});

CustomScrollArea.displayName = "CustomScrollArea";
