-- SQL para agregar el campo current_chat_id a user_settings
-- Ejecuta esto en el SQL Editor de Supabase

ALTER TABLE user_settings 
ADD COLUMN current_chat_id TEXT;

-- Opcional: agregar índice para performance
CREATE INDEX idx_user_settings_current_chat_id ON user_settings(current_chat_id);


