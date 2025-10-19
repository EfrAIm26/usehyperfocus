// MessageList component - Scrollable list of messages
import { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../../types';
import Message from './Message';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  onOpenDiagram: (code: string, messageId: string) => void;
}

export default function MessageList({ messages, isLoading, onOpenDiagram }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <img 
              src="/logo_sinfondo.png" 
              alt="Hyperfocus AI" 
              className="h-16 w-16 mx-auto object-contain opacity-50"
            />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            How can I help you?
          </h2>
          <p className="text-gray-600 mb-6">
            Start a conversation and stay focused on your topic. I'll help you learn and understand better.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-bg-secondary rounded-lg text-left">
              <div className="font-semibold mb-1">🎯 Stay Focused</div>
              <div className="text-gray-600 text-xs">
                I'll help you maintain concentration on one topic at a time
              </div>
            </div>
            <div className="p-3 bg-bg-secondary rounded-lg text-left">
              <div className="font-semibold mb-1">📊 Visual Learning</div>
              <div className="text-gray-600 text-xs">
                Ask for diagrams and mind maps to visualize concepts
              </div>
            </div>
            <div className="p-3 bg-bg-secondary rounded-lg text-left">
              <div className="font-semibold mb-1">⚡ Fast Reading</div>
              <div className="text-gray-600 text-xs">
                Responses use bionic reading for faster comprehension
              </div>
            </div>
            <div className="p-3 bg-bg-secondary rounded-lg text-left">
              <div className="font-semibold mb-1">🧠 Neurodivergent-Friendly</div>
              <div className="text-gray-600 text-xs">
                Designed specifically for how your brain works best
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <Message 
          key={message.id} 
          message={message} 
          onOpenDiagram={onOpenDiagram}
        />
      ))}
      
      {isLoading && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}

