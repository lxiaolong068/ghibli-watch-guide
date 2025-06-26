'use client';

import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorMessage({
  title = 'Error',
  message,
  type = 'error',
  dismissible = false,
  onDismiss,
  action,
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'text-yellow-500 hover:text-yellow-600',
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'text-blue-500 hover:text-blue-600',
        };
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'text-red-500 hover:text-red-600',
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`border rounded-md p-4 ${styles.container}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {title}
          </h3>
          <div className={`mt-2 text-sm ${styles.message}`}>
            <p>{message}</p>
          </div>
          {action && (
            <div className="mt-4">
              <button
                type="button"
                onClick={action.onClick}
                className={`text-sm font-medium ${styles.button} hover:underline`}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleDismiss}
                className={`inline-flex rounded-md p-1.5 ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                aria-label="Dismiss"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Predefined error message components
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
    />
  );
}

export function NotFoundError({ resource = 'Resource' }: { resource?: string }) {
  return (
    <ErrorMessage
      title="Not Found"
      message={`${resource} not found. It may have been removed or you may not have permission to access it.`}
      type="warning"
    />
  );
}

export function LoadingError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Loading Error"
      message="Failed to load data. Please try again."
      action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
    />
  );
}
