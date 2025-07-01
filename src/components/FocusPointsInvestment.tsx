import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Focus, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FocusPointsInvestmentProps {
  skillName: string;
  currentXp: number;
  maxXp: number;
  availableFocusPoints: number;
  onInvestmentComplete: () => void;
}

interface InvestFocusPointsResponse {
  success: boolean;
  error?: string;
  message?: string;
  xp_gained?: number;
  new_skill_xp?: number;
  remaining_focus_points?: number;
}

const FocusPointsInvestment: React.FC<FocusPointsInvestmentProps> = ({
  skillName,
  currentXp,
  maxXp,
  availableFocusPoints,
  onInvestmentComplete
}) => {
  const [pointsToInvest, setPointsToInvest] = useState(1);
  const [isInvesting, setIsInvesting] = useState(false);
  const { toast } = useToast();

  const maxInvestablePoints = Math.min(availableFocusPoints, maxXp - currentXp);

  const handleInvestment = async () => {
    if (pointsToInvest <= 0 || pointsToInvest > maxInvestablePoints) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount of Focus Points to invest.",
        variant: "destructive",
      });
      return;
    }

    setIsInvesting(true);

    try {
      const { data, error } = await supabase.rpc('invest_focus_points', {
        skill_key_param: skillName,
        points_amount: pointsToInvest
      });

      if (error) throw error;

      const result = data as unknown as InvestFocusPointsResponse;

      if (!result.success) {
        toast({
          title: "Investment Failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Focus Points Invested!",
        description: `Invested ${pointsToInvest} Focus Points into ${skillName}. Gained ${result.xp_gained} XP!`,
        variant: "default",
      });

      onInvestmentComplete();
      setPointsToInvest(1);

    } catch (error: any) {
      console.error('Error investing focus points:', error);
      toast({
        title: "Error",
        description: "Failed to invest Focus Points",
        variant: "destructive",
      });
    } finally {
      setIsInvesting(false);
    }
  };

  const adjustPoints = (delta: number) => {
    const newAmount = pointsToInvest + delta;
    setPointsToInvest(Math.max(1, Math.min(newAmount, maxInvestablePoints)));
  };

  if (maxInvestablePoints <= 0) {
    return null;
  }

  return (
    <Card className="bg-gray-700 border-gray-600 mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center space-x-2 text-sm">
          <Focus className="w-4 h-4 text-purple-400" />
          <span>Invest Focus Points</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustPoints(-1)}
            disabled={pointsToInvest <= 1}
            className="w-8 h-8 p-0"
          >
            <Minus className="w-3 h-3" />
          </Button>
          
          <Input
            type="number"
            min="1"
            max={maxInvestablePoints}
            value={pointsToInvest}
            onChange={(e) => setPointsToInvest(Math.max(1, Math.min(parseInt(e.target.value) || 1, maxInvestablePoints)))}
            className="w-20 text-center"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustPoints(1)}
            disabled={pointsToInvest >= maxInvestablePoints}
            className="w-8 h-8 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
          
          <Button
            onClick={() => setPointsToInvest(maxInvestablePoints)}
            variant="ghost"
            size="sm"
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            Max
          </Button>
        </div>

        <div className="text-xs text-gray-400">
          Available: {availableFocusPoints} FP | Max investable: {maxInvestablePoints} FP
        </div>

        <Button 
          onClick={handleInvestment}
          disabled={isInvesting || pointsToInvest <= 0}
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          {isInvesting ? "Investing..." : `Invest ${pointsToInvest} Focus Points`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FocusPointsInvestment;
