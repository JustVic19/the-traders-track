
import React from 'react';
import SkillCard from './SkillCard';

interface SkillData {
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  maxXp: number;
}

interface SkillBranchProps {
  categoryName: string;
  categoryIcon: string;
  skills: SkillData[];
  skillPoints: number;
  focusPoints: number;
  onUpgrade: (skillName: string) => void;
  onFocusPointsInvested: () => void;
}

const SkillBranch: React.FC<SkillBranchProps> = ({
  categoryName,
  categoryIcon,
  skills,
  skillPoints,
  focusPoints,
  onUpgrade,
  onFocusPointsInvested
}) => {
  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">{categoryIcon}</span>
        <h2 className="text-xl font-bold text-white">{categoryName}</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill, skillIndex) => (
          <SkillCard
            key={skillIndex}
            name={skill.name}
            level={skill.level}
            maxLevel={skill.maxLevel}
            xp={skill.xp}
            maxXp={skill.maxXp}
            skillPoints={skillPoints}
            focusPoints={focusPoints}
            onUpgrade={onUpgrade}
            onFocusPointsInvested={onFocusPointsInvested}
          />
        ))}
      </div>
    </div>
  );
};

export default SkillBranch;
