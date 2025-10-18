// SettingsPanel component - Sidebar settings panel (solo Focus Mode)
import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { storage } from '../../lib/storage';
import type { Settings } from '../../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [focusMode, setFocusMode] = useState<Settings['focusMode']>(storage.getSettings().focusMode);

  // Reload when opened
  useEffect(() => {
    if (isOpen) {
      setFocusMode(storage.getSettings().focusMode);
    }
  }, [isOpen]);

  // Auto-save on change
  const handleFocusModeChange = (mode: Settings['focusMode']) => {
    setFocusMode(mode);
    storage.updateSettings({ focusMode: mode });
  };

  return (
    <>
      {/* Sidebar Panel - Fixed right */}
      <div
        className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-20 ${
          isOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Focus Mode Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Focus Mode
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="focusMode"
                    value="hyperfocus"
                    checked={focusMode === 'hyperfocus'}
                    onChange={(e) => handleFocusModeChange(e.target.value as Settings['focusMode'])}
                    className="w-4 h-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900">🎯 Hyperfocus</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Stay on topic with AI-guided focus
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="focusMode"
                    value="default"
                    checked={focusMode === 'default'}
                    onChange={(e) => handleFocusModeChange(e.target.value as Settings['focusMode'])}
                    className="w-4 h-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900">Default</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Free conversation
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
