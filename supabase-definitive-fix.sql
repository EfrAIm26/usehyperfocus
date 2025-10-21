-- ================================================
-- DEFINITIVE FIX - FORCE CREATE HIERARCHICAL STRUCTURE
-- Execute this ENTIRE script in Supabase SQL Editor
-- ================================================

-- 1. DROP EVERYTHING FIRST
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- 2. CREATE USER_SETTINGS TABLE (1:1 with auth.users)
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    current_chat_id TEXT,
    font_style TEXT NOT NULL DEFAULT 'normal' CHECK (font_style IN ('bionic', 'normal', 'dyslexic', 'lexend')),
    focus_mode TEXT NOT NULL DEFAULT 'hyperfocus' CHECK (focus_mode IN ('hyperfocus', 'default')),
    semantic_chunking BOOLEAN NOT NULL DEFAULT false,
    min_messages_before_topic_change INTEGER NOT NULL DEFAULT 3,
    topic_similarity_threshold REAL NOT NULL DEFAULT 0.7,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CREATE CHATS TABLE (1:many with auth.users)
CREATE TABLE chats (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE MESSAGES TABLE (many:1 with chats)
CREATE TABLE messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    mermaid_code TEXT,
    semantic_chunks JSONB,
    applied_font_style TEXT,
    applied_chunking BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE INDEXES
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at ASC);

-- 6. CREATE TRIGGER FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE TRIGGERS
CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. ENABLE RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 9. CREATE RLS POLICIES
CREATE POLICY "user_settings_policy" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "chats_policy" ON chats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "messages_policy" ON messages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM chats 
        WHERE chats.id = messages.chat_id 
        AND chats.user_id = auth.uid()
    )
);

-- 10. SUCCESS MESSAGE
SELECT 'SUCCESS: Definitive hierarchical structure created!' as status;
