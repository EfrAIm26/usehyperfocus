// LocalStorage manager for Hyperfocus AI
import type { StorageSchema, Chat, Settings } from '../types';

const STORAGE_KEY = 'hyperfocus-ai-data';

const DEFAULT_SETTINGS: Settings = {
  fontStyle: 'bionic',
  focusMode: 'hyperfocus', // New simplified setting
  semanticChunking: true, // Enable by default for neurodivergent users
  minMessagesBeforeTopicChange: 5, // Keep for backward compatibility
  topicSimilarityThreshold: 60, // Keep for backward compatibility
};

export const storage = {
  // Get all data from localStorage
  getData(): StorageSchema {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return {
          chats: [],
          currentChatId: null,
          settings: DEFAULT_SETTINGS,
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return {
        chats: [],
        currentChatId: null,
        settings: DEFAULT_SETTINGS,
      };
    }
  },

  // Save all data to localStorage
  setData(data: StorageSchema): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  // Get all chats
  getChats(): Chat[] {
    return this.getData().chats;
  },

  // Get a specific chat by ID
  getChat(id: string): Chat | undefined {
    return this.getChats().find((chat) => chat.id === id);
  },

  // Save a chat (create or update)
  saveChat(chat: Chat): void {
    const data = this.getData();
    const index = data.chats.findIndex((c) => c.id === chat.id);
    
    if (index !== -1) {
      data.chats[index] = chat;
    } else {
      data.chats.push(chat);
    }
    
    this.setData(data);
  },

  // Delete a chat
  deleteChat(id: string): void {
    const data = this.getData();
    data.chats = data.chats.filter((c) => c.id !== id);
    
    // If deleted chat was current, clear current
    if (data.currentChatId === id) {
      data.currentChatId = null;
    }
    
    this.setData(data);
  },

  // Get current chat ID
  getCurrentChatId(): string | null {
    return this.getData().currentChatId;
  },

  // Set current chat ID
  setCurrentChatId(id: string | null): void {
    const data = this.getData();
    data.currentChatId = id;
    this.setData(data);
  },

  // Get settings
  getSettings(): Settings {
    return this.getData().settings;
  },

  // Update settings
  updateSettings(settings: Partial<Settings>): void {
    const data = this.getData();
    data.settings = { ...data.settings, ...settings };
    this.setData(data);
  },

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

