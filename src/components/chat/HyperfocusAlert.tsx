// HyperfocusAlert component - Alert when user gets distracted
import { FiAlertCircle, FiMessageSquare } from 'react-icons/fi';

interface HyperfocusAlertProps {
  currentTopic: string;
  newTopic: string;
  confidence: number;
  onContinue: () => void;
  onNewChat: () => void;
}

export default function HyperfocusAlert({
  currentTopic,
  newTopic,
  confidence,
  onContinue,
  onNewChat,
}: HyperfocusAlertProps) {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Icon and title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <FiAlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-text-primary mb-1">
              🎯 Stay Focused!
            </h3>
            <p className="text-sm text-gray-600">
              It looks like you're trying to switch topics
            </p>
          </div>
        </div>

        {/* Topic comparison */}
        <div className="mb-6 p-4 bg-bg-secondary rounded-lg space-y-3">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Current Focus
            </div>
            <div className="text-sm font-medium text-text-primary">
              📌 {currentTopic}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
              New Topic Detected
            </div>
            <div className="text-sm text-gray-700">
              ➡️ {newTopic}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Similarity Score
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    confidence >= 60 ? 'bg-green-500' : confidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{Math.round(confidence)}%</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-700 mb-6">
          To maximize your learning and concentration, finish exploring your current topic first, 
          or start a new chat for a different subject.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Continue Current Topic
          </button>
          <button
            onClick={onNewChat}
            className="flex-1 px-4 py-2.5 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FiMessageSquare className="w-4 h-4" />
            New Chat
          </button>
        </div>
      </div>
    </div>
  );
}


