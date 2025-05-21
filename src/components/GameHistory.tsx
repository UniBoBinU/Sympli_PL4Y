
import React, { useRef, useEffect } from "react";
import { GameEvent } from "@/utils/gameTypes";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GameHistoryProps {
  events: GameEvent[];
  players: { id: number; name: string; color: string }[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ events, players }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever events change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [events]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get player name by ID
  const getPlayerName = (id: number) => {
    const player = players.find(p => p.id === id);
    return player ? player.name : "Unknown Player";
  };

  // Get player color by ID
  const getPlayerColor = (id: number) => {
    const player = players.find(p => p.id === id);
    return player ? player.color : "#888888";
  };

  // Filter only ACTION type events
  const actionEvents = events.filter(event => event.type === "ACTION" || event.type === "CHOICE");

  return (
    <div className="bg-[#6604A0] p-4 rounded-lg shadow-md h-60 text-[#FB007C]">
      <h2 className="text-lg font-bold mb-2">Action History</h2>
      
      {actionEvents.length === 0 ? (
        <div className="text-[#FB007C]/80 text-center py-4">
          No actions recorded yet.
        </div>
      ) : (
        <ScrollArea className="h-44" ref={scrollAreaRef}>
          <div className="space-y-2 pr-4">
            {actionEvents.map((event, index) => (
              <div key={event.id} className="text-sm border-l-2 pl-2" style={{ borderColor: getPlayerColor(event.playerId) }}>
                <div className="flex justify-between text-xs text-[#FB007C]/80">
                  <span>#{index + 1}</span>
                  <span>{getPlayerName(event.playerId)}</span>
                </div>
                <p className="text-[#FB007C]">{event.description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default GameHistory;
