// ChatInput component - Input field for sending messages
import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip } from 'react-icons/fi';
import ModelSelector from './ModelSelector';
import QuickSettings from './QuickSettings';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask me anything...',
  selectedModel,
  onModelChange,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-bg-primary p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          {/* Left side: Quick Settings + Attach + Model selector */}
          <div className="flex items-end gap-2">
            {/* Quick Settings */}
            <QuickSettings />

            {/* File upload button (icon only) */}
            <button
              type="button"
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Attach files"
            >
              <FiPaperclip className="w-5 h-5 text-gray-600" />
            </button>

            {/* Model Selector */}
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={onModelChange}
            />
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-100 disabled:cursor-not-allowed max-h-40 overflow-y-auto"
              style={{ minHeight: '48px' }}
            />
          </div>
          
          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            title="Send message"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Enter</kbd> to send, 
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded ml-1">Shift + Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}

