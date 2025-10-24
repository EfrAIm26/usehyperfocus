// Hyperfocus Setup Component - Task and Timer configuration
import React, { useState, useEffect } from 'react';
import { FiTarget, FiClock, FiPlay, FiPause, FiX } from 'react-icons/fi';

interface HyperfocusSetupProps {
  focusTask: string | null;
  timerDuration: number | null;
  onTaskChange: (task: string) => void;
  onTimerStart: (duration: number) => void;
  onTimerStop: () => void;
}

const PRESET_DURATIONS = [
  { label: '25 min', value: 25 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
];

export default function HyperfocusSetup({
  focusTask,
  timerDuration,
  onTaskChange,
  onTimerStart,
  onTimerStop,
}: HyperfocusSetupProps) {
  const [task, setTask] = useState(focusTask || '');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Initialize timer if duration is set
  useEffect(() => {
    if (timerDuration && !timerActive) {
      setTimeRemaining(timerDuration * 60); // Convert to seconds
      setTimerActive(true);
    }
  }, [timerDuration]);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          setTimerActive(false);
          onTimerStop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, onTimerStop]);

  const handleTaskSubmit = () => {
    if (task.trim()) {
      onTaskChange(task.trim());
    }
  };

  const handlePresetTimer = (minutes: number) => {
    setTimeRemaining(minutes * 60);
    setTimerActive(true);
    onTimerStart(minutes);
  };

  const handleCustomTimer = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0 && minutes <= 240) { // Max 4 hours
      setTimeRemaining(minutes * 60);
      setTimerActive(true);
      setShowCustomTime(false);
      setCustomMinutes('');
      onTimerStart(minutes);
    }
  };

  const handleStopTimer = () => {
    setTimerActive(false);
    setTimeRemaining(null);
    onTimerStop();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Task Input */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <FiTarget className="w-4 h-4 text-primary" />
          Task to Focus On
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onBlur={handleTaskSubmit}
            onKeyPress={(e) => e.key === 'Enter' && handleTaskSubmit()}
            placeholder="e.g., Learn React hooks, Write essay..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        {focusTask && (
          <p className="mt-1 text-xs text-gray-500">
            Current focus: <span className="font-medium text-primary">{focusTask}</span>
          </p>
        )}
      </div>

      {/* Timer Section */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <FiClock className="w-4 h-4 text-primary" />
          Pomodoro Timer (Optional)
        </label>

        {timerActive && timeRemaining !== null ? (
          /* Active Timer Display */
          <div className="bg-gradient-to-r from-primary/10 to-purple-50 border-2 border-primary rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-primary">{formatTime(timeRemaining)}</div>
                <div className="text-xs text-gray-600 mt-1">Time remaining</div>
              </div>
              <button
                onClick={handleStopTimer}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                title="Stop timer"
              >
                <FiX className="w-5 h-5 text-red-600" />
              </button>
            </div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{
                  width: `${timerDuration ? ((timerDuration * 60 - timeRemaining) / (timerDuration * 60)) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ) : (
          /* Timer Setup */
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetTimer(preset.value)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {!showCustomTime ? (
              <button
                onClick={() => setShowCustomTime(true)}
                className="w-full text-sm text-primary hover:text-primary/80 transition-colors"
              >
                + Custom time
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="Minutes"
                  min="1"
                  max="240"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  onClick={handleCustomTimer}
                  disabled={!customMinutes || parseInt(customMinutes) <= 0}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Start
                </button>
                <button
                  onClick={() => {
                    setShowCustomTime(false);
                    setCustomMinutes('');
                  }}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">How it works:</p>
        <ul className="space-y-1 ml-4 list-disc">
          <li>Set your task to stay focused</li>
          <li>Optional timer helps with time management</li>
          <li>AI will alert you if you go off-topic</li>
        </ul>
      </div>
    </div>
  );
}

