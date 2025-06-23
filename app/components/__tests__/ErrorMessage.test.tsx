import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorMessage, NetworkError, NotFoundError, LoadingError } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message with default props', () => {
    render(<ErrorMessage message="Test error message" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<ErrorMessage title="Custom Error" message="Test message" />);
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('renders warning type with correct styling', () => {
    render(<ErrorMessage message="Warning message" type="warning" />);

    const container = screen.getByText('Warning message').closest('.border');
    expect(container).toHaveClass('bg-yellow-50');
  });

  it('renders info type with correct styling', () => {
    render(<ErrorMessage message="Info message" type="info" />);

    const container = screen.getByText('Info message').closest('.border');
    expect(container).toHaveClass('bg-blue-50');
  });

  it('shows dismiss button when dismissible', () => {
    render(<ErrorMessage message="Test message" dismissible />);
    
    const dismissButton = screen.getByLabelText('Dismiss');
    expect(dismissButton).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage message="Test message" dismissible onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByLabelText('Dismiss');
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('hides component after dismiss', () => {
    render(<ErrorMessage message="Test message" dismissible />);
    
    const dismissButton = screen.getByLabelText('Dismiss');
    fireEvent.click(dismissButton);
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('shows action button when provided', () => {
    const action = { label: 'Retry', onClick: vi.fn() };
    render(<ErrorMessage message="Test message" action={action} />);
    
    const actionButton = screen.getByText('Retry');
    expect(actionButton).toBeInTheDocument();
  });

  it('calls action onClick when action button is clicked', () => {
    const action = { label: 'Retry', onClick: vi.fn() };
    render(<ErrorMessage message="Test message" action={action} />);
    
    const actionButton = screen.getByText('Retry');
    fireEvent.click(actionButton);
    
    expect(action.onClick).toHaveBeenCalledOnce();
  });
});

describe('NetworkError', () => {
  it('renders network error message', () => {
    render(<NetworkError />);
    
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<NetworkError onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('NotFoundError', () => {
  it('renders not found error with default resource', () => {
    render(<NotFoundError />);
    
    expect(screen.getByText('Not Found')).toBeInTheDocument();
    expect(screen.getByText(/Resource not found/)).toBeInTheDocument();
  });

  it('renders not found error with custom resource', () => {
    render(<NotFoundError resource="Movie" />);
    
    expect(screen.getByText(/Movie not found/)).toBeInTheDocument();
  });
});

describe('LoadingError', () => {
  it('renders loading error message', () => {
    render(<LoadingError />);
    
    expect(screen.getByText('Loading Error')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load data/)).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<LoadingError onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
