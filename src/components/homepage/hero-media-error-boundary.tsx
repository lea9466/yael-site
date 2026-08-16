"use client";

import { Component, type ReactNode } from "react";

type HeroMediaErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type HeroMediaErrorBoundaryState = {
  hasError: boolean;
};

export class HeroMediaErrorBoundary extends Component<
  HeroMediaErrorBoundaryProps,
  HeroMediaErrorBoundaryState
> {
  state: HeroMediaErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): HeroMediaErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Hero media failed to render", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
