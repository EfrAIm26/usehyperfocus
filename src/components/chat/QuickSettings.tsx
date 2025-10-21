// QuickSettings - Dropdown para Style y Content Organization
import { useState, useRef, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { storage } from '../../lib/storage';
import type { Settings } from '../../types';

export default function QuickSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(storage.getSettings());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reload settings when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSettings(storage.getSettings());
    }
  }, [isOpen]);

  const handleStyleChange = async (style: Settings['fontStyle']) => {
    const newSettings = { ...settings, fontStyle: style };
    setSettings(newSettings);
    try {
      await storage.updateSettings({ fontStyle: style });
      console.log('✅ Font style saved to Supabase:', style);
    } catch (error) {
      console.error('❌ Error saving font style:', error);
    }
  };

  const handleChunkingChange = async (enabled: boolean) => {
    const newSettings = { ...settings, semanticChunking: enabled };
    setSettings(newSettings);
    try {
      await storage.updateSettings({ semanticChunking: enabled });
      console.log('✅ Semantic chunking saved to Supabase:', enabled);
    } catch (error) {
      console.error('❌ Error saving semantic chunking:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Plus Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Quick Settings"
      >
        {isOpen ? <FiX className="w-5 h-5 text-gray-600" /> : <FiPlus className="w-5 h-5 text-gray-600" />}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          {/* Reading Style */}
          <div className="p-3 border-b border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Style
            </div>
            <div className="space-y-1">
              <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="fontStyle"
                  value="bionic"
                  checked={settings.fontStyle === 'bionic'}
                  onChange={(e) => handleStyleChange(e.target.value as Settings['fontStyle'])}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Bionic Reading</span>
              </label>
              <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="fontStyle"
                  value="dyslexic"
                  checked={settings.fontStyle === 'dyslexic'}
                  onChange={(e) => handleStyleChange(e.target.value as Settings['fontStyle'])}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">OpenDyslexic</span>
              </label>
              <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="fontStyle"
                  value="normal"
                  checked={settings.fontStyle === 'normal'}
                  onChange={(e) => handleStyleChange(e.target.value as Settings['fontStyle'])}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Normal</span>
              </label>
            </div>
          </div>

          {/* Content Organization */}
          <div className="p-3">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Organization
            </div>
            <label className="flex items-start p-2 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.semanticChunking}
                onChange={(e) => handleChunkingChange(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded mt-0.5"
              />
              <div className="ml-2">
                <div className="text-sm text-gray-700 font-medium">Semantic Chunks</div>
                <div className="text-xs text-gray-500">Organize by type</div>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}


