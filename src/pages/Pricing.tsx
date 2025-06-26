
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Pricing = () => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const monthlyPrice = 10;
  const annualPrice = Math.round(monthlyPrice * 12 * 0.8); // 20% discount

  const handleProUpgrade = async () => {
    if (!user) {
      navigate('/auth?tab=signup');
      return;
    }

    setIsCreatingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: isAnnual ? 'annual_plan' : 'monthly_plan',
          isAnnual: isAnnual
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process. Please try again.');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold">The Traders Trak</Link>
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <a href="/#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <Link to="/pricing" className="text-white">Pricing</Link>
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, Transparent
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your trading journey. Start free and upgrade when you're ready.
          </p>
          
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <div className="relative">
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <span className={`text-lg ${isAnnual ? 'text-white' : 'text-gray-400'}`}>Annual</span>
            {isAnnual && (
              <Badge className="bg-green-600 text-white hover:bg-green-700 ml-2">
                Save 20%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="bg-gray-800 border-gray-700 p-8 hover:bg-gray-700/50 transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-white mb-4">Free</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-400 ml-2">forever</span>
                </div>
                <p className="text-gray-400">Perfect for getting started</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Basic trade journal</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Level system & XP</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Basic achievements</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Performance overview</span>
                  </div>
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-500">Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-500">AI insights</span>
                  </div>
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-500">Trading Academy</span>
                  </div>
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-500">Guild features</span>
                  </div>
                </div>

                {user && !subscribed ? (
                  <div className="text-center">
                    <Badge className="bg-blue-600 text-white mb-4">Current Plan</Badge>
                    <p className="text-gray-400 text-sm">You're currently on the free plan</p>
                  </div>
                ) : (
                  <Link to="/auth?tab=signup" className="block">
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                      Get Started Free
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/50 p-8 hover:from-blue-900/70 hover:to-purple-900/70 transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-1">
                  Recommended
                </Badge>
              </div>
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-white mb-4">Pro</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">
                    ${isAnnual ? Math.round(annualPrice / 12) : monthlyPrice}
                  </span>
                  <span className="text-gray-300 ml-2">/month</span>
                  {isAnnual && (
                    <div className="text-sm text-green-400 mt-1">
                      Billed annually (${annualPrice}/year)
                    </div>
                  )}
                </div>
                <p className="text-gray-300">For serious traders</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Everything in Free</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Advanced analytics & insights</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">AI-powered trade analysis</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Trading Academy access</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Guild features & community</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Unlimited trade history</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-white">Custom reporting</span>
                  </div>
                </div>

                {user && subscribed ? (
                  <div className="text-center">
                    <Badge className="bg-green-600 text-white mb-4">
                      <Crown className="w-4 h-4 mr-1" />
                      Current Plan
                    </Badge>
                    <p className="text-gray-300 text-sm">You have access to all Pro features</p>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleProUpgrade}
                    disabled={isCreatingCheckout}
                  >
                    {isCreatingCheckout ? 'Processing...' : 'Start Pro Trial'}
                    {!isCreatingCheckout && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">Frequently Asked Questions</h2>
          <div className="space-y-6 text-left">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400">Yes, you can cancel your subscription at any time from your profile settings.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400">We offer a 30-day money-back guarantee for all Pro subscriptions.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards, PayPal, and other payment methods through Stripe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Link to="/" className="text-2xl font-bold mb-4 inline-block">The Traders Trak</Link>
          <p className="text-gray-400 mb-6">Level up your trading game.</p>
          <div className="text-sm text-gray-500">
            © 2024 The Traders Trak. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
