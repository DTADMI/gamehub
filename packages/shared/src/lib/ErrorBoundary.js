// libs/shared/src/lib/ErrorBoundary.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (this.props.fallback || (_jsxs("div", { className: "error-boundary", children: [_jsx("h2", { children: "Something went wrong" }), _jsx("p", { children: this.state.error?.message }), _jsx("button", { onClick: this.handleReset, children: "Try again" })] })));
        }
        return this.props.children;
    }
    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };
}
// Error handling utilities
export const withErrorBoundary = (Component, Fallback) => {
    return (props) => (_jsx(ErrorBoundary, { fallback: Fallback ? (_jsx(Fallback, { error: undefined, reset: () => window.location.reload() })) : undefined, children: _jsx(Component, { ...props }) }));
};
