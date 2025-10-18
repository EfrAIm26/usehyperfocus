// ChatContainer component - Main chat interface
import { useState, useCallback } from 'react';
import type { Chat } from '../../types';
import { storage } from '../../lib/storage';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import HyperfocusAlert from './HyperfocusAlert';

interface ChatContainerProps {
  currentChat: Chat | undefined;
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onUpdateTopic: (chatId: string, topic: string) => void;
  onNewChat: () => void;
  checkFocus: (message: string) => Promise<{
    isOnTopic: boolean;
    topic: string;
    confidence: number;
    shouldBlock: boolean;
  }>;
  isAnalyzing: boolean;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onOpenDiagram: (code: string, messageId: string) => void;
}

export default function ChatContainer({
  currentChat,
  isLoading,
  onSendMessage,
  onUpdateTopic,
  onNewChat,
  checkFocus,
  isAnalyzing,
  selectedModel,
  onModelChange,
  onOpenDiagram,
}: ChatContainerProps) {
  const [showDistractedAlert, setShowDistractedAlert] = useState(false);
  const [distractedData, setDistractedData] = useState<{
    currentTopic: string;
    newTopic: string;
    confidence: number;
  } | null>(null);

  const settings = storage.getSettings();
  const fontStyle = settings.fontStyle;

  const handleSendMessage = useCallback(async (message: string) => {
    if (!currentChat) return;

    // Check focus if hyperfocus mode is enabled
    if (settings.focusMode === 'hyperfocus') {
      const focusResult = await checkFocus(message);

      if (focusResult.shouldBlock) {
        // Show distraction alert
        setDistractedData({
          currentTopic: currentChat.topic || 'your current topic',
          newTopic: focusResult.topic,
          confidence: focusResult.confidence,
        });
        setShowDistractedAlert(true);
        return;
      }

      // Update topic if it's a new one
      if (currentChat.messageCount === 0 || !currentChat.topic) {
        onUpdateTopic(currentChat.id, focusResult.topic);
      }
    }

    // Send the message
    await onSendMessage(message);
  }, [currentChat, settings.focusMode, checkFocus, onSendMessage, onUpdateTopic]);

  const handleContinue = useCallback(() => {
    setShowDistractedAlert(false);
    setDistractedData(null);
  }, []);

  const handleNewChatFromAlert = useCallback(() => {
    setShowDistractedAlert(false);
    setDistractedData(null);
    onNewChat();
  }, [onNewChat]);

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <img 
            src="/logo_sinfondo.png" 
            alt="Hyperfocus AI" 
            className="h-20 w-20 mx-auto object-contain mb-4 opacity-50"
          />
          <p className="text-gray-600">
            Select a chat or create a new one to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Current topic indicator */}
      {currentChat.topic && settings.focusMode === 'hyperfocus' && (
        <div className="px-6 py-2 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-primary">🎯 Current Focus:</span>
            <span className="text-gray-700">{currentChat.topic}</span>
            <span className="ml-auto text-xs text-gray-500">
              Hyperfocus Mode
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={currentChat.messages}
        fontStyle={fontStyle}
        isLoading={isLoading}
        onOpenDiagram={onOpenDiagram}
      />

      {/* Hyperfocus distraction alert */}
      {showDistractedAlert && distractedData && (
        <HyperfocusAlert
          currentTopic={distractedData.currentTopic}
          newTopic={distractedData.newTopic}
          confidence={distractedData.confidence}
          onContinue={handleContinue}
          onNewChat={handleNewChatFromAlert}
        />
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading || isAnalyzing}
        placeholder={
          isAnalyzing
            ? 'Checking if this stays on topic...'
            : 'Ask me anything...'
        }
        selectedModel={selectedModel}
        onModelChange={onModelChange}
      />
    </div>
  );
}

