
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, User, Mail, Calendar, Award, Coins, Zap } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

const ProfileSettings = () => {
  const { user } = useAuth();
  const { subscribed, plan, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setUsername(data?.username || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProUpgrade = async () => {
    if (!user) return;

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

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile & Settings</h1>
          <p className="text-gray-400">Manage your account and subscription settings</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-700 border-gray-600 text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Trading Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile?.level || 1}</div>
                    <div className="text-gray-400 text-sm">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{profile?.xp || 0}</div>
                    <div className="text-gray-400 text-sm">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">{profile?.alpha_coins || 0}</div>
                    <div className="text-gray-400 text-sm">Alpha Coins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{profile?.skill_points || 0}</div>
                    <div className="text-gray-400 text-sm">Skill Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Card */}
          <div className="space-y-6">
            <Card className={`border-gray-700 ${subscribed ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/50' : 'bg-gray-800'}`}>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  {subscribed ? (
                    <>
                      <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                      Pro Subscription
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Free Plan
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${subscribed ? 'text-yellow-500' : 'text-white'}`}>
                    {subscribed ? 'PRO' : 'FREE'}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {subscribed ? 'You have access to all Pro features' : 'Limited features available'}
                  </p>
                </div>

                {!subscribed && (
                  <>
                    <div className="border-t border-gray-600 pt-4">
                      <h4 className="text-white font-semibold mb-3">Upgrade to unlock:</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• AI-powered trade analysis</li>
                        <li>• Advanced analytics</li>
                        <li>• Trading Academy</li>
                        <li>• Guild features</li>
                        <li>• Priority support</li>
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={handleProUpgrade}
                      disabled={isCreatingCheckout}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                    >
                      {isCreatingCheckout ? 'Processing...' : 'Upgrade to Pro'}
                      {!isCreatingCheckout && <Crown className="ml-2 w-4 h-4" />}
                    </Button>
                  </>
                )}

                {subscribed && (
                  <div className="text-center">
                    <div className="text-green-400 text-sm font-medium">✓ All Pro features unlocked</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-white">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trader Avatar:</span>
                  <span className="text-white capitalize">
                    {profile?.trader_avatar?.replace('_', ' ') || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trading Goal:</span>
                  <span className="text-white text-xs">
                    {profile?.trading_goal?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
