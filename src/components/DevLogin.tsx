// DEV ONLY: Bypass login for debugging
// This component only appears in localhost
import { useState } from 'react';

export default function DevLogin() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Only show in localhost
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return null;
  }

  const handleDevLogin = async () => {
    try {
      console.log('🔧 DEV LOGIN: Starting bypass...');
      
      // Create a mock session with the real user_id
      const mockSession = {
        access_token: 'dev-bypass-token',
        refresh_token: 'dev-bypass-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: '2a6d46ea-f9b9-4ac0-8cb8-473db732db7e',
          email: 'efraimrodic@gmail.com',
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          created_at: new Date().toISOString(),
        }
      };

      // Store in localStorage to persist across refreshes
      localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
      
      console.log('🔧 DEV LOGIN: Session created, reloading...');
      
      // Force page reload to trigger auth state
      window.location.reload();
    } catch (error) {
      console.error('🔧 DEV LOGIN ERROR:', error);
      alert('Dev login failed: ' + error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="w-12 h-12 bg-yellow-500 rounded-full opacity-30 hover:opacity-100 transition-opacity"
          title="Dev Login (localhost only)"
        >
          🔧
        </button>
      ) : (
        <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 shadow-xl">
          <div className="text-sm font-bold text-yellow-900 mb-2">
            DEV MODE (localhost only)
          </div>
          <button
            onClick={handleDevLogin}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-medium"
          >
            Bypass Login
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="w-full mt-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
          <div className="text-xs text-yellow-800 mt-2">
            User: efraimrodic@gmail.com
          </div>
        </div>
      )}
    </div>
  );
}

