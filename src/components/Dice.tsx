
import React, { useState, useEffect } from "react";

interface DiceProps {
  value: number;
  rolling: boolean;
  onRollComplete?: () => void;
}

const Dice: React.FC<DiceProps> = ({ value, rolling, onRollComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (rolling && !isAnimating) {
      setIsAnimating(true);
      
      // Animation duration
      const animationDuration = 600; // ms, matching CSS animation
      
      setTimeout(() => {
        setIsAnimating(false);
        if (onRollComplete) {
          onRollComplete();
        }
      }, animationDuration);
    }
  }, [rolling, onRollComplete]);

  // Render dice dots based on value
  const renderDots = () => {
    switch (value) {
      case 1:
        return (
          <div className="dot-container">
            <div className="dot center" />
          </div>
        );
      case 2:
        return (
          <div className="dot-container">
            <div className="dot top-left" />
            <div className="dot bottom-right" />
          </div>
        );
      case 3:
        return (
          <div className="dot-container">
            <div className="dot top-left" />
            <div className="dot center" />
            <div className="dot bottom-right" />
          </div>
        );
      case 4:
        return (
          <div className="dot-container">
            <div className="dot top-left" />
            <div className="dot top-right" />
            <div className="dot bottom-left" />
            <div className="dot bottom-right" />
          </div>
        );
      case 5:
        return (
          <div className="dot-container">
            <div className="dot top-left" />
            <div className="dot top-right" />
            <div className="dot center" />
            <div className="dot bottom-left" />
            <div className="dot bottom-right" />
          </div>
        );
      case 6:
        return (
          <div className="dot-container">
            <div className="dot top-left" />
            <div className="dot top-right" />
            <div className="dot middle-left" />
            <div className="dot middle-right" />
            <div className="dot bottom-left" />
            <div className="dot bottom-right" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`w-20 h-20 bg-white rounded-lg shadow-lg relative ${isAnimating ? 'animate-dice-roll' : ''}`}
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {renderDots()}
      </div>
      
      {/* Dice value display */}
      <div className="mt-2 text-lg font-bold">
        {isAnimating ? "Rolling..." : `Rolled: ${value}`}
      </div>
      
      {/* Dice CSS */}
      <style>
        {`
        .dot-container {
          width: 100%;
          height: 100%;
          position: relative;
        }
        
        .dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #000;
        }
        
        .center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .top-left { top: 20%; left: 20%; }
        .top-right { top: 20%; right: 20%; }
        .middle-left { top: 50%; left: 20%; transform: translateY(-50%); }
        .middle-right { top: 50%; right: 20%; transform: translateY(-50%); }
        .bottom-left { bottom: 20%; left: 20%; }
        .bottom-right { bottom: 20%; right: 20%; }
        `}
      </style>
    </div>
  );
};

export default Dice;
