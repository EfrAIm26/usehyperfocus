// Message component - Individual chat message
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message as MessageType, FontStyle, SemanticChunk } from '../../types';
import { useFastReading } from '../../hooks/useFastReading';
import SemanticChunkComponent from './SemanticChunk';
import { analyzeSemanticChunks } from '../../lib/openrouter';
import { storage } from '../../lib/storage';

interface MessageProps {
  message: MessageType;
  fontStyle: FontStyle;
  onOpenDiagram: (code: string, messageId: string) => void;
}

export default function Message({ message, fontStyle, onOpenDiagram }: MessageProps) {
  // Use applied settings if they exist (stable mode), otherwise use current settings
  const currentSettings = storage.getSettings();
  const effectiveFontStyle = message.appliedFontStyle || fontStyle;
  const effectiveChunking = message.appliedChunking !== undefined ? message.appliedChunking : currentSettings.semanticChunking;
  
  const { fontClass } = useFastReading('', effectiveFontStyle);
  const [chunks, setChunks] = useState<SemanticChunk[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-open diagram panel when mermaidCode exists
  useEffect(() => {
    if (message.role === 'assistant' && message.mermaidCode && onOpenDiagram) {
      onOpenDiagram(message.mermaidCode, message.id);
    }
  }, [message.id, message.mermaidCode, message.role, onOpenDiagram]);

  // Freeze settings on first render for this message (only once!)
  useEffect(() => {
    if (message.role === 'assistant' && message.appliedFontStyle === undefined) {
      const settings = storage.getSettings(); // Get fresh settings
      const chats = storage.getChats();
      const chat = chats.find(c => c.messages.some(m => m.id === message.id));
      if (chat) {
        const msg = chat.messages.find(m => m.id === message.id);
        if (msg && msg.appliedFontStyle === undefined) { // Double check
          msg.appliedFontStyle = settings.fontStyle;
          msg.appliedChunking = settings.semanticChunking;
          storage.saveChat(chat);
        }
      }
    }
  }, [message.id, message.role]); // Only depend on message id/role, NOT on settings

  // Load or analyze semantic chunks
  useEffect(() => {
    if (message.role === 'assistant' && effectiveChunking && message.content && !message.mermaidCode) {
      // If chunks already exist in message, use them (persistence)
      if (message.semanticChunks && message.semanticChunks.length > 0) {
        setChunks(message.semanticChunks);
        setIsAnalyzing(false);
        return;
      }

      // Otherwise, analyze and save
      setIsAnalyzing(true);
      analyzeSemanticChunks(message.content)
        .then(analyzedChunks => {
          setChunks(analyzedChunks);
          // Save chunks to message in storage
          const chats = storage.getChats();
          const chat = chats.find(c => c.messages.some(m => m.id === message.id));
          if (chat) {
            const msg = chat.messages.find(m => m.id === message.id);
            if (msg) {
              msg.semanticChunks = analyzedChunks;
              storage.saveChat(chat);
            }
          }
        })
        .catch(error => {
          console.error('Error analyzing chunks:', error);
          // Fallback: treat entire message as explanation
          setChunks([{
            type: 'explanation',
            content: message.content,
          }]);
        })
        .finally(() => {
          setIsAnalyzing(false);
        });
    }
  }, [message.id, message.role, message.content, message.semanticChunks, effectiveChunking]);

  if (message.role === 'user') {
    return (
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-shadow">
        <div className="max-w-4xl">
          <p className="text-text-primary whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="px-6 py-4 border-b border-gray-100 last:border-0">
      <div className="max-w-4xl">
        {/* Diagram opens automatically - no visual indicator needed */}

        {/* Semantic chunking mode */}
        {effectiveChunking && chunks.length > 0 && !isAnalyzing ? (
          <div>
            {chunks.map((chunk, index) => (
              <SemanticChunkComponent
                key={index}
                type={chunk.type}
                content={chunk.content}
                fontStyle={effectiveFontStyle}
              />
            ))}
          </div>
        ) : isAnalyzing ? (
          <div className="flex items-center gap-2 text-gray-500 py-4">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-sm">Analyzing content...</span>
          </div>
        ) : (
          /* Regular text content with markdown and bionic reading */
          message.content && (
          <div className={`prose prose-sm max-w-none ${fontClass}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom renderers for markdown elements
                p: ({ children }) => {
                  if (fontStyle === 'bionic' && typeof children === 'string') {
                    const bionicHtml = applyBionicToString(children);
                    return (
                      <p
                        className="mb-3 text-left leading-relaxed"
                        dangerouslySetInnerHTML={bionicHtml}
                      />
                    );
                  }
                  return <p className="mb-3 text-left leading-relaxed">{children}</p>;
                },
                
                strong: ({ children }) => (
                  <strong className="font-bold text-text-primary">{children}</strong>
                ),
                
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
                
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
                ),
                
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
                ),
                
                li: ({ children }) => (
                  <li className="text-left">{children}</li>
                ),
                
                code: ({ className, children }: any) => {
                  const isInline = !className || !className.includes('language-');
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 bg-gray-100 text-pink-600 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="block p-3 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono overflow-x-auto my-2">
                      {children}
                    </code>
                  );
                },
                
                pre: ({ children }) => (
                  <pre className="my-2">{children}</pre>
                ),
                
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>
                ),
                
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>
                ),
                
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mb-2 mt-2">{children}</h3>
                ),
                
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {children}
                  </a>
                ),
                
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          )
        )}
      </div>
    </div>
  );
}

// Helper function to apply bionic reading to a string
function applyBionicToString(text: string): { __html: string } {
  const words = text.split(/(\s+)/);
  
  const processedWords = words.map(word => {
    if (/^\s+$/.test(word) || word.length <= 1) {
      return word;
    }

    let boldLength = 1;
    
    if (word.length >= 2 && word.length <= 3) {
      boldLength = 1;
    } else if (word.length >= 4 && word.length <= 5) {
      boldLength = Math.ceil(word.length * 0.5);
    } else if (word.length >= 6 && word.length <= 8) {
      boldLength = Math.ceil(word.length * 0.4);
    } else if (word.length >= 9) {
      boldLength = Math.ceil(word.length * 0.35);
    }

    const boldPart = word.slice(0, boldLength);
    const normalPart = word.slice(boldLength);

    return `<strong>${boldPart}</strong>${normalPart}`;
  });

  return { __html: processedWords.join('') };
}

