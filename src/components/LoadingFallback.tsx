import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  type?: 'page' | 'card' | 'image' | 'text' | 'custom';
  className?: string;
  children?: React.ReactNode;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  type = 'page', 
  className = '',
  children 
}) => {
  if (children) {
    return <div className={className}>{children}</div>;
  }

  switch (type) {
    case 'page':
      return (
        <div className={`min-h-screen bg-background flex items-center justify-center ${className}`}>
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      );

    case 'card':
      return (
        <Card className={`group relative border-0 shadow-glow ${className}`}>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'image':
      return (
        <div className={`bg-muted rounded-lg flex items-center justify-center ${className}`}>
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Chargement image...</p>
          </div>
        </div>
      );

    case 'text':
      return (
        <div className={`space-y-2 ${className}`}>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );

    default:
      return (
        <div className={`flex items-center justify-center p-8 ${className}`}>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      );
  }
};

export default LoadingFallback;