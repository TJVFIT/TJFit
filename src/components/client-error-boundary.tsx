"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Shown when a child throws during render (production-safe fallback). */
  fallback: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = { error: Error | null };

/**
 * Catches render errors in client subtrees so one bad section cannot blank the whole app.
 */
export class ClientErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    if (process.env.NODE_ENV === "development") {
      console.error("[ClientErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}
