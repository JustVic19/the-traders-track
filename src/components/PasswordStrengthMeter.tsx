import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (password: string) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 20;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) score += 20;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 20;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 20;
    else feedback.push('Include special characters');

    return { score, feedback };
  };

  const { score, feedback } = calculateStrength(password);

  const getStrengthLabel = (score: number) => {
    if (score === 0) return '';
    if (score <= 40) return 'Weak';
    if (score <= 60) return 'Fair';
    if (score <= 80) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (score: number) => {
    if (score <= 40) return 'hsl(var(--destructive))';
    if (score <= 60) return 'hsl(var(--warning))';
    if (score <= 80) return 'hsl(var(--primary))';
    return 'hsl(var(--success))';
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password strength:</span>
        <span className="text-sm font-medium" style={{ color: getStrengthColor(score) }}>
          {getStrengthLabel(score)}
        </span>
      </div>
      <Progress 
        value={score} 
        className="h-2"
        style={{ 
          '--progress-background': getStrengthColor(score) 
        } as React.CSSProperties}
      />
      {feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};