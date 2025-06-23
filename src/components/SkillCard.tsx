
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Star, Lock, Focus } from 'lucide-react';
import FocusPointsInvestment from './FocusPointsInvestment';

interface SkillCardProps {
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  maxXp: number;
  skillPoints: number;
  focusPoints: number;
  onUpgrade: (skillName: string) => void;
  onFocusPointsInvested: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({
  name,
  level,
  maxLevel,
  xp,
  maxXp,
  skillPoints,
  focusPoints,
  onUpgrade,
  onFocusPointsInvested
}) => {
  const [showFocusInvestment, setShowFocusInvestment] = useState(false);
  
  const canUpgrade = skillPoints >= 1 && xp >= maxXp && level < maxLevel;
  const isMaxed = level === maxLevel;
  const canInvestFocusPoints = focusPoints > 0 && xp < maxXp && level < maxLevel;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            {isMaxed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : level > 1 ? (
              <Star className="w-5 h-5 text-yellow-500" />
            ) : (
              <Lock className="w-5 h-5 text-gray-500" />
            )}
            <span>{name}</span>
          </CardTitle>
          <Badge 
            variant={level > 1 ? "default" : "secondary"}
            className={level > 1 ? "bg-blue-600" : ""}
          >
            Level {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{xp}/{maxXp} XP</span>
            </div>
            <Progress 
              value={(xp / maxXp) * 100} 
              className="h-2"
            />
          </div>
          
          {!isMaxed && (
            <div className="space-y-2">
              <Button 
                className="w-full"
                disabled={!canUpgrade}
                onClick={() => onUpgrade(name)}
              >
                {skillPoints < 1 
                  ? "No Skill Points" 
                  : xp < maxXp 
                    ? `Need ${maxXp - xp} more XP`
                    : "Upgrade (1 SP)"
                }
              </Button>

              {canInvestFocusPoints && (
                <Button
                  variant="outline"
                  className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                  onClick={() => setShowFocusInvestment(!showFocusInvestment)}
                >
                  <Focus className="w-4 h-4 mr-2" />
                  {showFocusInvestment ? 'Hide' : 'Use Focus Points'}
                </Button>
              )}
            </div>
          )}
          
          {isMaxed && (
            <div className="text-center text-green-400 font-medium">
              ✨ Mastered
            </div>
          )}

          {showFocusInvestment && canInvestFocusPoints && (
            <FocusPointsInvestment
              skillName={name}
              currentXp={xp}
              maxXp={maxXp}
              availableFocusPoints={focusPoints}
              onInvestmentComplete={() => {
                onFocusPointsInvested();
                setShowFocusInvestment(false);
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillCard;
