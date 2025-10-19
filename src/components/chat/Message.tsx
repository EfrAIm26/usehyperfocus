// Message component - Individual chat message
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message as MessageType, SemanticChunk } from '../../types';
import { useFastReading } from '../../hooks/useFastReading';
import SemanticChunkComponent from './SemanticChunk';
import { analyzeSemanticChunks } from '../../lib/openrouter';
import { storage } from '../../lib/storage';

interface MessageProps {
  message: MessageType;
  onOpenDiagram: (code: string, messageId: string) => void;
}

export default function Message({ message, onOpenDiagram }: MessageProps) {
  // CRITICAL: Use ONLY the message's frozen settings (NO fallback to global)
  // If undefined, it will be frozen to 'normal' in the useEffect below
  const effectiveFontStyle = message.appliedFontStyle || 'normal';
  const effectiveChunking = message.appliedChunking !== undefined ? message.appliedChunking : false;
  
  const { fontClass } = useFastReading('', effectiveFontStyle);
  const [chunks, setChunks] = useState<SemanticChunk[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-open diagram panel when mermaidCode exists
  useEffect(() => {
    if (message.role === 'assistant' && message.mermaidCode && onOpenDiagram) {
      onOpenDiagram(message.mermaidCode, message.id);
    }
  }, [message.id, message.mermaidCode, message.role, onOpenDiagram]);

  // Settings are now FROZEN at message creation, no need to freeze on render
  // This useEffect is kept for backwards compatibility with old messages
  useEffect(() => {
    if (message.appliedFontStyle === undefined && message.role === 'assistant') {
      // Old message without frozen settings - freeze with 'normal' as default
      // This ensures old messages don't change when global settings change
      const chats = storage.getChats();
      const chat = chats.find(c => c.messages.some(m => m.id === message.id));
      if (chat) {
        const msg = chat.messages.find(m => m.id === message.id);
        if (msg && msg.appliedFontStyle === undefined) {
          msg.appliedFontStyle = 'normal'; // FIXED VALUE, not current global setting
          msg.appliedChunking = false; // Default to OFF for old messages
          storage.saveChat(chat);
          console.log(`✅ Frozen old message ${message.id} with style: normal`);
        }
      }
    }
    
    // Also freeze user messages
    if (message.appliedFontStyle === undefined && message.role === 'user') {
      const chats = storage.getChats();
      const chat = chats.find(c => c.messages.some(m => m.id === message.id));
      if (chat) {
        const msg = chat.messages.find(m => m.id === message.id);
        if (msg && msg.appliedFontStyle === undefined) {
          msg.appliedFontStyle = 'normal';
          msg.appliedChunking = false;
          storage.saveChat(chat);
          console.log(`✅ Frozen old user message ${message.id} with style: normal`);
        }
      }
    }
  }, [message.id, message.role]); // Run once per message

  // Load or analyze semantic chunks (ONLY ONCE per message)
  useEffect(() => {
    if (message.role === 'assistant' && effectiveChunking && message.content && !message.mermaidCode) {
      // If chunks already exist in message, use them (ALWAYS - don't re-analyze)
      if (message.semanticChunks && message.semanticChunks.length > 0) {
        setChunks(message.semanticChunks);
        setIsAnalyzing(false);
        return;
      }

      // Only analyze if we haven't started yet (prevents re-runs)
      if (chunks.length === 0 && !isAnalyzing) {
        setIsAnalyzing(true);
        analyzeSemanticChunks(message.content)
          .then(analyzedChunks => {
            setChunks(analyzedChunks);
            // Save chunks to message in storage IMMEDIATELY
            try {
              const chats = storage.getChats();
              const chat = chats.find(c => c.messages.some(m => m.id === message.id));
              if (chat) {
                const msg = chat.messages.find(m => m.id === message.id);
                if (msg) {
                  msg.semanticChunks = analyzedChunks;
                  storage.saveChat(chat);
                  console.log('✅ Chunks saved for message:', message.id);
                }
              }
            } catch (storageError) {
              console.error('Error saving chunks:', storageError);
            }
          })
          .catch(error => {
            console.error('Error analyzing chunks:', error);
            // Fallback: treat entire message as explanation
            const fallbackChunks = [{
              type: 'explanation' as const,
              content: message.content,
            }];
            setChunks(fallbackChunks);
            // Save fallback too
            try {
              const chats = storage.getChats();
              const chat = chats.find(c => c.messages.some(m => m.id === message.id));
              if (chat) {
                const msg = chat.messages.find(m => m.id === message.id);
                if (msg) {
                  msg.semanticChunks = fallbackChunks;
                  storage.saveChat(chat);
                }
              }
            } catch (storageError) {
              console.error('Error saving fallback chunks:', storageError);
            }
          })
          .finally(() => {
            setIsAnalyzing(false);
          });
      }
    } else if (!effectiveChunking) {
      // If chunking is OFF, clear chunks
      setChunks([]);
    }
  }, [message.id, message.role, message.content, message.semanticChunks, effectiveChunking]);

  if (message.role === 'user') {
    // User messages also respect frozen font style
    const userFontClass = effectiveFontStyle === 'dyslexic' 
      ? 'font-dyslexic' 
      : effectiveFontStyle === 'lexend' 
      ? 'font-lexend' 
      : '';
    
    return (
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-shadow">
        <div className="max-w-4xl">
          <p className={`text-text-primary whitespace-pre-wrap ${userFontClass}`}>
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
                  if (effectiveFontStyle === 'bionic' && typeof children === 'string') {
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

