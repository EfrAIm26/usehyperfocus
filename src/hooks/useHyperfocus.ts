// Custom hook for Hyperfocus mode
import { useState, useCallback, useEffect } from 'react';
import type { HyperfocusState, Chat } from '../types';
import { storage } from '../lib/storage';
import { analyzeTopic, extractTopic } from '../lib/openrouter';

export function useHyperfocus(currentChat: Chat | undefined) {
  const [hyperfocusState, setHyperfocusState] = useState<HyperfocusState>({
    currentTopic: null,
    isDistracted: false,
    messageCount: 0,
    topicConfidence: 100,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const settings = storage.getSettings();

  // Update hyperfocus state when chat changes
  useEffect(() => {
    if (currentChat) {
      setHyperfocusState({
        currentTopic: currentChat.topic,
        isDistracted: false,
        messageCount: currentChat.messageCount,
        topicConfidence: 100,
      });
    }
  }, [currentChat?.id]);

  /**
   * Check if a new message stays on topic
   */
  const checkFocus = useCallback(async (newMessage: string): Promise<{
    isOnTopic: boolean;
    topic: string;
    confidence: number;
    shouldBlock: boolean;
  }> => {
    // If default mode or no chat, allow everything
    if (settings.focusMode !== 'hyperfocus' || !currentChat) {
      return {
        isOnTopic: true,
        topic: newMessage.slice(0, 50),
        confidence: 100,
        shouldBlock: false,
      };
    }

    setIsAnalyzing(true);

    try {
      const messageCount = currentChat.messageCount;

      // First message in chat - establish topic
      if (messageCount === 0 || !currentChat.topic) {
        const topic = await extractTopic(newMessage);
        
        return {
          isOnTopic: true,
          topic,
          confidence: 100,
          shouldBlock: false,
        };
      }

      // Allow topic change after minimum messages
      if (messageCount >= settings.minMessagesBeforeTopicChange) {
        const topic = await extractTopic(newMessage);
        
        return {
          isOnTopic: true,
          topic,
          confidence: 100,
          shouldBlock: false,
        };
      }

      // Check topic similarity
      const analysis = await analyzeTopic(currentChat.topic, newMessage);

      const isOnTopic = analysis.similarity >= settings.topicSimilarityThreshold;
      const shouldBlock = !isOnTopic;

      setHyperfocusState(prev => ({
        ...prev,
        isDistracted: shouldBlock,
        topicConfidence: analysis.similarity,
      }));

      return {
        isOnTopic,
        topic: analysis.newTopic,
        confidence: analysis.similarity,
        shouldBlock,
      };
    } catch (error) {
      console.error('Error checking focus:', error);
      
      // On error, allow the message (don't block)
      return {
        isOnTopic: true,
        topic: newMessage.slice(0, 50),
        confidence: 100,
        shouldBlock: false,
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentChat, settings]);

  /**
   * Reset distraction state
   */
  const resetDistraction = useCallback(() => {
    setHyperfocusState(prev => ({
      ...prev,
      isDistracted: false,
      topicConfidence: 100,
    }));
  }, []);

  return {
    hyperfocusState,
    isAnalyzing,
    checkFocus,
    resetDistraction,
  };
}

