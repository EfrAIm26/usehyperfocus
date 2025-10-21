// Diagnostic script to check Supabase connection and tables
import { supabase } from './supabase';

export const diagnostic = {
  async checkConnection() {
    try {
      console.log('🔍 Checking Supabase connection...');
      const { error } = await supabase.from('chats').select('count').limit(1);
      if (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
      }
      console.log('✅ Supabase connection OK');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }
  },

  async checkTables() {
    try {
      console.log('🔍 Checking if tables exist...');
      
      // Check chats table
      const { error: chatsError } = await supabase
        .from('chats')
        .select('id')
        .limit(1);
      
      if (chatsError) {
        console.error('❌ Chats table error:', chatsError);
        return false;
      }
      console.log('✅ Chats table exists');

      // Check messages table
      const { error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .limit(1);
      
      if (messagesError) {
        console.error('❌ Messages table error:', messagesError);
        return false;
      }
      console.log('✅ Messages table exists');

      // Check user_settings table
      const { error: settingsError } = await supabase
        .from('user_settings')
        .select('id')
        .limit(1);
      
      if (settingsError) {
        console.error('❌ User settings table error:', settingsError);
        return false;
      }
      console.log('✅ User settings table exists');

      return true;
    } catch (error) {
      console.error('❌ Table check error:', error);
      return false;
    }
  },

  async checkAuth() {
    try {
      console.log('🔍 Checking authentication...');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Auth error:', error);
        return false;
      }
      
      if (!user) {
        console.error('❌ No user authenticated');
        return false;
      }
      
      console.log('✅ User authenticated:', user.email);
      return true;
    } catch (error) {
      console.error('❌ Auth check error:', error);
      return false;
    }
  },

  async runFullDiagnostic() {
    console.log('🚀 Running full Supabase diagnostic...');
    
    const connection = await this.checkConnection();
    const auth = await this.checkAuth();
    const tables = await this.checkTables();
    
    console.log('📊 Diagnostic Results:');
    console.log('  Connection:', connection ? '✅' : '❌');
    console.log('  Auth:', auth ? '✅' : '❌');
    console.log('  Tables:', tables ? '✅' : '❌');
    
    return { connection, auth, tables };
  }
};

