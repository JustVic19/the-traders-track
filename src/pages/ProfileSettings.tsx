
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Palette, Settings } from 'lucide-react';
import AlphaCoinBalance from '@/components/AlphaCoinBalance';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const TRADER_AVATARS = [
  { id: 'scalper_sam', name: 'Scalper Sam', emoji: '⚡' },
  { id: 'swinging_sarah', name: 'Swinging Sarah', emoji: '📈' },
  { id: 'day_trader_dan', name: 'Day Trader Dan', emoji: '💼' },
  { id: 'crypto_chris', name: 'Crypto Chris', emoji: '₿' },
  { id: 'forex_fiona', name: 'Forex Fiona', emoji: '🌍' },
];

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Password change form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (newAvatar: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ trader_avatar: newAvatar })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Avatar Updated',
        description: 'Your trader avatar has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update avatar. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(data);
  };

  const getAvatarDisplay = (avatarId: string | null) => {
    const avatar = TRADER_AVATARS.find(a => a.id === avatarId);
    return avatar || TRADER_AVATARS[0];
  };

  const calculateLevelProgress = (xp: number, level: number) => {
    const xpForCurrentLevel = (level - 1) * 100;
    const xpForNextLevel = level * 100;
    const progressInCurrentLevel = xp - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    return Math.max(0, Math.min(100, (progressInCurrentLevel / xpNeededForLevel) * 100));
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const currentAvatar = getAvatarDisplay(profile?.trader_avatar);
  const levelProgress = calculateLevelProgress(profile?.xp || 0, profile?.level || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile & Settings</h1>
          <p className="text-gray-300">Manage your profile, customize your experience, and update account settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="customization" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Customization
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{currentAvatar.emoji}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{currentAvatar.name}</h3>
                    <p className="text-gray-300">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Level</div>
                    <div className="text-2xl font-bold text-white">{profile?.level || 1}</div>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Experience</div>
                    <div className="text-2xl font-bold text-white">{profile?.xp || 0} XP</div>
                    <Progress value={levelProgress} className="mt-2" />
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <AlphaCoinBalance balance={profile?.alpha_coins || 0} className="bg-transparent p-0" />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Achievement Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-yellow-600 text-white">
                      First Trade
                    </Badge>
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      Level 5 Trader
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-600 text-white">
                      Consistent Performer
                    </Badge>
                    <Badge variant="outline" className="text-gray-400 border-gray-600">
                      More badges coming soon...
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customization" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Avatar Selection</CardTitle>
                <CardDescription>Choose your trader persona</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {TRADER_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => updateAvatarMutation.mutate(avatar.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        profile?.trader_avatar === avatar.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                      }`}
                      disabled={updateAvatarMutation.isPending}
                    >
                      <div className="text-3xl mb-2">{avatar.emoji}</div>
                      <div className="text-white text-sm font-medium">{avatar.name}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Dashboard Themes</CardTitle>
                <CardDescription>Customize your dashboard appearance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-gray-400 p-4 text-center">
                  <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Custom themes will be available once the store system is implemented.</p>
                  <p className="text-sm mt-2">For now, enjoy the default dark theme!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Current Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter current password"
                              className="bg-slate-700 border-slate-600 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              className="bg-slate-700 border-slate-600 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Confirm New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              className="bg-slate-700 border-slate-600 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={changePasswordMutation.isPending}
                      className="w-full"
                    >
                      {changePasswordMutation.isPending ? 'Updating...' : 'Change Password'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Subscription Management</CardTitle>
                <CardDescription>Manage your Pro subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Current Plan</h4>
                      <p className="text-gray-400">Free Tier</p>
                    </div>
                    <Badge variant="outline" className="text-gray-400">
                      Free
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full" disabled>
                    Upgrade to Pro (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileSettings;
