
import React from "react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onResetGame: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onResetGame }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#6604A0] border-b border-[#FB007C]/20 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold text-[#FB007C]">PL4Y Board Game</h1>
          
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-[#FB007C]/10 text-[#FB007C] rounded-t-lg border-b-2 border-transparent hover:border-[#FB007C] transition-colors text-sm">
              Tell Me How You Like It
            </button>
            <button className="px-3 py-1 bg-[#FB007C]/10 text-[#FB007C] rounded-t-lg border-b-2 border-transparent hover:border-[#FB007C] transition-colors text-sm">
              Save/Load
            </button>
            <button className="px-3 py-1 bg-[#FB007C]/10 text-[#FB007C] rounded-t-lg border-b-2 border-transparent hover:border-[#FB007C] transition-colors text-sm">
              About
            </button>
            <button className="px-3 py-1 bg-[#FB007C]/10 text-[#FB007C] rounded-t-lg border-b-2 border-transparent hover:border-[#FB007C] transition-colors text-sm">
              Rules
            </button>
          </div>
        </div>
        
        <Button 
          onClick={onResetGame} 
          variant="outline" 
          className="bg-[#0085FB] text-[#6604A0] hover:bg-[#0085FB]/80 border-[#0085FB]"
        >
          New Game
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
