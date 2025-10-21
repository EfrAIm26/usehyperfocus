-- ================================================
-- UPDATE DEFAULT SETTINGS FOR EXISTING USERS
-- Execute this in Supabase SQL Editor
-- ================================================

-- Update existing user_settings to new defaults
UPDATE user_settings
SET 
    font_style = 'normal',
    semantic_chunking = false
WHERE font_style = 'bionic' OR semantic_chunking = true;

-- Verify the update
SELECT 
    user_id,
    font_style,
    focus_mode,
    semantic_chunking
FROM user_settings;

-- Success message
SELECT 'SUCCESS: Default settings updated for all users!' as status;
