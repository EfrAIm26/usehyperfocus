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
  
  // Refs for concurrent safety
  const isCreatingRef = useRef(false); // Prevent double creation
  const loadingRef = useRef(false); // Track loading state for cleanup
  const abortControllerRef = useRef<AbortController | null>(null); // Cancel requests on switch

  // Load chats from storage when user changes
  useEffect(() => {
    if (user) {
      // Reset critical states on user change
      setIsLoading(false);
      loadingRef.current = false;
      
      const loadChats = () => {
        const storedChats = storage.getChats();
        const storedCurrentId = storage.getCurrentChatId();
        
        // Deduplicate chats just in case
        // We rely on storage-wrapper's unshift order (newest first)
        const uniqueChats = Array.from(new Map(storedChats.map(chat => [chat.id, chat])).values());
        
        // Optional: simple sort by updatedAt descending if needed, but storage usually handles it
        uniqueChats.sort((a, b) => b.updatedAt - a.updatedAt);
        
        console.log(`🔄 Loading chats: ${uniqueChats.length} unique chats found`);
        
        setChats(uniqueChats);
        setCurrentChatId(storedCurrentId);
        
        // Only create initial chat if absolutely no chats exist and we are not already creating one
        if (uniqueChats.length === 0 && !isCreatingRef.current) {
          console.log('📝 No chats found, creating first chat automatically...');
          // Call the ref-protected create function
          createNewChat();
        }
      };

      // Subscribe to storage ready events
      const unsubscribe = onStorageReady(loadChats);
      
      // Also try to load immediately
      loadChats();
      
      return () => {
        unsubscribe();
      };
    } else {
      // Clear chats when user logs out
      setChats([]);
      setCurrentChatId(null);
      isCreatingRef.current = false;
    }
  }, [user]); 

  // Get current chat
  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Select a chat - Cancel pending requests
  const selectChat = useCallback(async (chatId: string) => {
    // 1. Cancel any pending AI generation from previous chat
    if (abortControllerRef.current) {
      console.log('🛑 Cancelling previous request due to chat switch');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // 2. Reset loading state immediately
    setIsLoading(false);
    loadingRef.current = false;

    // 3. Update UI immediately
    setCurrentChatId(chatId);

    // 4. Persist selection
    try {
      await storage.setCurrentChatId(chatId);
    } catch (error) {
      console.error('❌ Error selecting chat:', error);
    }
  }, []);

  // Create a new chat - Robust implementation
  const createNewChat = useCallback(async () => {
    // Prevent duplicate calls
    if (isCreatingRef.current) {
      console.warn('⚠️ Creation blocked: Already creating a chat');
      return;
    }
    
    isCreatingRef.current = true;

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
      // Add NEW chat to the TOP of the list immediately (Optimistic)
      setChats(prev => {
        const filtered = prev.filter(c => c.id !== newChat.id);
        return [newChat, ...filtered];
      });
      
      // Use the safe selectChat to handle cleanup of previous chat
      selectChat(newChat.id);
      
      // Reset Focus Mode settings for the new chat context
      storage.updateSettings({ 
        focusMode: 'default',
        focusTask: null 
      }).catch(console.error);

      // Persist to storage
      await storage.saveChat(newChat);
      await storage.setCurrentChatId(newChat.id);
      console.log('✅ New chat created and saved:', newChat.id);
      
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      // Rollback on error
      setChats(prev => prev.filter(c => c.id !== newChat.id));
    } finally {
      // Release lock after short delay
      setTimeout(() => {
        isCreatingRef.current = false;
      }, 500);
    }

    return newChat;
  }, [selectChat]);

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
    // Capture current chat ID at start of request
    const activeChatId = currentChatId;
    
    if (!activeChatId) return null;
    
    // Abort controller for this specific request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    loadingRef.current = true;

    try {
      // Get current settings and FREEZE them for this message
      const currentSettings = storage.getSettings();
      
      // Check if message is a distraction (Hyperfocus mode only)
      let isDistraction = false;
      
      if (currentSettings.focusMode === 'hyperfocus' && currentSettings.focusTask) {
        console.log(`🎯 Running AI distraction check for task: "${currentSettings.focusTask}"`);
        try {
          const relevanceCheck = await checkTaskRelevance(content, currentSettings.focusTask);
          isDistraction = !relevanceCheck.isRelevant;
        } catch (error) {
          console.error('❌ Error in distraction check:', error);
        }
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

      // Update state immediately (Optimistic)
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          // DEDUPLICATION: Check if message already exists
          if (c.messages.some(m => m.id === userMessage.id)) {
             return c;
          }
          
          const updatedChat = {
            ...c,
            messages: [...c.messages, userMessage],
            messageCount: c.messageCount + 1,
            updatedAt: Date.now(),
            title: c.messages.length === 0 ? generateTitle(content) : c.title
          };
          // Save to storage in background
          storage.saveChat(updatedChat).catch(console.error);
          return updatedChat;
        }
        return c;
      }));

      // Prepare messages for AI
      const chatForContext = storage.getChats().find(c => c.id === activeChatId);
      const historyMessages = chatForContext ? chatForContext.messages : [];
      
      const isDiagramRequest = detectDiagramIntent(content);
      const hasDataContext = content.includes('[Data file uploaded:');
      const systemPrompt = getSystemPrompt(isDiagramRequest, hasDataContext);
      
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...historyMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: content } // Ensure current message is included
      ];

      // Get AI response with selected model
      const aiResponse = await sendChatCompletion(apiMessages, selectedModel);

      // GUARD: Check if we switched chats while waiting
      if (currentChatId !== activeChatId || abortController.signal.aborted) {
        console.warn('🛑 Ignoring AI response - User switched chats');
        return null;
      }

      // Extract diagram code if present
      const { mermaidCode, explanation } = extractContent(aiResponse);

      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: explanation || aiResponse,
        mermaidCode: mermaidCode,
        timestamp: Date.now(),
        appliedFontStyle: currentSettings.fontStyle,
        appliedChunking: currentSettings.semanticChunking,
        semanticChunks: null,
      };

      // Update chat with assistant message
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          // DEDUPLICATION
          if (c.messages.some(m => m.id === assistantMessage.id)) {
            return c;
          }

          const finalChat = {
            ...c,
            messages: [...c.messages, assistantMessage],
            updatedAt: Date.now(),
          };
          storage.saveChat(finalChat).catch(console.error);
          return finalChat;
        }
        return c;
      }));

      return assistantMessage;

    } catch (error: any) {
      // Don't show error if it was an abort
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        console.log('🛑 Request aborted');
        return null;
      }

      console.error('❌ Error sending message:', error);
      
      // Create error message
      let errorContent = 'Sorry, I encountered an error. Please try again.';
      if (error.message.includes('API key')) errorContent = 'API key error. Check configuration.';
      else if (error.message.includes('rate limit')) errorContent = 'Rate limit exceeded. Wait a moment.';
      else if (error.message.includes('404')) errorContent = `Model ${selectedModel} not found. Try another model.`;
      
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: errorContent,
        timestamp: Date.now(),
        appliedFontStyle: 'normal',
        appliedChunking: false,
      };

      // Only update if still on same chat
      if (currentChatId === activeChatId) {
        setChats(prev => prev.map(c => {
          if (c.id === activeChatId) {
             // DEDUPLICATION
            if (c.messages.some(m => m.id === errorMessage.id)) {
              return c;
            }
            
            const errorChat = {
              ...c,
              messages: [...c.messages, errorMessage],
              updatedAt: Date.now(),
            };
            storage.saveChat(errorChat).catch(console.error);
            return errorChat;
          }
          return c;
        }));
      }

      return null;
    } finally {
      // Only turn off loading if we are still on the same chat
      if (currentChatId === activeChatId) {
        setIsLoading(false);
        loadingRef.current = false;
      }
      abortControllerRef.current = null;
    }
  }, [currentChatId, selectedModel]);

  // Update chat topic
  const updateTopic = useCallback(async (chatId: string, topic: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updated = { ...chat, topic };
        storage.saveChat(updated).catch(console.error);
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
