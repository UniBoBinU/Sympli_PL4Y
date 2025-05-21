
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
    if (percentage > 60) return "bg-[#0085FB]";
    if (percentage > 30) return "bg-[#0085FB]/80";
    return "bg-[#0085FB]/60";
  };

  const handleResetTimer = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="bg-[#4C038E] p-4 rounded-lg shadow-md text-[#FB007C]">
      <div className="flex items-center gap-2 mb-2">
        <TimerIcon className="h-5 w-5 text-[#0085FB]" />
        <h2 className="text-lg font-bold">Timer</h2>
      </div>
      
      <div className="text-center text-2xl font-bold mb-2 text-[#FB007C]">
        {formatTime(timeRemaining)}
      </div>
      
      <Progress value={progress} className="h-2 bg-[#4C038E]/60">
        <div 
          className={cn("h-full transition-all", getTimerColor())} 
          style={{ width: `${progress}%` }}
        />
      </Progress>
      
      <div className="text-center mt-2 text-xs text-[#07F9AF]">
        {isActive ? "Timer running..." : "Timer inactive"}
      </div>
    </div>
  );
};

export default Timer;
