-- ================================================
-- FINAL SUPABASE FIX - SIMPLE AND WORKING
-- Execute this ENTIRE script in Supabase SQL Editor
-- ================================================

-- 1. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can insert their convivs" ON chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON chats;

DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;

-- 2. Ensure current_chat_id column exists
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS current_chat_id TEXT;

-- 3. Create simple, working RLS policies
CREATE POLICY "chats_policy" ON chats FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "messages_policy" ON messages FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_settings_policy" ON user_settings FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 4. Ensure RLS is enabled
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 5. Success message
SELECT 'SUCCESS: Database fixed!' as status;

