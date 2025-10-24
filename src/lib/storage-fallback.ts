// Fallback storage using localStorage when Supabase fails
import type { Chat, Settings } from '../types';

const STORAGE_KEY = 'hyperfocus-ai-data';

const DEFAULT_SETTINGS: Settings = {
  fontStyle: 'normal',
  focusMode: 'default',
  semanticChunking: false,
  minMessagesBeforeTopicChange: 5,
  topicSimilarityThreshold: 60,
  focusTask: null,
  timerDuration: null,
};

interface StorageSchema {
  chats: Chat[];
  currentChatId: string | null;
  settings: Settings;
}

export const fallbackStorage = {
  // Get all chats
  getChats(): Chat[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data) as StorageSchema;
      return parsed.chats || [];
    } catch (error) {
      console.error('Error reading chats from localStorage:', error);
      return [];
    }
  },

  // Get specific chat
  getChat(id: string): Chat | undefined {
    const chats = this.getChats();
    return chats.find(chat => chat.id === id);
  },

  // Save chat
  saveChat(chat: Chat): void {
    try {
      const data = this.getStorageData();
      const index = data.chats.findIndex(c => c.id === chat.id);
      
      if (index !== -1) {
        data.chats[index] = chat;
      } else {
        data.chats.push(chat);
      }
      
      data.chats.sort((a, b) => b.updatedAt - a.updatedAt);
      this.setStorageData(data);
      console.log('✅ Chat saved to localStorage fallback:', chat.id);
    } catch (error) {
      console.error('Error saving chat to localStorage:', error);
    }
  },

  // Delete chat
  deleteChat(id: string): void {
    try {
      const data = this.getStorageData();
      data.chats = data.chats.filter(c => c.id !== id);
      
      if (data.currentChatId === id) {
        data.currentChatId = null;
      }
      
      this.setStorageData(data);
      console.log('✅ Chat deleted from localStorage fallback:', id);
    } catch (error) {
      console.error('Error deleting chat from localStorage:', error);
    }
  },

  // Get current chat ID
  getCurrentChatId(): string | null {
    try {
      const data = this.getStorageData();
      return data.currentChatId;
    } catch (error) {
      console.error('Error reading current chat ID:', error);
      return null;
    }
  },

  // Set current chat ID
  setCurrentChatId(id: string | null): void {
    try {
      const data = this.getStorageData();
      data.currentChatId = id;
      this.setStorageData(data);
      console.log('✅ Current chat ID set in localStorage fallback:', id);
    } catch (error) {
      console.error('Error setting current chat ID:', error);
    }
  },

  // Get settings
  getSettings(): Settings {
    try {
      const data = this.getStorageData();
      return data.settings || DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error reading settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  // Update settings
  updateSettings(settings: Partial<Settings>): void {
    try {
      const data = this.getStorageData();
      data.settings = { ...data.settings, ...settings };
      this.setStorageData(data);
      console.log('✅ Settings updated in localStorage fallback:', settings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  },

  // Clear all data
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('✅ All data cleared from localStorage fallback');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Helper methods
  getStorageData(): StorageSchema {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return {
          chats: [],
          currentChatId: null,
          settings: DEFAULT_SETTINGS,
        };
      }
      return JSON.parse(data) as StorageSchema;
    } catch (error) {
      console.error('Error parsing storage data:', error);
      return {
        chats: [],
        currentChatId: null,
        settings: DEFAULT_SETTINGS,
      };
    }
  },

  setStorageData(data: StorageSchema): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
};

