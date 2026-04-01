"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";

type Props = {
  children: ReactNode;
  /** Shown when a child throws during render (production-safe fallback). */
  fallback: ReactNode;
  /** Optional Sentry tag to group errors (e.g. "messages", "profile-search"). */
  sentryScope?: string;
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
    try {
      Sentry.captureException(error, {
        tags: this.props.sentryScope ? { area: this.props.sentryScope } : undefined,
        extra: { componentStack: info.componentStack }
      });
    } catch {
      /* never let telemetry break the fallback UI */
    }
    if (process.env.NODE_ENV === "development") {
      console.error("[ClientErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}
