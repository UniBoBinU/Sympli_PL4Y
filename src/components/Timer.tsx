
import React, { useEffect, useState } from "react";
import { formatTime } from "@/utils/gameUtils";
import { Progress } from "@/components/ui/progress";

interface TimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onComplete: () => void;
}

const Timer: React.FC<TimerProps> = ({ duration, isActive, onComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Reset timer when duration changes
    setTimeRemaining(duration);
    setProgress(100);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });

      // Update progress percentage
      setProgress((timeRemaining / duration) * 100);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, duration, timeRemaining, onComplete]);

  // Determine color based on remaining time
  const getTimerColor = () => {
    const percentage = (timeRemaining / duration) * 100;
    if (percentage > 60) return "bg-green-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-2">Timer</h2>
      
      <div className="text-center text-2xl font-bold mb-2">
        {formatTime(timeRemaining)}
      </div>
      
      <Progress 
        value={progress} 
        className="h-2"
        indicatorClassName={getTimerColor()}
      />
      
      <div className="text-center mt-2 text-xs text-gray-500">
        {isActive ? "Timer running..." : "Timer inactive"}
      </div>
    </div>
  );
};

export default Timer;
