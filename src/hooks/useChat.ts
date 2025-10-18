// Custom hook for managing chat functionality
import { useState, useCallback, useEffect } from 'react';
import type { Chat, Message } from '../types';
import { storage } from '../lib/storage';
import { generateId, generateTitle, extractContent } from '../lib/utils';
import { sendChatCompletion, getSystemPrompt, detectDiagramIntent } from '../lib/openrouter';
import { DEFAULT_MODEL } from '../lib/aiModels';

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);

  // Load chats from storage on mount
  useEffect(() => {
    const storedChats = storage.getChats();
    const storedCurrentId = storage.getCurrentChatId();
    setChats(storedChats);
    setCurrentChatId(storedCurrentId);
  }, []);

  // Get current chat
  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Create a new chat
  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      topic: null,
      messageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    storage.saveChat(newChat);
    storage.setCurrentChatId(newChat.id);
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);

    return newChat;
  }, []);

  // Select a chat
  const selectChat = useCallback((chatId: string) => {
    storage.setCurrentChatId(chatId);
    setCurrentChatId(chatId);
  }, []);

  // Delete a chat
  const deleteChat = useCallback((chatId: string) => {
    storage.deleteChat(chatId);
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
      // Create user message
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
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
      storage.saveChat(updatedChat);

      // Prepare messages for AI
      const isDiagramRequest = detectDiagramIntent(content);
      const systemPrompt = getSystemPrompt(isDiagramRequest);
      
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

      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: explanation || aiResponse,
        mermaidCode: mermaidCode,
        timestamp: Date.now(),
      };

      // Update chat with assistant message
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: Date.now(),
      };

      // Update state and storage
      setChats(prev => prev.map(c => c.id === currentChat.id ? finalChat : c));
      storage.saveChat(finalChat);

      return assistantMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create error message
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: Date.now(),
      };

      const errorChat = {
        ...currentChat,
        messages: [...currentChat.messages, errorMessage],
        updatedAt: Date.now(),
      };

      setChats(prev => prev.map(c => c.id === currentChat.id ? errorChat : c));
      storage.saveChat(errorChat);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentChat]);

  // Update chat topic
  const updateTopic = useCallback((chatId: string, topic: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updated = { ...chat, topic };
        storage.saveChat(updated);
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

