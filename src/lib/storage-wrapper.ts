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
  
  // 1. Load from fallback immediately (Optimistic UI)
  const localChats = fallbackStorage.getChats();
  cachedChats = localChats;
  cachedSettings = fallbackStorage.getSettings();
  isInitialized = true;
  notifyStorageReady(); // Update UI immediately
  
  try {
    // 2. Try Supabase in background
    const remoteChats = await supabaseStorage.getChats();
    const remoteSettings = await supabaseStorage.getSettings();
    
    // 3. Simple update logic (Remote is source of truth if available)
    if (remoteChats.length > 0) {
       cachedChats = remoteChats;
    } else if (localChats.length > 0) {
       // Remote empty, local has data (e.g. bypass mode or sync issue) -> Keep local
       console.log('⚠️ Remote empty, keeping local data');
    } else {
       cachedChats = [];
    }

    if (remoteSettings) {
        cachedSettings = remoteSettings;
    }
    
    notifyStorageReady(); // Update UI with fresh server data
  } catch (error) {
    console.warn('⚠️ Supabase sync failed, keeping local data:', error);
    // Keep local data as is
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
    isInitialized = false;
    await initializeCache();
    notifyStorageReady();
  },

  // Get all chats (synchronous from cache)
  getChats(): Chat[] {
    if (!isInitialized) {
      return fallbackStorage.getChats();
    }
    return cachedChats;
  },

  // Get a specific chat by ID (synchronous from cache)
  getChat(id: string): Chat | undefined {
    return this.getChats().find((chat) => chat.id === id);
  },

  // Save a chat (async to Supabase, then update cache)
  async saveChat(chat: Chat): Promise<void> {
    // 1. Update cache immediately (Optimistic)
    const index = cachedChats.findIndex((c) => c.id === chat.id);
    if (index !== -1) {
      cachedChats[index] = chat;
    } else {
      cachedChats.unshift(chat); // Add new chats to top
    }
    notifyStorageReady();

    // 2. Save to Fallback (Persistence guarantee)
    fallbackStorage.saveChat(chat);

    // 3. Try Supabase (Background)
    try {
      await supabaseStorage.saveChat(chat);
    } catch (error) {
      console.error('❌ Supabase save failed (using local only):', error);
    }
  },

  // Delete a chat (async to Supabase, then update cache)
  async deleteChat(id: string): Promise<void> {
    // 1. Update cache immediately
    cachedChats = cachedChats.filter((c) => c.id !== id);
    notifyStorageReady();

    // 2. Update Fallback
    fallbackStorage.deleteChat(id);

    // 3. Try Supabase
    try {
      await supabaseStorage.deleteChat(id);
    } catch (error) {
      console.error('❌ Supabase delete failed (using local only):', error);
    }
  },

  // Get current chat ID (synchronous from cache)
  getCurrentChatId(): string | null {
    return fallbackStorage.getCurrentChatId();
  },

  // Set current chat ID (async to Supabase, then update cache)
  async setCurrentChatId(id: string | null): Promise<void> {
    // 1. Update Fallback
    fallbackStorage.setCurrentChatId(id);
    
    // 2. Try Supabase
    try {
      await supabaseStorage.setCurrentChatId(id);
    } catch (error) {
      // Ignore
    }
  },

  // Get settings (synchronous from cache)
  getSettings(): Settings {
    if (!isInitialized || !cachedSettings) {
      return fallbackStorage.getSettings();
    }
    return cachedSettings;
  },

  // Update settings (async to Supabase, then update cache)
  async updateSettings(settings: Partial<Settings>): Promise<void> {
    // 1. Update cache
    if (cachedSettings) {
      cachedSettings = { ...cachedSettings, ...settings };
    } else {
      cachedSettings = { ...fallbackStorage.getSettings(), ...settings };
    }
    
    // 2. Update Fallback
    fallbackStorage.updateSettings(settings);
    notifyStorageReady();

    // 3. Try Supabase
    try {
      await supabaseStorage.updateSettings(settings);
    } catch (error) {
      console.error('❌ Supabase settings update failed:', error);
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    cachedChats = [];
    cachedSettings = null;
    fallbackStorage.clearAll();
    notifyStorageReady();

    try {
      await supabaseStorage.clearAll();
    } catch (error) {
      console.error('Error clearing remote data:', error);
    }
  },

  // Refresh cache from Supabase
  async refreshCache(): Promise<void> {
    await initializeCache();
  },
};
