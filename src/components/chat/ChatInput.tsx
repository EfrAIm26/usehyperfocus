// ChatInput component - Input field for sending messages
import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiDatabase } from 'react-icons/fi';
import ModelSelector from './ModelSelector';
import QuickSettings from './QuickSettings';
import DataUploader from '../data/DataUploader';
import type { ParsedData } from '../../lib/excelParser';

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
  const [showDataUploader, setShowDataUploader] = useState(false);
  const [uploadedData, setUploadedData] = useState<ParsedData | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
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
      // If there's uploaded data, prepend it as context with FULL DATA
      if (uploadedData) {
        console.log('📊 Processing uploaded data:', uploadedData);
        console.log('📊 Headers:', uploadedData.headers);
        console.log('📊 Sample row:', uploadedData.rows[0]);
        
        // For neurodivergence/category columns, count TRUE values
        const categoryCounts: Record<string, number> = {};
        
        // Identify likely category columns (containing true/false, or with "identify" in name)
        uploadedData.headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          const isCategoryColumn = 
            lowerHeader.includes('adhd') || 
            lowerHeader.includes('autism') || 
            lowerHeader.includes('dyslexia') ||
            lowerHeader.includes('neurotypical') ||
            lowerHeader.includes('identify');
          
          if (isCategoryColumn) {
            // Count TRUE/true values in this column (handle multiple formats)
            const trueCount = uploadedData.rows.filter(row => {
              const value = row[header];
              if (value === undefined || value === null || value === '') return false;
              
              // Handle boolean
              if (typeof value === 'boolean') return value;
              
              // Handle string variations
              const strValue = String(value).toLowerCase().trim();
              return strValue === 'true' || strValue === '1' || strValue === 'yes' || strValue === 'si' || strValue === 'sí';
            }).length;
            
            if (trueCount > 0) {
              // Clean up column name for display (remove question text, parentheses)
              let cleanName = header
                .replace(/How do you identify\?\s*\(/gi, '')
                .replace(/\(/g, '')
                .replace(/\)/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              
              // If it's still too long, try to extract just the key term
              if (cleanName.length > 50) {
                // Look for key terms
                if (cleanName.toLowerCase().includes('autism') && cleanName.toLowerCase().includes('adhd')) {
                  cleanName = 'AuDHD (Autism+ADHD)';
                } else if (cleanName.toLowerCase().includes('adhd')) {
                  cleanName = 'ADHD';
                } else if (cleanName.toLowerCase().includes('autism')) {
                  cleanName = 'Autism';
                } else if (cleanName.toLowerCase().includes('dyslexia')) {
                  cleanName = 'Dyslexia';
                } else if (cleanName.toLowerCase().includes('neurotypical')) {
                  cleanName = 'Neurotypical';
                }
              }
              
              categoryCounts[cleanName] = trueCount;
              console.log(`✅ Category "${cleanName}": ${trueCount} TRUE values`);
            } else {
              console.log(`⏭️ Skipping "${header}": 0 TRUE values`);
            }
          } else {
            console.log(`⏭️ Skipping "${header}": not a category column`);
          }
        });
        
        console.log('📊 Final category counts:', categoryCounts);

        const dataContext = `[📊 Data Analysis - ${uploadedFileName}]

📋 Dataset Info:
- Total rows: ${uploadedData.rows.length}
- Total columns: ${uploadedData.headers.length}
- Columns: ${uploadedData.headers.join(', ')}

📊 Detected Categories (TRUE value counts):
${Object.entries(categoryCounts).map(([cat, count]) => 
  `  • ${cat}: ${count} responses (${Math.round((count / uploadedData.rows.length) * 100)}%)`
).join('\n')}

🎯 User Request: ${trimmed}

💡 INSTRUCTIONS FOR AI:
- Use the category counts above to create the visualization
- For pie charts: use these exact counts and percentages
- DO NOT recount or analyze the raw data again
- Create a single diagram with ALL categories shown`;
        
        onSend(dataContext);
        // Clear data after sending
        clearUploadedData();
      } else {
        onSend(trimmed);
      }
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDataUploaded = (data: ParsedData, fileName: string) => {
    setUploadedData(data);
    setUploadedFileName(fileName);
    setShowDataUploader(false);
    
    // Auto-fill input with suggestion
    setInput('Show me a pie chart with all the data');
  };

  const clearUploadedData = () => {
    setUploadedData(null);
    setUploadedFileName(null);
  };

  return (
    <>
      {/* Data Uploader Modal */}
      {showDataUploader && (
        <DataUploader 
          onDataUploaded={handleDataUploaded}
          onClose={() => setShowDataUploader(false)}
        />
      )}
      
      <div className="border-t border-border bg-bg-primary p-4">
        <div className="max-w-4xl mx-auto">
          {/* Data indicator */}
          {uploadedData && (
            <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <FiDatabase className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-900 flex-1">
                <span className="font-medium">{uploadedFileName}</span> 
                <span className="text-green-700 ml-2">({uploadedData.rows.length} rows, {uploadedData.headers.length} columns)</span>
              </span>
              <button
                onClick={clearUploadedData}
                className="text-xs text-green-700 hover:text-green-900 font-medium"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex gap-3 items-end">
            {/* Left side: Quick Settings + Attach + Model selector */}
            <div className="flex items-end gap-2">
              {/* Quick Settings */}
              <QuickSettings />

              {/* File upload button (icon only) - NOW FUNCTIONAL */}
              <button
                type="button"
                onClick={() => setShowDataUploader(true)}
                className={`p-2 bg-white border rounded-lg transition-colors ${
                  uploadedData 
                    ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                title="Upload Excel/CSV for data visualization"
              >
                <FiPaperclip className={`w-5 h-5 ${uploadedData ? 'text-green-600' : 'text-gray-600'}`} />
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
    </>
  );
}

