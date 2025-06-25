import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '@/app/components/ThemeProvider';
import { DarkModeToggle } from '@/app/components/DarkModeToggle';

// 测试组件
function TestComponent() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <DarkModeToggle variant="button" />
    </div>
  );
}

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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('深色模式功能', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.className = '';
  });

  test('ThemeProvider 正确初始化', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
  });

  test('从 localStorage 加载保存的主题', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  test('深色模式切换按钮工作正常', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    
    // 初始状态应该是浅色模式
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');

    // 点击切换到深色模式
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });

    // 验证 localStorage 被调用
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  test('主题变化时正确应用 CSS 类', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');

    // 切换到深色模式
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });

    // 切换回浅色模式
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark');
    });
  });

  test('下拉菜单模式正确显示选项', () => {
    render(
      <ThemeProvider>
        <DarkModeToggle variant="dropdown" />
      </ThemeProvider>
    );

    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);

    expect(screen.getByText('浅色模式')).toBeInTheDocument();
    expect(screen.getByText('深色模式')).toBeInTheDocument();
    expect(screen.getByText('跟随系统')).toBeInTheDocument();
  });

  test('系统主题检测工作正常', () => {
    // Mock 系统深色模式
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
  });

  test('主题变化事件正确触发', async () => {
    const mockEventListener = vi.fn();
    window.addEventListener('themeChanged', mockEventListener);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(mockEventListener).toHaveBeenCalled();
    });

    window.removeEventListener('themeChanged', mockEventListener);
  });

  test('无效的 localStorage 值被正确处理', () => {
    localStorageMock.getItem.mockReturnValue('invalid-theme');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // 应该回退到默认主题
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
  });

  test('localStorage 错误被正确处理', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load theme from localStorage:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
