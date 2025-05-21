
import React, { useEffect, useState } from "react";
import { formatTime } from "@/utils/gameUtils";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Timer as TimerIcon } from "lucide-react";

interface TimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onComplete: () => void;
  onReset?: () => void;
}

const Timer: React.FC<TimerProps> = ({ duration, isActive, onComplete, onReset }) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Reset timer when duration changes
    setTimeRemaining(duration);
    setProgress(100);
  }, [duration]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isActive) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timer) clearInterval(timer);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timer) {
      clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, onComplete]);

  // Update progress whenever timeRemaining changes
  useEffect(() => {
    setProgress((timeRemaining / duration) * 100);
  }, [timeRemaining, duration]);

  // Determine color based on remaining time
  const getTimerColor = () => {
    const percentage = (timeRemaining / duration) * 100;
    if (percentage > 60) return "bg-cyan-500";
    if (percentage > 30) return "bg-cyan-400";
    return "bg-cyan-300";
  };

  const handleResetTimer = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="bg-purple-800 p-4 rounded-lg shadow-md text-magenta-500">
      <div className="flex items-center gap-2 mb-2">
        <TimerIcon className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-bold">Timer</h2>
      </div>
      
      <div className="text-center text-2xl font-bold mb-2 text-magenta-400">
        {formatTime(timeRemaining)}
      </div>
      
      <Progress 
        value={progress} 
        className="h-2 bg-purple-600"
      >
        <div 
          className={cn("h-full transition-all", getTimerColor())} 
          style={{ width: `${progress}%` }}
        />
      </Progress>
      
      <div className="text-center mt-2 text-xs text-magenta-300">
        {isActive ? "Timer running..." : "Timer inactive"}
      </div>
    </div>
  );
};

export default Timer;
