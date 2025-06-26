
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Target, CheckCircle, Crown, Zap } from 'lucide-react';

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

const OnboardingFlow = ({ userId, onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
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

  const completeOnboardingFree = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          trader_avatar: selectedAvatar,
          trading_goal: selectedGoal,
          plan: 'free'
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Welcome aboard!",
        description: "Your free account has been set up successfully.",
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

  const handleProUpgrade = async () => {
    setIsCreatingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: 'monthly_plan',
          isAnnual: false
        }
      });

      if (error) throw error;

      if (data?.url) {
        // First complete the basic onboarding
        await supabase
          .from('profiles')
          .update({
            onboarding_completed: true,
            trader_avatar: selectedAvatar,
            trading_goal: selectedGoal
          })
          .eq('id', userId);

        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to payment...",
          description: "Complete your payment to unlock Pro features!",
        });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCheckout(false);
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
            "Welcome to The Traders Trak! I'm Coach Vega, your AI mentor. I'm here to help you build the habits of a professional trader and guide you on your journey to success."
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
            onClick={() => setCurrentStep(4)}
            disabled={!selectedGoal}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderUpsellStep = () => (
    <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/50 max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl text-white mb-2">Unlock Your Full Potential</CardTitle>
        <p className="text-gray-300 text-lg">Ready to take your trading to the next level?</p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Zap className="w-6 h-6 text-yellow-500 mr-2" />
            Pro Features Include:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="text-white">AI-powered trade analysis</span>
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="text-white">Advanced analytics & insights</span>
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="text-white">Trading Academy access</span>
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="text-white">Guild features & community</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="text-white">Priority support</span>
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="text-white">Unlimited trade history</span>
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="text-white">Custom reporting</span>
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span className="text-white">Backtesting tools</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-6">
            <div className="text-4xl font-bold text-white mb-2">$10<span className="text-lg text-gray-400">/month</span></div>
            <p className="text-gray-400">Start your Pro journey today</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleProUpgrade}
              disabled={isCreatingCheckout}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
            >
              {isCreatingCheckout ? 'Processing...' : 'Upgrade to Pro Now'}
              {!isCreatingCheckout && <Crown className="ml-2 w-5 h-5" />}
            </Button>
            
            <Button 
              onClick={completeOnboardingFree}
              disabled={loading}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 px-8 py-4 text-lg"
            >
              {loading ? 'Setting up...' : 'Maybe Later'}
            </Button>
          </div>
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
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-400">
              Step {currentStep} of 4: {
                currentStep === 1 ? 'Welcome' :
                currentStep === 2 ? 'Choose Persona' : 
                currentStep === 3 ? 'Set Goal' : 'Choose Plan'
              }
            </p>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && renderWelcomeStep()}
        {currentStep === 2 && renderAvatarStep()}
        {currentStep === 3 && renderGoalStep()}
        {currentStep === 4 && renderUpsellStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow;
