import type { ReactNode } from 'react';
import { Component } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string; stack?: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return { hasError: true, message: msg, stack };
  }

  componentDidCatch(error: unknown) {
    // Keep console signal for debugging white-screen issues
    // eslint-disable-next-line no-console
    console.error('App crashed:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            The app hit an unexpected error. Please reload.
          </p>
          {this.state.message ? (
            <pre className="mt-4 text-xs whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-200">
              {this.state.message}
              {this.state.stack ? `\n\n${this.state.stack}` : ''}
            </pre>
          ) : null}
        </div>
      </div>
    );
  }
}

