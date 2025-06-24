
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Crown, Shirt, Sparkles } from 'lucide-react';

interface AvatarPreviewProps {
  equippedHat?: string | null;
  equippedOutfit?: string | null;
  equippedAura?: string | null;
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  equippedHat,
  equippedOutfit,
  equippedAura
}) => {
  const getHatIcon = (hatKey?: string | null) => {
    if (!hatKey) return null;
    return <Crown className="w-8 h-8 text-yellow-500 absolute -top-2 left-1/2 transform -translate-x-1/2" />;
  };

  const getOutfitStyle = (outfitKey?: string | null) => {
    if (!outfitKey) return {};
    switch (outfitKey) {
      case 'trading_cap':
        return { backgroundColor: '#1f2937' };
      case 'dark_blue_theme':
        return { backgroundColor: '#1e3a8a' };
      default:
        return {};
    }
  };

  const getAuraEffect = (auraKey?: string | null) => {
    if (!auraKey) return null;
    switch (auraKey) {
      case 'golden_badge':
        return (
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400 opacity-60 animate-pulse"></div>
        );
      case 'vip_border':
        return (
          <div className="absolute inset-0 rounded-full border-4 border-purple-500 opacity-60 animate-pulse shadow-lg shadow-purple-500/50"></div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 h-full">
      <CardContent className="p-8 flex flex-col items-center justify-center h-full">
        <h3 className="text-xl font-bold text-white mb-8">Avatar Preview</h3>
        
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Aura Effect (behind avatar) */}
          {getAuraEffect(equippedAura)}
          
          {/* Base Avatar */}
          <div 
            className="w-32 h-32 rounded-full border-4 border-gray-600 flex items-center justify-center relative transition-all duration-300"
            style={getOutfitStyle(equippedOutfit)}
          >
            <User className="w-16 h-16 text-gray-300" />
            
            {/* Hat Layer */}
            {getHatIcon(equippedHat)}
            
            {/* Outfit Layer Effects */}
            {equippedOutfit && (
              <Shirt className="w-6 h-6 text-white absolute bottom-2 right-2" />
            )}
          </div>
          
          {/* Sparkles for cosmetic effects */}
          {equippedAura && (
            <>
              <Sparkles className="w-4 h-4 text-yellow-400 absolute top-4 right-4 animate-bounce" />
              <Sparkles className="w-3 h-3 text-blue-400 absolute bottom-8 left-4 animate-bounce delay-300" />
              <Sparkles className="w-4 h-4 text-purple-400 absolute top-8 left-2 animate-bounce delay-700" />
            </>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {equippedHat || equippedOutfit || equippedAura 
              ? "Your customized avatar"
              : "Equip items to customize your avatar"
            }
          </p>
          
          {/* Show equipped items */}
          <div className="mt-4 space-y-1">
            {equippedHat && (
              <div className="text-xs text-yellow-400">Hat: {equippedHat}</div>
            )}
            {equippedOutfit && (
              <div className="text-xs text-blue-400">Outfit: {equippedOutfit}</div>
            )}
            {equippedAura && (
              <div className="text-xs text-purple-400">Aura: {equippedAura}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarPreview;
