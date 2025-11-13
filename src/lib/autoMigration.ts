// Auto-migration system - runs silently in background when user authenticate
import { storage } from './storage-supabase';
import type { Chat, Settings } from '../types';

const OLD_STORAGE_KEY = 'hyperfocus-ai-data';

interface OldStorageSchema {
  chats: Chat[];
  currentChatId: string | null;
  settings: Settings;
}

export const autoMigration = {
  // Check if migration is needed
  hasLocalStorageData(): boolean {
    try {
      const data = localStorage.getItem(OLD_STORAGE_KEY);
      return data !== null && data !== '{}';
    } catch (error) {
      console.error('Error checking localStorage data:', error);
      return false;
    }
  },

  // Get data from localStorage
  getLocalStorageData(): OldStorageSchema | null {
    try {
      const data = localStorage.getItem(OLD_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading localStorage data:', error);
      return null;
    }
  },

  // Silent migration - no UI, no user interaction
  async performSilentMigration(): Promise<boolean> {
    try {
      console.log('🔄 Starting silent migration to Supabase...');

      const localData = this.getLocalStorageData();
      if (!localData) {
        console.log('✅ No localStorage data to migrate');
        return true;
      }

      // Check if user already has data in Supabase
      const existingChats = await storage.getChats();
      if (existingChats.length > 0) {
        console.log('✅ User already has Supabase data, skipping migration');
        return true;
      }

      // Migrate settings first
      console.log('📝 Migrating settings silently...');
      await storage.updateSettings(localData.settings);
      console.log('✅ Settings migrated silently');

      // Migrate chats and messages
      console.log('💬 Migrating chats silently...');
      let migratedChats = 0;
      
      for (const chat of localData.chats) {
        try {
          await storage.saveChat(chat);
          migratedChats++;
          console.log(`✅ Migrated chat silently: ${chat.title}`);
        } catch (error) {
          console.error(`❌ Failed to migrate chat ${chat.title}:`, error);
        }
      }

      // Set current chat ID if it exists
      if (localData.currentChatId) {
        storage.setCurrentChatId(localData.currentChatId);
        console.log('✅ Current chat ID set silently');
      }

      // Create backup before clearing localStorage
      const backupKey = `hyperfocus-ai-backup-${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify({
        timestamp: new Date().toISOString(),
        data: localData,
      }));

      // Clear localStorage data after successful migration
      localStorage.removeItem(OLD_STORAGE_KEY);
      console.log(`✅ Migration completed silently! Migrated ${migratedChats} chats. Backup: ${backupKey}`);

      return true;
    } catch (error) {
      console.error('❌ Silent migration failed:', error);
      return false;
    }
  },

  // Check if user has data in Supabase already
  async hasSupabaseData(): Promise<boolean> {
    try {
      const chats = await storage.getChats();
      return chats.length > 0;
    } catch (error) {
      console.error('Error checking Supabase data:', error);
      return false;
    }
  },

  // Main function to run when user authenticates
  async runOnAuth(): Promise<void> {
    try {
      // Only run if user is authenticated and has localStorage data
      if (!this.hasLocalStorageData()) {
        console.log('✅ No localStorage data, skipping migration');
        return;
      }

      // Check if already migrated
      const hasSupabaseData = await this.hasSupabaseData();
      if (hasSupabaseData) {
        console.log('✅ Already migrated, skipping');
        return;
      }

      // Perform silent migration
      const success = await this.performSilentMigration();
      if (success) {
        console.log('🎉 Auto-migration completed successfully!');
      } else {
        console.warn('⚠️ Auto-migration failed, but app will continue working');
      }
    } catch (error) {
      console.error('❌ Auto-migration error:', error);
      // Don't throw - let the app continue working
    }
  },
};

