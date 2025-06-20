
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Target, CheckCircle } from 'lucide-react';

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

const OnboardingFlow = ({ userId, onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const avatarOptions = [
    { id: 'scalper_sam', name: 'Scalper Sam', description: 'Quick trades, fast profits' },
    { id: 'swinging_sarah', name: 'Swinging Sarah', description: 'Medium-term position trader' },
    { id: 'day_trader_dave', name: 'Day Trader Dave', description: 'Intraday trading specialist' },
    { id: 'swing_king_kyle', name: 'Swing King Kyle', description: 'Multi-day position holder' }
  ];

  const goalOptions = [
    { id: 'prop_firm_combine', name: 'Pass a Prop Firm Combine', description: 'Meet funding requirements' },
    { id: 'consistent_profitability', name: 'Achieve Consistent Profitability', description: 'Build steady income' },
    { id: 'risk_management', name: 'Master Risk Management', description: 'Protect and grow capital' },
    { id: 'skill_development', name: 'Develop Trading Skills', description: 'Become a better trader' }
  ];

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          trader_avatar: selectedAvatar,
          trading_goal: selectedGoal
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Welcome aboard!",
        description: "Your profile has been set up successfully.",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderWelcomeStep = () => (
    <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-12 h-12 text-white" />
        </div>
        <CardTitle className="text-2xl text-white">Meet Coach Vega</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="bg-gray-700 rounded-lg p-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            "Welcome to The Traders Track! I'm Coach Vega, your AI mentor. I'm here to help you build the habits of a professional trader and guide you on your journey to success."
          </p>
        </div>
        <p className="text-gray-400">Let's get you set up with a personalized trading experience.</p>
        <Button 
          onClick={() => setCurrentStep(2)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
        >
          Let's Get Started
        </Button>
      </CardContent>
    </Card>
  );

  const renderAvatarStep = () => (
    <Card className="bg-gray-800 border-gray-700 max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Choose Your Trader Persona</CardTitle>
        <p className="text-gray-400">Select the trading style that best represents you</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {avatarOptions.map((avatar) => (
            <div
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedAvatar === avatar.id
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{avatar.name}</h3>
                  <p className="text-gray-400 text-sm">{avatar.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <Button 
            onClick={() => setCurrentStep(1)}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Back
          </Button>
          <Button 
            onClick={() => setCurrentStep(3)}
            disabled={!selectedAvatar}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderGoalStep = () => (
    <Card className="bg-gray-800 border-gray-700 max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white">Set Your Primary Goal</CardTitle>
        <p className="text-gray-400">What's your main trading objective?</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goalOptions.map((goal) => (
            <div
              key={goal.id}
              onClick={() => setSelectedGoal(goal.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedGoal === goal.id
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{goal.name}</h3>
                  <p className="text-gray-400 text-sm">{goal.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <Button 
            onClick={() => setCurrentStep(2)}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Back
          </Button>
          <Button 
            onClick={completeOnboarding}
            disabled={!selectedGoal || loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full">
        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-400">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Welcome' :
                currentStep === 2 ? 'Choose Persona' : 'Set Goal'
              }
            </p>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && renderWelcomeStep()}
        {currentStep === 2 && renderAvatarStep()}
        {currentStep === 3 && renderGoalStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow;
