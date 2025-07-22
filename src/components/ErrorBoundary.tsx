import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
            <div className="bg-muted p-4 rounded mb-4 overflow-auto max-h-[200px]">
              <pre className="text-sm">{this.state.error?.toString()}</pre>
            </div>
            <p className="mb-4">Please try refreshing the page or contact support if the problem persists.</p>
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;