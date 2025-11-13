// ModelSelector component - Select AI model with provider icons
import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { OpenAI, Anthropic, Google, XAI, Perplexity } from '@lobehub/icons';
import { AI_MODELS } from '../../lib/aiModels';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const getModelIcon = (provider: string, size: number = 20) => {
  const props = { size, style: { flexShrink: 0 } };
  
  switch (provider) {
    case 'openai':
      return <OpenAI {...props} />;
    case 'anthropic':
      return <Anthropic {...props} />;
    case 'google':
      return <Google {...props} />;
    case 'xai':
      return <XAI {...props} />;
    case 'perplexity':
      return <Perplexity {...props} />;
    case 'moonshot':
      // Using a moon emoji for Moonshot AI
      return <span style={{ fontSize: size, lineHeight: 1 }}>🌙</span>;
    default:
      return null;
  }
};

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

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

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        {getModelIcon(currentModel.provider, 16)}
        <span className="font-medium text-gray-700">{currentModel.name}</span>
        <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-2 bg-gray-50 border-b border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase px-2">
              Select AI Model
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                  model.id === selectedModel ? 'bg-blue-50' : ''
                }`}
              >
                <div className="mt-0.5">
                  {getModelIcon(model.provider, 20)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {model.name}
                    {model.id === selectedModel && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-500 text-white rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {model.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

