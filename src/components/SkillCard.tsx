
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Star, Lock } from 'lucide-react';

interface SkillCardProps {
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  maxXp: number;
  skillPoints: number;
  onUpgrade: (skillName: string) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({
  name,
  level,
  maxLevel,
  xp,
  maxXp,
  skillPoints,
  onUpgrade
}) => {
  const canUpgrade = skillPoints >= 1 && xp >= maxXp && level < maxLevel;
  const isMaxed = level === maxLevel;

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
          )}
          
          {isMaxed && (
            <div className="text-center text-green-400 font-medium">
              ✨ Mastered
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillCard;
