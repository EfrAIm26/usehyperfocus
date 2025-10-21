// Core types for Hyperfocus AI

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mermaidCode?: string | null;
  semanticChunks?: Array<{
    type: 'definition' | 'example' | 'action' | 'keypoint' | 'explanation';
    content: string;
  }> | null;
  appliedFontStyle?: 'bionic' | 'dyslexic' | 'normal' | 'lexend'; // Settings frozen at render time
  appliedChunking?: boolean;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  topic: string | null; // Current focus topic
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

// Supabase database types
export interface DbMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  mermaid_code?: string | null;
  semantic_chunks?: Array<{
    type: 'definition' | 'example' | 'action' | 'keypoint' | 'explanation';
    content: string;
  }> | null;
  applied_font_style?: 'bionic' | 'dyslexic' | 'normal' | 'lexend' | null;
  applied_chunking?: boolean | null;
  created_at: string;
}

export interface DbChat {
  id: string;
  user_id: string;
  title: string;
  topic?: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbUserSettings {
  id: string;
  user_id: string;
  font_style: 'bionic' | 'dyslexic' | 'normal' | 'lexend';
  focus_mode: 'default' | 'hyperfocus';
  semantic_chunking: boolean;
  min_messages_before_topic_change: number;
  topic_similarity_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface HyperfocusState {
  currentTopic: string | null;
  isDistracted: boolean;
  messageCount: number;
  topicConfidence: number; // 0-100 percentage
}

export interface Settings {
  fontStyle: 'bionic' | 'dyslexic' | 'normal' | 'lexend';
  focusMode: 'default' | 'hyperfocus'; // Simplified: default (free conversation) or hyperfocus (topic-based)
  semanticChunking: boolean; // Enable/disable color-coded semantic sections
  minMessagesBeforeTopicChange: number; // Minimum messages before allowing topic change (kept for backward compatibility)
  topicSimilarityThreshold: number; // Percentage threshold for topic similarity (0-100) (kept for backward compatibility)
}

export interface StorageSchema {
  chats: Chat[];
  currentChatId: string | null;
  settings: Settings;
}

export type FontStyle = 'bionic' | 'dyslexic' | 'normal' | 'lexend';

export type ChunkType = 'definition' | 'example' | 'action' | 'keypoint' | 'explanation';

export interface SemanticChunk {
  type: ChunkType;
  content: string;
}

export interface DiagramDetectionResult {
  hasDiagram: boolean;
  mermaidCode: string | null;
  explanation: string;
}

