import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegionSelector } from '../RegionSelector';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.dispatchEvent
Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
});

describe('RegionSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default region', () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<RegionSelector />);
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<RegionSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });

  it('selects a region and saves to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<RegionSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const japanOption = screen.getByText('Japan');
    fireEvent.click(japanOption);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('selectedRegion', 'JP');
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'regionChanged',
        detail: expect.objectContaining({ code: 'JP', name: 'Japan' })
      })
    );
  });

  it('loads saved region from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('JP');
    render(<RegionSelector />);
    
    expect(screen.getByText('Japan')).toBeInTheDocument();
    expect(screen.getByText('🇯🇵')).toBeInTheDocument();
  });
});
