"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

export interface LoadingShellProps {
  className?: string;
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "shimmer" | "progress";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} as const;

export function LoadingShell({
  className,
  message = "Loading...",
  size = "md",
  variant = "spinner",
}: LoadingShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12",
        className,
      )}
      role="status"
      aria-label={message}
    >
      {variant === "spinner" && (
        <Loader2 className={cn("animate-spin text-muted-foreground", sizeMap[size])} />
      )}
      {variant === "shimmer" && (
        <div className="flex flex-col items-center gap-3 w-full max-w-md">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      )}
      {variant === "progress" && (
        <div className="w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <div
            className="h-2 animate-progress rounded-full bg-primary"
            style={{ width: "66%" }}
          />
        </div>
      )}
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}

export interface ErrorShellProps {
  className?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorShell({
  className,
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
}: ErrorShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <div className="rounded-full bg-destructive/10 p-3">
        <svg
          className="h-6 w-6 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {message && (
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export interface EmptyShellProps {
  className?: string;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyShell({
  className,
  title = "Nothing here",
  message,
  icon,
}: EmptyShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className,
      )}
    >
      {icon ?? (
        <svg
          className="h-12 w-12 text-muted-foreground/40"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
          />
        </svg>
      )}
      <h3 className="text-lg font-semibold tracking-tight text-muted-foreground">
        {title}
      </h3>
      {message && (
        <p className="text-sm text-muted-foreground/70 max-w-md">{message}</p>
      )}
    </div>
  );
}

export interface ShellWrapperProps {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  error?: { title?: string; message?: string };
  empty?: { title?: string; message?: string };
  onRetry?: () => void;
  loadingMessage?: string;
  className?: string;
  children: React.ReactNode;
}

export function ShellWrapper({
  isLoading,
  isError,
  isEmpty,
  error,
  empty,
  onRetry,
  loadingMessage,
  className,
  children,
}: ShellWrapperProps) {
  if (isLoading) {
    return <LoadingShell className={className} message={loadingMessage} />;
  }

  if (isError) {
    return (
      <ErrorShell
        className={className}
        title={error?.title}
        message={error?.message}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyShell
        className={className}
        title={empty?.title}
        message={empty?.message}
      />
    );
  }

  return <>{children}</>;
}
