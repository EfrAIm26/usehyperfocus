// Custom hook for Hyperfocus mode
import { useState, useCallback, useEffect, useRef } from 'react';
import type { HyperfocusState, Chat } from '../types';
import { storage } from '../lib/storage';
import { analyzeTopic, extractTopic } from '../lib/openrouter';

export function useHyperfocus(currentChat: Chat | undefined) {
  const [hyperfocusState, setHyperfocusState] = useState<HyperfocusState>({
    currentTopic: null,
    focusTask: null,
    isDistracted: false,
    messageCount: 0,
    topicConfidence: 100,
    timerDuration: null,
    timerStartTime: null,
    timerActive: false,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Use ref to track analysis to prevent loops
  const isAnalyzingRef = useRef(false);
  
  // Get settings only when needed or when they actually change
  // This avoids re-running effects on every render
  const settings = storage.getSettings();

  // Update hyperfocus state when chat changes
  // STRICT dependencies: Only run when chat ID changes or settings explicitly change
  useEffect(() => {
    if (currentChat) {
      // Only update if relevant properties actually changed to avoid re-renders
      setHyperfocusState(prev => {
        if (prev.currentTopic === currentChat.topic && 
            prev.focusTask === (settings.focusTask || null) &&
            prev.messageCount === currentChat.messageCount) {
          return prev;
        }
        
        return {
          ...prev,
          currentTopic: currentChat.topic,
          focusTask: settings.focusTask || null,
          // Don't auto-reset distraction unless chat changed
          isDistracted: prev.currentTopic !== currentChat.topic ? false : prev.isDistracted,
          messageCount: currentChat.messageCount,
          // Keep timer state
          timerDuration: settings.timerDuration || null,
          timerStartTime: prev.timerStartTime,
          timerActive: prev.timerActive,
        };
      });
    }
  }, [currentChat?.id, currentChat?.topic, currentChat?.messageCount, settings.focusTask]);

  /**
   * Check if a new message stays on topic
   */
  const checkFocus = useCallback(async (newMessage: string): Promise<{
    isOnTopic: boolean;
    topic: string;
    confidence: number;
    shouldBlock: boolean;
  }> => {
    // GUARD: If default mode or no chat, allow everything immediately
    // Using storage directly to get fresh settings
    const currentSettings = storage.getSettings();
    
    if (currentSettings.focusMode !== 'hyperfocus' || !currentChat) {
      return {
        isOnTopic: true,
        topic: newMessage.slice(0, 50),
        confidence: 100,
        shouldBlock: false,
      };
    }

    if (isAnalyzingRef.current) {
      console.warn('Hyperfocus analysis already in progress');
      return {
        isOnTopic: true, // Fail open
        topic: 'Analysis pending',
        confidence: 100,
        shouldBlock: false
      };
    }

    setIsAnalyzing(true);
    isAnalyzingRef.current = true;

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

      // Check topic similarity
      // Only check if we have a valid current topic
      if (currentChat.topic) {
        const analysis = await analyzeTopic(currentChat.topic, newMessage);
        const isOnTopic = analysis.similarity >= currentSettings.topicSimilarityThreshold;
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
      }
      
      return { isOnTopic: true, topic: '', confidence: 100, shouldBlock: false };

    } catch (error) {
      console.error('Error checking focus:', error);
      return {
        isOnTopic: true,
        topic: newMessage.slice(0, 50),
        confidence: 100,
        shouldBlock: false,
      };
    } finally {
      setIsAnalyzing(false);
      isAnalyzingRef.current = false;
    }
  }, [currentChat?.id, currentChat?.topic, currentChat?.messageCount]); // Minimal deps

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
