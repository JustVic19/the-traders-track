
import React from 'react';
import SkillCard from './SkillCard';

interface SkillData {
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  xp: number;
  maxXp: number;
  unlocked: boolean;
  isPremium?: boolean;
}

interface SkillBranchProps {
  title: string;
  color: string;
  skills: SkillData[];
  userSkills: any[];
  onSkillUpgrade: (skillName: string) => void;
}

const SkillBranch: React.FC<SkillBranchProps> = ({
  title,
  color,
  skills,
  userSkills,
  onSkillUpgrade
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'border-red-500 text-red-400';
      case 'blue':
        return 'border-blue-500 text-blue-400';
      case 'purple':
        return 'border-purple-500 text-purple-400';
      default:
        return 'border-gray-500 text-gray-400';
    }
  };

  return (
    <div className={`border-l-4 ${getColorClasses(color)} pl-6`}>
      <h3 className={`text-xl font-bold mb-6 ${getColorClasses(color)}`}>
        {title}
      </h3>
      
      <div className="space-y-4">
        {skills.map((skill, skillIndex) => (
          <SkillCard
            key={skillIndex}
            name={skill.name}
            description={skill.description}
            level={skill.level}
            maxLevel={skill.maxLevel}
            xp={skill.xp}
            maxXp={skill.maxXp}
            unlocked={skill.unlocked}
            isPremium={skill.isPremium}
            skillPoints={0}
            focusPoints={0}
            onUpgrade={onSkillUpgrade}
            onFocusPointsInvested={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default SkillBranch;
