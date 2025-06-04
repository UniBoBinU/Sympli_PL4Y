
import React, { useState, useEffect } from "react";

interface ClassDiceProps {
  selectedClass: string | null;
  rolling: boolean;
  onRollComplete?: () => void;
  classes: string[];
}

const ClassDice: React.FC<ClassDiceProps> = ({ 
  selectedClass, 
  rolling, 
  onRollComplete, 
  classes 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevRolling, setPrevRolling] = useState(false);
  const [displayClass, setDisplayClass] = useState<string>(classes[0]);

  useEffect(() => {
    // Only trigger animation when rolling changes from false to true
    if (rolling && !prevRolling) {
      setIsAnimating(true);
      
      // Show random classes during animation
      const animationInterval = setInterval(() => {
        setDisplayClass(classes[Math.floor(Math.random() * classes.length)]);
      }, 100);
      
      // Animation duration
      const animationDuration = 1000; // ms
      
      setTimeout(() => {
        clearInterval(animationInterval);
        setIsAnimating(false);
        if (selectedClass) {
          setDisplayClass(selectedClass);
        }
        if (onRollComplete) {
          onRollComplete();
        }
      }, animationDuration);
    }
    
    // Update previous rolling state
    setPrevRolling(rolling);
  }, [rolling, onRollComplete, prevRolling, selectedClass, classes]);

  // Update display when selectedClass changes
  useEffect(() => {
    if (selectedClass && !isAnimating) {
      setDisplayClass(selectedClass);
    }
  }, [selectedClass, isAnimating]);

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`w-48 h-48 bg-white rounded-lg shadow-lg flex items-center justify-center border-4 border-[#FB007C] ${isAnimating ? 'animate-dice-roll' : ''}`}
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="text-center p-4">
          <div className="text-2xl font-bold text-[#6604A0] capitalize mb-2">
            {displayClass}
          </div>
          <div className="text-sm text-gray-600">
            Class
          </div>
        </div>
      </div>
      
      {/* Status display */}
      <div className="mt-4 text-lg font-bold text-center">
        {isAnimating ? "Rolling..." : selectedClass ? `Rolled: ${selectedClass}` : "Ready to roll"}
      </div>
    </div>
  );
};

export default ClassDice;
