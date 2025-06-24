
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface GuildHeaderProps {
  guildName: string;
  guildDescription: string | null;
  onBack: () => void;
}

const GuildHeader = ({ guildName, guildDescription, onBack }: GuildHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">{guildName}</h1>
          <p className="text-gray-400">{guildDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default GuildHeader;
