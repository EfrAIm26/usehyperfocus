// TopBar component - Header with logo and settings
import { FiTool } from 'react-icons/fi';

interface TopBarProps {
  onSettingsClick: () => void;
}

export default function TopBar({ onSettingsClick }: TopBarProps) {
  return (
    <div className="h-16 border-b border-border bg-bg-primary px-6 flex items-center justify-between">
      {/* Logo and title */}
      <div className="flex items-center gap-3">
        <img 
          src="/logo_sinfondo.png" 
          alt="Hyperfocus AI" 
          className="h-8 w-8 object-contain"
        />
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            Hyperfocus AI
          </h1>
          <p className="text-xs text-gray-500">
            Empowering the way your brain works best
          </p>
        </div>
      </div>

      {/* Settings button */}
      <button
        onClick={onSettingsClick}
        className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
        title="Settings"
      >
        <FiTool className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}

