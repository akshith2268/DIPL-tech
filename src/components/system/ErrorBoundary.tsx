import { Component, type ErrorInfo, type ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error("Application error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-state">
          <p className="eyebrow">Something shifted</p>
          <h1>We could not load this page.</h1>
          <p>Please refresh the page. If the problem continues, contact the Drith Infra team.</p>
          <button className="button button--primary" type="button" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

