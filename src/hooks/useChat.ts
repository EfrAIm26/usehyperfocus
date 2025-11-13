// Custom hook for managing chat functionality
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Chat, Message } from '../types';
import { storage, onStorageReady } from '../lib/storage';
import { generateId, generateTitle, extractContent } from '../lib/utils';
import { sendChatCompletion, getSystemPrompt, detectDiagramIntent, checkTaskRelevance } from '../lib/openrouter';
import { DEFAULT_MODEL } from '../lib/aiModels';
import { useAuth } from './useAuth';

export function useChat() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const hasCreatedInitialChat = useRef(false); // Track if we've created the first chat

  // Load chats from storage when user changes
  useEffect(() => {
    if (user) {
      const loadChats = async () => {
        const storedChats = storage.getChats();
        const storedCurrentId = storage.getCurrentChatId();
        console.log(`🔄 Loading chats from storage: ${storedChats.length} chats found`);
        
        setChats(storedChats);
        setCurrentChatId(storedCurrentId);
        
        // If no chats exist AND we haven't created one yet, automatically create a new one
        if (storedChats.length === 0 && !hasCreatedInitialChat.current) {
          hasCreatedInitialChat.current = true; // Mark as created to prevent duplicates
          console.log('📝 No chats found, creating first chat automatically...');
          const firstChat: Chat = {
            id: generateId(),
            title: 'New Chat',
            messages: [],
            topic: null,
            messageCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          try {
            await storage.saveChat(firstChat);
            await storage.setCurrentChatId(firstChat.id);
            console.log('✅ First chat created automatically:', firstChat.id);
            
            // Reload from storage
            const updatedChats = storage.getChats();
            setChats(updatedChats);
            setCurrentChatId(firstChat.id);
          } catch (error) {
            console.error('❌ Error creating first chat:', error);
            hasCreatedInitialChat.current = false; // Reset on error so it can retry
          }
        }
      };

      // Subscribe to storage ready events
      const unsubscribe = onStorageReady(loadChats);
      
      // Also try to load immediately (in case storage is already ready)
      loadChats();
      
      return () => {
        unsubscribe();
      };
    } else {
      // Clear chats when user logs out
      setChats([]);
      setCurrentChatId(null);
      hasCreatedInitialChat.current = false; // Reset when user logs out
    }
  }, [user]);

  // Get current chat
  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Create a new chat
  const createNewChat = useCallback(async () => {
    const newChat: Chat = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      topic: null,
      messageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await storage.saveChat(newChat);
      await storage.setCurrentChatId(newChat.id);
      console.log('✅ New chat created and saved to Supabase:', newChat.id);
      
      // Insert new chat at the BEGINNING (most recent first)
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      
      // Reload from storage in background to sync (after cache updates)
      setTimeout(() => {
        const updatedChats = storage.getChats();
        setChats(updatedChats);
      }, 1000);
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      // Fallback: update local state if storage fails
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
    }

    return newChat;
  }, []);

  // Select a chat
  const selectChat = useCallback(async (chatId: string) => {
    try {
      await storage.setCurrentChatId(chatId);
      console.log('✅ Chat selected and saved to Supabase:', chatId);
    } catch (error) {
      console.error('❌ Error selecting chat:', error);
    }
    setCurrentChatId(chatId);
  }, []);

  // Delete a chat
  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await storage.deleteChat(chatId);
      console.log('✅ Chat deleted from Supabase:', chatId);
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
    }
    
    setChats(prev => prev.filter(c => c.id !== chatId));
    
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  }, [currentChatId]);

  // Send a message
  const sendMessage = useCallback(async (content: string): Promise<Message | null> => {
    if (!currentChat) return null;

    setIsLoading(true);

    try {
      // Get current settings and FREEZE them for this message
      const currentSettings = storage.getSettings();
      
      // Check if message is a distraction (Hyperfocus mode only)
      let isDistraction = false;
      console.log('🔍 Checking distraction:', {
        focusMode: currentSettings.focusMode,
        focusTask: currentSettings.focusTask,
        willCheck: currentSettings.focusMode === 'hyperfocus' && !!currentSettings.focusTask
      });
      
      if (currentSettings.focusMode === 'hyperfocus' && currentSettings.focusTask) {
        console.log(`🎯 Running AI distraction check for task: "${currentSettings.focusTask}"`);
        try {
          const relevanceCheck = await checkTaskRelevance(content, currentSettings.focusTask);
          isDistraction = !relevanceCheck.isRelevant;
          console.log(`🎯 Result: ${isDistraction ? '❌ DISTRACTION' : '✅ ON-TASK'} (confidence: ${relevanceCheck.confidence}%)`);
        } catch (error) {
          console.error('❌ Error in distraction check:', error);
        }
      } else {
        console.log('⏭️ Skipping distraction check (not in hyperfocus mode or no task set)');
      }
      
      // Create user message with FROZEN settings
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
        appliedFontStyle: currentSettings.fontStyle, // FROZEN at creation
        appliedChunking: currentSettings.semanticChunking, // FROZEN at creation
        isDistraction, // Flag if message is off-topic
      };

      // Update chat with user message
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
        messageCount: currentChat.messageCount + 1,
        updatedAt: Date.now(),
      };

      // Set title from first message
      if (updatedChat.messages.length === 1) {
        updatedChat.title = generateTitle(content);
      }

      // Update state and storage
      setChats(prev => prev.map(c => c.id === currentChat.id ? updatedChat : c));
      await storage.saveChat(updatedChat);
      console.log('✅ User message saved to Supabase');

      // Prepare messages for AI
      const isDiagramRequest = detectDiagramIntent(content);
      const hasDataContext = content.includes('[Data file uploaded:');
      const systemPrompt = getSystemPrompt(isDiagramRequest, hasDataContext);
      
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...updatedChat.messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      // Get AI response with selected model
      const aiResponse = await sendChatCompletion(apiMessages, selectedModel);

      // Extract diagram code if present
      const { mermaidCode, explanation } = extractContent(aiResponse);

      // Create assistant message with FROZEN settings (same as user message)
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: explanation || aiResponse,
        mermaidCode: mermaidCode,
        timestamp: Date.now(),
        appliedFontStyle: currentSettings.fontStyle, // FROZEN at creation
        appliedChunking: currentSettings.semanticChunking, // FROZEN at creation
        semanticChunks: null, // Will be populated if chunking is enabled
      };

      // Update chat with assistant message
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: Date.now(),
      };

      // Update state and storage
      setChats(prev => prev.map(c => c.id === currentChat.id ? finalChat : c));
      await storage.saveChat(finalChat);
      console.log('✅ Assistant message saved to Supabase');

      return assistantMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create error message with FROZEN settings
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: Date.now(),
        appliedFontStyle: storage.getSettings().fontStyle, // FROZEN at creation
        appliedChunking: storage.getSettings().semanticChunking, // FROZEN at creation
      };

      const errorChat = {
        ...currentChat,
        messages: [...currentChat.messages, errorMessage],
        updatedAt: Date.now(),
      };

      setChats(prev => prev.map(c => c.id === currentChat.id ? errorChat : c));
      await storage.saveChat(errorChat);
      console.log('✅ Error message saved to Supabase');

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentChat]);

  // Update chat topic
  const updateTopic = useCallback(async (chatId: string, topic: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updated = { ...chat, topic };
        storage.saveChat(updated).then(() => {
          console.log('✅ Topic updated and saved to Supabase:', topic);
        }).catch(error => {
          console.error('❌ Error saving topic:', error);
        });
        return updated;
      }
      return chat;
    }));
  }, []);

  return {
    chats,
    currentChat,
    currentChatId,
    isLoading,
    selectedModel,
    setSelectedModel,
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    updateTopic,
  };
}

