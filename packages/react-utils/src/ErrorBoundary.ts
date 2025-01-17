'use client'

import { Component, type JSX } from 'react'

export type ErrorBoundaryFallbackProps = {
  blockType?: string
  resetErrorBoundary?: () => void
}

export type ErrorBoundaryProps = {
  blockType: string
  children: React.ReactNode
  fallback?:
    | ((props: ErrorBoundaryFallbackProps) => JSX.Element | null)
    | JSX.Element
    | string
    | null
}

export type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can use your own error logging service here.
    console.error({ error, errorInfo })
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false })
  }

  render() {
    // Check if the error is thrown.
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          blockType: this.props.blockType,
          resetErrorBoundary: this.resetErrorBoundary,
        })
      }

      return this.props.fallback
    }

    // Return children components in case of no error
    return this.props.children
  }
}
