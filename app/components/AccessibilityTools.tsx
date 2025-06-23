'use client';

import { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

export function AccessibilityTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
  });

  // 从localStorage加载设置
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
        applySettings(parsedSettings);
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error);
      }
    }
  }, []);

  // 应用设置到DOM
  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // 高对比度
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 大字体
    if (newSettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // 减少动画
    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  };

  // 更新设置
  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    applySettings(newSettings);

    // 通知屏幕阅读器
    if (settings.screenReader) {
      const message = `${key} ${value ? 'enabled' : 'disabled'}`;
      announceToScreenReader(message);
    }
  };

  // 屏幕阅读器公告
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // 键盘导航支持
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* 无障碍工具按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        aria-label="Open accessibility tools"
        title="Accessibility Tools"
      >
        <AdjustmentsHorizontalIcon className="w-6 h-6" />
      </button>

      {/* 无障碍工具面板 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-title"
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {/* 标题 */}
              <div className="flex items-center justify-between mb-6">
                <h2 id="accessibility-title" className="text-xl font-semibold text-gray-900">
                  Accessibility Tools
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  aria-label="Close accessibility tools"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* 设置选项 */}
              <div className="space-y-4">
                {/* 高对比度 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EyeIcon className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <label htmlFor="high-contrast" className="text-sm font-medium text-gray-900">
                        High Contrast
                      </label>
                      <p className="text-xs text-gray-500">
                        Increase color contrast for better visibility
                      </p>
                    </div>
                  </div>
                  <button
                    id="high-contrast"
                    onClick={() => updateSetting('highContrast', !settings.highContrast)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      settings.highContrast ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={settings.highContrast}
                    aria-labelledby="high-contrast"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 大字体 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-5 h-5 text-gray-500 mr-3 text-lg font-bold">A</span>
                    <div>
                      <label htmlFor="large-text" className="text-sm font-medium text-gray-900">
                        Large Text
                      </label>
                      <p className="text-xs text-gray-500">
                        Increase text size for better readability
                      </p>
                    </div>
                  </div>
                  <button
                    id="large-text"
                    onClick={() => updateSetting('largeText', !settings.largeText)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      settings.largeText ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={settings.largeText}
                    aria-labelledby="large-text"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.largeText ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 减少动画 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EyeSlashIcon className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-900">
                        Reduce Motion
                      </label>
                      <p className="text-xs text-gray-500">
                        Minimize animations and transitions
                      </p>
                    </div>
                  </div>
                  <button
                    id="reduced-motion"
                    onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      settings.reducedMotion ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={settings.reducedMotion}
                    aria-labelledby="reduced-motion"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 屏幕阅读器支持 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {settings.screenReader ? (
                      <SpeakerWaveIcon className="w-5 h-5 text-gray-500 mr-3" />
                    ) : (
                      <SpeakerXMarkIcon className="w-5 h-5 text-gray-500 mr-3" />
                    )}
                    <div>
                      <label htmlFor="screen-reader" className="text-sm font-medium text-gray-900">
                        Screen Reader Announcements
                      </label>
                      <p className="text-xs text-gray-500">
                        Enable audio feedback for actions
                      </p>
                    </div>
                  </div>
                  <button
                    id="screen-reader"
                    onClick={() => updateSetting('screenReader', !settings.screenReader)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      settings.screenReader ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={settings.screenReader}
                    aria-labelledby="screen-reader"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.screenReader ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 重置按钮 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    const defaultSettings = {
                      highContrast: false,
                      largeText: false,
                      reducedMotion: false,
                      screenReader: false,
                    };
                    setSettings(defaultSettings);
                    localStorage.removeItem('accessibility-settings');
                    applySettings(defaultSettings);
                    announceToScreenReader('Accessibility settings reset to default');
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded py-2"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
