import React, { Suspense, lazy } from 'react';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyComponent: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 rounded h-32" /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyLoadedComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return React.memo(React.forwardRef<unknown, P>((props, ref) => (
    <LazyComponent fallback={fallback}>
      <LazyLoadedComponent {...props} ref={ref} />
    </LazyComponent>
  )));
};

export default LazyComponent;