
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function OrderFormSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in">
      <Card className="shadow-sm border-gray-200">
        <CardContent className="pt-3 pb-3">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            
            {/* Form fields */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-24" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Product addition section */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="pt-3 pb-3">
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Items section */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="pt-3 pb-3">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function OrderLoadingSkeleton() {
  return (
    <div className="flex justify-center items-center h-64 animate-fade-in">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
}
