// Supabase storage manager for Hyperfocus AI
import { supabase } from './supabase';
import type { 
  Chat, 
  Message, 
  Settings, 
  DbChat, 
  DbMessage, 
  DbUserSettings 
} from '../types';

const DEFAULT_SETTINGS: Settings = {
  fontStyle: 'bionic',
  focusMode: 'hyperfocus',
  semanticChunking: true,
  minMessagesBeforeTopicChange: 5,
  topicSimilarityThreshold: 60,
};

// Helper functions to convert between database and app formats
const dbChatToChat = (dbChat: DbChat, messages: Message[]): Chat => ({
  id: dbChat.id,
  title: dbChat.title,
  messages,
  topic: dbChat.topic || null,
  messageCount: dbChat.message_count,
  createdAt: new Date(dbChat.created_at).getTime(),
  updatedAt: new Date(dbChat.updated_at).getTime(),
});

const chatToDbChat = (chat: Chat, userId: string): Omit<DbChat, 'created_at' | 'updated_at'> => ({
  id: chat.id,
  user_id: userId,
  title: chat.title,
  topic: chat.topic || null,
  message_count: chat.messageCount,
});

const dbMessageToMessage = (dbMessage: DbMessage): Message => ({
  id: dbMessage.id,
  role: dbMessage.role,
  content: dbMessage.content,
  mermaidCode: dbMessage.mermaid_code || null,
  semanticChunks: dbMessage.semantic_chunks || null,
  appliedFontStyle: dbMessage.applied_font_style || undefined,
  appliedChunking: dbMessage.applied_chunking === null ? undefined : dbMessage.applied_chunking,
  timestamp: new Date(dbMessage.created_at).getTime(),
});

const messageToDbMessage = (message: Message, chatId: string): Omit<DbMessage, 'created_at'> => ({
  id: message.id,
  chat_id: chatId,
  role: message.role,
  content: message.content,
  mermaid_code: message.mermaidCode || null,
  semantic_chunks: message.semanticChunks || null,
  applied_font_style: message.appliedFontStyle || null,
  applied_chunking: message.appliedChunking === undefined ? null : message.appliedChunking,
});

const dbSettingsToSettings = (dbSettings: DbUserSettings): Settings => ({
  fontStyle: dbSettings.font_style,
  focusMode: dbSettings.focus_mode,
  semanticChunking: dbSettings.semantic_chunking,
  minMessagesBeforeTopicChange: dbSettings.min_messages_before_topic_change,
  topicSimilarityThreshold: dbSettings.topic_similarity_threshold,
});

const settingsToDbSettings = (settings: Settings, userId: string): Omit<DbUserSettings, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  font_style: settings.fontStyle,
  focus_mode: settings.focusMode,
  semantic_chunking: settings.semanticChunking,
  min_messages_before_topic_change: settings.minMessagesBeforeTopicChange,
  topic_similarity_threshold: settings.topicSimilarityThreshold,
});

