// Sidebar component - Chat history and new chat button
import React from 'react';
import { FiPlus, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import type { Chat } from '../../types';
import { formatDate } from '../../lib/utils';
import UserProfile from './UserProfile';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function Sidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: SidebarProps) {
  const [isCreating, setIsCreating] = React.useState(false);

  const handleNewChat = async () => {
    if (isCreating) return; // Prevent double click
    
    setIsCreating(true);
    try {
      await onNewChat();
    } finally {
      setTimeout(() => setIsCreating(false), 500); // Reset after 500ms
    }
  };

  return (
    <div className="w-60 border-r border-border bg-bg-secondary flex flex-col h-full">
      {/* New Chat button */}
      <div className="p-4 border-b border-border">
        <button
          onClick={handleNewChat}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus className="w-5 h-5" />
          {isCreating ? 'Creating...' : 'New Chat'}
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-white/50'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <FiMessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {chat.title}
                  </div>
                  {chat.topic && (
                    <div className="text-xs text-gray-500 truncate">
                      📌 {chat.topic}
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    {formatDate(chat.updatedAt)}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
                  title="Delete chat"
                >
                  <FiTrash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User profile at the bottom */}
      <div className="p-3 border-t border-border bg-white">
        <UserProfile />
      </div>
    </div>
  );
}


