
import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SecurityBannerProps {
  type: 'success' | 'warning';
  message: string;
  onDismiss?: () => void;
}

export const SecurityBanner: React.FC<SecurityBannerProps> = ({ type, message, onDismiss }) => {
  const isSuccess = type === 'success';
  
  return (
    <Card className={`border-l-4 ${isSuccess ? 'border-l-green-500 bg-green-50' : 'border-l-yellow-500 bg-yellow-50'}`}>
      <CardContent className="flex items-center gap-3 p-4">
        {isSuccess ? (
          <Shield className="h-5 w-5 text-green-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
        )}
        <div className="flex-1">
          <p className={`text-sm font-medium ${isSuccess ? 'text-green-800' : 'text-yellow-800'}`}>
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`text-sm font-medium ${isSuccess ? 'text-green-600 hover:text-green-800' : 'text-yellow-600 hover:text-yellow-800'}`}
          >
            Dismiss
          </button>
        )}
      </CardContent>
    </Card>
  );
};
