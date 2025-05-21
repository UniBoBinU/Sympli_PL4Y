
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Action, ActionType } from "@/utils/gameTypes";

interface ActionCardProps {
  action: Action | null;
  onComplete: () => void;
  onChoice?: (option: string) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onComplete,
  onChoice
}) => {
  if (!action) {
    return (
      <Card className="w-full bg-white">
        <CardHeader>
          <CardTitle className="text-center">No Action</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-500">
          Roll the dice to draw an action
        </CardContent>
      </Card>
    );
  }

  const renderContent = () => {
    switch (action.type) {
      case ActionType.CHOICE:
        return (
          <>
            <CardContent className="text-center">
              <p>{action.text}</p>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              {action.options?.map((option, index) => (
                <Button 
                  key={index} 
                  variant="outline"
                  onClick={() => onChoice && onChoice(option)}
                >
                  {option}
                </Button>
              ))}
            </CardFooter>
          </>
        );
      
      case ActionType.POSITION:
        return (
          <>
            <CardContent className="flex flex-col items-center">
              <p className="mb-4 text-center">{action.text}</p>
              {action.imageUrl && (
                <div 
                  className="w-full h-48 bg-cover bg-center rounded-md mb-4"
                  style={{ backgroundImage: `url(${action.imageUrl})` }}
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={onComplete}>Complete</Button>
            </CardFooter>
          </>
        );
      
      default:
        return (
          <>
            <CardContent className="text-center">
              <p>{action.text}</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={onComplete}>Complete</Button>
            </CardFooter>
          </>
        );
    }
  };

  // Choose card color based on action type
  const getTypeColor = () => {
    switch (action.type) {
      case ActionType.DRINK:
        return "bg-blue-50";
      case ActionType.QUESTION:
        return "bg-purple-50";
      case ActionType.DARE:
        return "bg-orange-50";
      case ActionType.EVENT:
        return "bg-green-50";
      case ActionType.POSITION:
        return "bg-red-50";
      case ActionType.CHOICE:
        return "bg-yellow-50";
      default:
        return "bg-white";
    }
  };

  return (
    <Card className={`w-full ${getTypeColor()}`}>
      <CardHeader>
        <CardTitle className="text-center">{action.type}</CardTitle>
      </CardHeader>
      {renderContent()}
    </Card>
  );
};

export default ActionCard;