export const storage = {
  // Get current user ID
  async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  },

  // Get all chats for current user
  async getChats(): Promise<Chat[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    try {
      const { data: dbChats, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      const chats: Chat[] = [];
      
      for (const dbChat of dbChats || []) {
        // Get messages for this chat
        const { data: dbMessages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', dbChat.id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        const messages = (dbMessages || []).map(dbMessageToMessage);
        const chat = dbChatToChat(dbChat, messages);
        chats.push(chat);
      }

      return chats;
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },

  // Get a specific chat by ID
  async getChat(id: string): Promise<Chat | undefined> {
    const userId = await this.getCurrentUserId();
    if (!userId) return undefined;

    try {
      const { data: dbChat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (chatError) throw chatError;

      // Get messages for this chat
      const { data: dbMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const messages = (dbMessages || []).map(dbMessageToMessage);
      return dbChatToChat(dbChat, messages);
    } catch (error) {
      console.error('Error fetching chat:', error);
      return undefined;
    }
  },

  // Save a chat (create or update)
  async saveChat(chat: Chat): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      // Check if chat exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('id', chat.id)
        .eq('user_id', userId)
        .single();

      const dbChat = chatToDbChat(chat, userId);

      if (existingChat) {
        // Update existing chat
        const { error: chatError } = await supabase
          .from('chats')
          .update({
            title: dbChat.title,
            topic: dbChat.topic,
            message_count: dbChat.message_count,
          })
          .eq('id', chat.id)
          .eq('user_id', userId);

        if (chatError) throw chatError;

        // Update messages
        await this.updateChatMessages(chat.id, chat.messages);
      } else {
        // Create new chat
        const { error: chatError } = await supabase
          .from('chats')
          .insert(dbChat);

        if (chatError) throw chatError;

        // Insert messages
        if (chat.messages.length > 0) {
          const dbMessages = chat.messages.map(msg => messageToDbMessage(msg, chat.id));
          const { error: messagesError } = await supabase
            .from('messages')
            .insert(dbMessages);

          if (messagesError) throw messagesError;
        }
      }
    } catch (error) {
      console.error('Error saving chat:', error);
      throw error;
    }
  },

  // Helper function to update chat messages
  async updateChatMessages(chatId: string, messages: Message[]): Promise<void> {
    try {
      // Delete existing messages
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);

      if (deleteError) throw deleteError;

      // Insert new messages
      if (messages.length > 0) {
        const dbMessages = messages.map(msg => messageToDbMessage(msg, chatId));
        const { error: insertError } = await supabase
          .from('messages')
          .insert(dbMessages);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating chat messages:', error);
      throw error;
    }
  },

  // Delete a chat
  async deleteChat(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  },

  // Get current chat ID (from localStorage for now, could be moved to user settings)
  getCurrentChatId(): string | null {
    try {
      return localStorage.getItem('hyperfocus-ai-current-chat-id');
    } catch (error) {
      console.error('Error reading current chat ID:', error);
      return null;
    }
  },

  // Set current chat ID
  setCurrentChatId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem('hyperfocus-ai-current-chat-id', id);
      } else {
        localStorage.removeItem('hyperfocus-ai-current-chat-id');
      }
    } catch (error) {
      console.error('Error setting current chat ID:', error);
    }
  },

  // Get user settings
  async getSettings(): Promise<Settings> {
    const userId = await this.getCurrentUserId();
    if (!userId) return DEFAULT_SETTINGS;

    try {
      const { data: dbSettings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          const defaultDbSettings = {
            user_id: userId,
            font_style: DEFAULT_SETTINGS.fontStyle,
            focus_mode: DEFAULT_SETTINGS.focusMode,
            semantic_chunking: DEFAULT_SETTINGS.semanticChunking,
            min_messages_before_topic_change: DEFAULT_SETTINGS.minMessagesBeforeTopicChange,
            topic_similarity_threshold: DEFAULT_SETTINGS.topicSimilarityThreshold,
          };

          const { error: insertError } = await supabase
            .from('user_settings')
            .insert(defaultDbSettings);

          if (insertError) throw insertError;
          return DEFAULT_SETTINGS;
        }
        throw error;
      }

      return dbSettingsToSettings(dbSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  // Update user settings
  async updateSettings(settings: Partial<Settings>): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      // First, check if settings exist
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingSettings) {
        // Create new settings if they don't exist
        const currentSettings = await this.getSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        const dbSettings = settingsToDbSettings(updatedSettings, userId);
        
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert(dbSettings);
        
        if (insertError) throw insertError;
        console.log('✅ Created new user settings in Supabase');
      } else {
        // Update only the changed fields
        const dbUpdate: any = {};
        if (settings.fontStyle !== undefined) dbUpdate.font_style = settings.fontStyle;
        if (settings.focusMode !== undefined) dbUpdate.focus_mode = settings.focusMode;
        if (settings.semanticChunking !== undefined) dbUpdate.semantic_chunking = settings.semanticChunking;
        if (settings.minMessagesBeforeTopicChange !== undefined) dbUpdate.min_messages_before_topic_change = settings.minMessagesBeforeTopicChange;
        if (settings.topicSimilarityThreshold !== undefined) dbUpdate.topic_similarity_threshold = settings.topicSimilarityThreshold;

        const { error: updateError } = await supabase
          .from('user_settings')
          .update(dbUpdate)
          .eq('user_id', userId);
        
        if (updateError) throw updateError;
        console.log('✅ Updated user settings in Supabase:', dbUpdate);
      }
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      throw error;
    }
  },

  // Clear all data (delete all chats and messages for current user)
  async clearAll(): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      // Delete all chats (messages will be deleted by cascade)
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Clear current chat ID
      this.setCurrentChatId(null);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },
};
