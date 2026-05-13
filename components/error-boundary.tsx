"use client";

import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive">
          <p className="font-medium">Something went wrong.</p>
          <p className="text-sm opacity-80">This component could not be rendered.</p>
          {this.state.error && (
            <pre className="mt-2 text-[10px] bg-black/10 p-2 rounded overflow-auto max-h-32 font-mono">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
