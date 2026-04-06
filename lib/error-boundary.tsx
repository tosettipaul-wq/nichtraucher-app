'use client';

import React, { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">🚨 Etwas ist schief gelaufen</h1>
            <p className="text-slate-300 mb-4">
              Entschuldigung! Es gab einen unerwarteten Fehler. Versuche die Seite zu aktualisieren.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 mb-2">
                  Fehlerdetails (Entwickler)
                </summary>
                <pre className="bg-slate-950 p-3 rounded text-xs text-red-300 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.resetError}
              className="mt-6 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium transition"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
