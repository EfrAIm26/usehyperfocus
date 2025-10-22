// Login page - Modern, minimalist design inspired by ChatGPT/Zipna
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { signInWithGoogle, isLoading } = useAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Modern gradient background - soft blues and violets */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated gradient orbs for depth */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Card with glassmorphism effect */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-200/50 p-12 border border-white/20">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo_sinfondo.png" 
              alt="Hyperfocus AI" 
              className="h-20 w-20 drop-shadow-lg animate-in zoom-in duration-300"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-3">
            Hyperfocus AI
          </h1>

          {/* Subtitle */}
          <p className="text-center text-gray-600 mb-12 text-lg">
            Empowering the way your brain works best
          </p>

          {/* Sign in button */}
          <button
            onClick={signInWithGoogle}
            disabled={isLoading}
            className={`
              w-full flex items-center justify-center gap-4 
              px-6 py-4 rounded-xl
              bg-white border-2 border-gray-200
              hover:border-gray-300 hover:shadow-lg
              transition-all duration-200
              text-gray-700 font-semibold text-lg
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
            `}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <FaGoogle className="w-6 h-6 text-blue-500" />
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Additional info */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Built for neurodivergent minds to maximize concentration and learning
          </p>
          {/* Small change for user deployment */}
        </div>

      </div>
    </div>
  );
}

