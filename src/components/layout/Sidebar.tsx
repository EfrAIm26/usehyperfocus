// Sidebar component - Chat history and new chat button with drag-and-drop
import React from 'react';
import { FiPlus, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Chat } from '../../types';
import { formatDate } from '../../lib/utils';
import { storage } from '../../lib/storage';
import UserProfile from './UserProfile';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

interface SortableChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function SortableChatItem({ chat, isSelected, onSelect, onDelete }: SortableChatItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-move transition-colors ${
        isSelected
          ? 'bg-white shadow-sm'
          : 'hover:bg-white/50'
      }`}
    >
      <FiMessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
      
      <div className="flex-1 min-w-0" onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}>
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
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
        title="Delete chat"
      >
        <FiTrash2 className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
}

export default function Sidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: SidebarProps) {
  const [isCreating, setIsCreating] = React.useState(false);
  const [localChats, setLocalChats] = React.useState(chats);

  // Sync with parent chats
  React.useEffect(() => {
    setLocalChats(chats);
  }, [chats]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleNewChat = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      await onNewChat();
    } finally {
      setTimeout(() => setIsCreating(false), 500);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localChats.findIndex((chat) => chat.id === active.id);
      const newIndex = localChats.findIndex((chat) => chat.id === over.id);

      const newOrder = arrayMove(localChats, oldIndex, newIndex);
      setLocalChats(newOrder);

      // Persist the new order in storage
      try {
        for (const [index, chat] of newOrder.entries()) {
          const updatedChat = {
            ...chat,
            updatedAt: Date.now() - (newOrder.length - index), // Preserve visual order
          };
          await storage.saveChat(updatedChat);
        }
      } catch (error) {
        console.error('❌ Error persisting chat order:', error);
      }
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

      {/* Chat list with drag-and-drop */}
      <div className="flex-1 overflow-y-auto">
        {localChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localChats.map((chat) => chat.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="p-2 space-y-1">
                {localChats.map((chat) => (
                  <SortableChatItem
                    key={chat.id}
                    chat={chat}
                    isSelected={currentChatId === chat.id}
                    onSelect={() => onSelectChat(chat.id)}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* User profile at the bottom */}
      <div className="p-3 border-t border-border bg-white">
        <UserProfile />
      </div>
    </div>
  );
}


