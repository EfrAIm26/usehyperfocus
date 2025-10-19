// UserProfile component - Shows user info and sign out button
import { useState } from 'react';
import { FiLogOut, FiUser, FiChevronUp } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatar = user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      {/* Dropdown menu */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <button
              onClick={signOut}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left text-red-600"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        </>
      )}

      {/* User button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 bg-white"
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <img 
              src={avatar} 
              alt={displayName}
              className="w-10 h-10 rounded-full ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
              <FiUser className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* User info */}
        <div className="flex-1 text-left overflow-hidden">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
        </div>

        {/* Expand icon */}
        <FiChevronUp 
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-0' : 'rotate-180'
          }`}
        />
      </button>
    </div>
  );
}

