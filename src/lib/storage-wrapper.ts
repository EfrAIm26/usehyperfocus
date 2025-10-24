// Storage wrapper to maintain compatibility with existing code
// This provides a synchronous API that wraps the async Supabase storage
import { storage as supabaseStorage } from './storage-supabase';
import { fallbackStorage } from './storage-fallback';
import type { Chat, Settings } from '../types';

// In-memory cache to store data for synchronous access
let cachedChats: Chat[] = [];
let cachedSettings: Settings | null = null;
let isInitialized = false;

// Event system for notifying when storage is ready
type StorageEventListener = () => void;
const listeners: StorageEventListener[] = [];

function notifyStorageReady() {
  listeners.forEach(listener => listener());
}

export function onStorageReady(listener: StorageEventListener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

// Initialize cache from Supabase with fallback
async function initializeCache() {
  if (isInitialized) return;
  
  try {
    console.log('🔄 Initializing storage cache from Supabase...');
    
    // Force fresh data from Supabase
    cachedChats = await supabaseStorage.getChats();
    cachedSettings = await supabaseStorage.getSettings();
    
    console.log(`✅ Storage cache initialized: ${cachedChats.length} chats loaded`);
    isInitialized = true;
    notifyStorageReady(); // Notify that storage is ready
  } catch (error) {
    console.error('❌ Supabase initialization failed, using localStorage fallback:', error);
    cachedChats = fallbackStorage.getChats();
    cachedSettings = fallbackStorage.getSettings();
    isInitialized = true;
    console.log('✅ Storage cache initialized from localStorage fallback');
    notifyStorageReady(); // Notify that storage is ready
  }
}

// Wrapper that provides synchronous API
export const storage = {
  // Initialize cache (call this when app starts)
  async initialize() {
    await initializeCache();
  },

  // Force reinitialize cache (call this when user changes)
  async reinitialize() {
    console.log('🔄 Force reinitializing storage cache...');
    isInitialized = false;
    cachedChats = [];
    cachedSettings = null;
    await initializeCache();
    console.log('✅ Storage reinitialized and ready');
    notifyStorageReady(); // Notify that storage is reinitialized
  },

  // Get all chats (synchronous from cache)
  getChats(): Chat[] {
    if (!isInitialized) {
      console.warn('Storage not initialized, returning empty array');
      return [];
    }
    return cachedChats;
  },

  // Get a specific chat by ID (synchronous from cache)
  getChat(id: string): Chat | undefined {
    if (!isInitialized) return undefined;
    return cachedChats.find((chat) => chat.id === id);
  },

  // Save a chat (async to Supabase, then update cache)
  async saveChat(chat: Chat): Promise<void> {
    try {
      await supabaseStorage.saveChat(chat);
      console.log('✅ Chat saved to Supabase:', chat.id);
      
      // Update cache
      const index = cachedChats.findIndex((c) => c.id === chat.id);
      if (index !== -1) {
        cachedChats[index] = chat;
      } else {
        cachedChats.push(chat);
      }
    } catch (error) {
      console.error('❌ Supabase save failed, using localStorage fallback:', error);
      
      // Fallback to localStorage
      fallbackStorage.saveChat(chat);
      
      // Update cache anyway
      const index = cachedChats.findIndex((c) => c.id === chat.id);
      if (index !== -1) {
        cachedChats[index] = chat;
      } else {
        cachedChats.push(chat);
      }
    }
  },

  // Delete a chat (async to Supabase, then update cache)
  async deleteChat(id: string): Promise<void> {
    try {
      await supabaseStorage.deleteChat(id);
      console.log('✅ Chat deleted from Supabase:', id);
      
      // Update cache
      cachedChats = cachedChats.filter((c) => c.id !== id);
    } catch (error) {
      console.error('❌ Supabase delete failed, using localStorage fallback:', error);
      
      // Fallback to localStorage
      fallbackStorage.deleteChat(id);
      
      // Update cache anyway
      cachedChats = cachedChats.filter((c) => c.id !== id);
    }
  },

  // Get current chat ID (synchronous from cache)
  getCurrentChatId(): string | null {
    if (!isInitialized) return null;
    return fallbackStorage.getCurrentChatId();
  },

  // Set current chat ID (async to Supabase, then update cache)
  async setCurrentChatId(id: string | null): Promise<void> {
    try {
      await supabaseStorage.setCurrentChatId(id);
      console.log('✅ Current chat ID set in Supabase:', id);
      
      // Also set in fallback
      fallbackStorage.setCurrentChatId(id);
    } catch (error) {
      console.error('❌ Supabase setCurrentChatId failed, using localStorage fallback:', error);
      
      // Fallback to localStorage
      fallbackStorage.setCurrentChatId(id);
    }
  },

  // Get settings (synchronous from cache)
  getSettings(): Settings {
    if (!isInitialized || !cachedSettings) {
      return {
        fontStyle: 'normal',
        focusMode: 'default',
        semanticChunking: false,
        minMessagesBeforeTopicChange: 5,
        topicSimilarityThreshold: 60,
        focusTask: null,
        timerDuration: null,
      };
    }
    return cachedSettings;
  },

  // Update settings (async to Supabase, then update cache)
  async updateSettings(settings: Partial<Settings>): Promise<void> {
    try {
      await supabaseStorage.updateSettings(settings);
      console.log('✅ Settings updated in Supabase:', settings);
      
      // Update cache
      if (cachedSettings) {
        cachedSettings = { ...cachedSettings, ...settings };
      } else {
        cachedSettings = {
          fontStyle: 'normal',
          focusMode: 'default',
          semanticChunking: false,
          minMessagesBeforeTopicChange: 5,
          topicSimilarityThreshold: 60,
          focusTask: null,
          timerDuration: null,
          ...settings,
        };
      }
      console.log('✅ Cache updated with new settings:', cachedSettings);
    } catch (error) {
      console.error('❌ Supabase updateSettings failed, using localStorage fallback:', error);
      
      // Fallback to localStorage
      fallbackStorage.updateSettings(settings);
      
      // Update cache anyway
      if (cachedSettings) {
        cachedSettings = { ...cachedSettings, ...settings };
      } else {
        cachedSettings = {
          fontStyle: 'normal',
          focusMode: 'default',
          semanticChunking: false,
          minMessagesBeforeTopicChange: 5,
          topicSimilarityThreshold: 60,
          focusTask: null,
          timerDuration: null,
          ...settings,
        };
      }
      console.log('✅ Cache updated with new settings (fallback):', cachedSettings);
    }
  },

  // Clear all data (async to Supabase, then update cache)
  async clearAll(): Promise<void> {
    try {
      await supabaseStorage.clearAll();
      
      // Clear cache
      cachedChats = [];
      cachedSettings = null;
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },

  // Refresh cache from Supabase
  async refreshCache(): Promise<void> {
    try {
      cachedChats = await supabaseStorage.getChats();
      cachedSettings = await supabaseStorage.getSettings();
    } catch (error) {
      console.error('Error refreshing cache:', error);
    }
  },
};
