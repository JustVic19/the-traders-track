
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Brain, Target, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type UserSkill = Tables<'user_skills'>;

interface SkillNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  branch: 'risk' | 'psychology' | 'strategy';
  icon: React.ComponentType<any>;
  unlocked: boolean;
  prerequisite?: string;
}

const SkillTree = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const skillNodes: SkillNode[] = [
    {
      id: 'risk_simulator',
      name: 'Risk Simulator',
      description: 'Unlock the Risk Simulator tool to test different risk scenarios and position sizing strategies.',
      cost: 3,
      branch: 'risk',
      icon: Shield,
      unlocked: false,
    },
    {
      id: 'emotional_pattern_recognition',
      name: 'Emotional Pattern Recognition',
      description: 'Unlock detailed emotional pattern reports in your analytics dashboard to identify trading psychology trends.',
      cost: 3,
      branch: 'psychology',
      icon: Brain,
      unlocked: false,
    },
    {
      id: 'playbook_builder',
      name: 'Playbook Builder',
      description: 'Unlock the Playbook Builder tool to create and manage your trading strategies and setups.',
      cost: 3,
      branch: 'strategy',
      icon: Target,
      unlocked: false,
    },
  ];

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user?.id);

      if (skillsError) throw skillsError;
      setUserSkills(skillsData || []);

    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load skill tree data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unlockSkill = async (skillKey: string, cost: number) => {
    if (!profile || profile.skill_points < cost) {
      toast({
        title: "Insufficient Skill Points",
        description: `You need ${cost} skill points to unlock this skill.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert the new skill
      const { error: skillError } = await supabase
        .from('user_skills')
        .insert({
          user_id: user?.id!,
          skill_key: skillKey,
        });

      if (skillError) throw skillError;

      // Update skill points
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ skill_points: profile.skill_points - cost })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast({
        title: "Skill Unlocked!",
        description: "You have successfully unlocked a new skill.",
      });

      // Refresh data
      fetchUserData();

    } catch (error: any) {
      console.error('Error unlocking skill:', error);
      toast({
        title: "Error",
        description: "Failed to unlock skill. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isSkillUnlocked = (skillKey: string) => {
    return userSkills.some(skill => skill.skill_key === skillKey);
  };

  const canAffordSkill = (cost: number) => {
    return profile ? profile.skill_points >= cost : false;
  };

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'risk': return 'from-red-500 to-red-600';
      case 'psychology': return 'from-purple-500 to-purple-600';
      case 'strategy': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-white">Loading skill tree...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Skill Tree</h1>
              <p className="text-gray-400 text-sm">Develop your trading expertise</p>
            </div>
          </div>
          <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold">
            {profile?.skill_points || 0} Skill Points
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-xl text-gray-300 mb-2">Choose Your Path</h2>
          <p className="text-gray-400">Unlock powerful tools and features by investing in different skill branches</p>
        </div>

        {/* Skill Tree Visual */}
        <div className="relative max-w-6xl mx-auto">
          {/* Central Hub */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center border-4 border-gray-800">
              <span className="text-2xl font-bold text-white">TT</span>
            </div>
          </div>

          {/* Branch Lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ height: '600px' }}>
            {/* Risk Management Line */}
            <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#ef4444" strokeWidth="3" strokeDasharray="5,5" />
            {/* Psychology Line */}
            <line x1="50%" y1="50%" x2="50%" y2="10%" stroke="#a855f7" strokeWidth="3" strokeDasharray="5,5" />
            {/* Strategy Line */}
            <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#3b82f6" strokeWidth="3" strokeDasharray="5,5" />
          </svg>

          {/* Skill Nodes */}
          <div className="relative" style={{ height: '600px' }}>
            {/* Risk Management Branch */}
            <div className="absolute top-8 left-8">
              <Card className="w-80 bg-gray-800 border-gray-700">
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getBranchColor('risk')} rounded-xl mx-auto mb-3 flex items-center justify-center`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Risk Management</CardTitle>
                  <CardDescription className="text-gray-400">Master risk control and position sizing</CardDescription>
                </CardHeader>
                <CardContent>
                  {skillNodes.filter(node => node.branch === 'risk').map((node) => {
                    const unlocked = isSkillUnlocked(node.id);
                    const canAfford = canAffordSkill(node.cost);
                    const Icon = node.icon;
                    
                    return (
                      <div key={node.id} className="mb-4 last:mb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-5 h-5 ${unlocked ? 'text-green-400' : 'text-gray-400'}`} />
                            <span className={`font-medium ${unlocked ? 'text-green-400' : 'text-white'}`}>
                              {node.name}
                            </span>
                            {unlocked && <CheckCircle className="w-4 h-4 text-green-400" />}
                            {!unlocked && !canAfford && <Lock className="w-4 h-4 text-gray-500" />}
                          </div>
                          <span className="text-yellow-400 font-semibold">{node.cost} SP</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{node.description}</p>
                        {!unlocked && (
                          <Button
                            onClick={() => unlockSkill(node.id, node.cost)}
                            disabled={!canAfford}
                            className={`w-full ${canAfford ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600'}`}
                            size="sm"
                          >
                            {canAfford ? 'Unlock Skill' : 'Insufficient Points'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Psychology Branch */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <Card className="w-80 bg-gray-800 border-gray-700">
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getBranchColor('psychology')} rounded-xl mx-auto mb-3 flex items-center justify-center`}>
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Psychology</CardTitle>
                  <CardDescription className="text-gray-400">Understand and improve your trading mindset</CardDescription>
                </CardHeader>
                <CardContent>
                  {skillNodes.filter(node => node.branch === 'psychology').map((node) => {
                    const unlocked = isSkillUnlocked(node.id);
                    const canAfford = canAffordSkill(node.cost);
                    const Icon = node.icon;
                    
                    return (
                      <div key={node.id} className="mb-4 last:mb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-5 h-5 ${unlocked ? 'text-green-400' : 'text-gray-400'}`} />
                            <span className={`font-medium ${unlocked ? 'text-green-400' : 'text-white'}`}>
                              {node.name}
                            </span>
                            {unlocked && <CheckCircle className="w-4 h-4 text-green-400" />}
                            {!unlocked && !canAfford && <Lock className="w-4 h-4 text-gray-500" />}
                          </div>
                          <span className="text-yellow-400 font-semibold">{node.cost} SP</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{node.description}</p>
                        {!unlocked && (
                          <Button
                            onClick={() => unlockSkill(node.id, node.cost)}
                            disabled={!canAfford}
                            className={`w-full ${canAfford ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600'}`}
                            size="sm"
                          >
                            {canAfford ? 'Unlock Skill' : 'Insufficient Points'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Strategy Branch */}
            <div className="absolute top-8 right-8">
              <Card className="w-80 bg-gray-800 border-gray-700">
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getBranchColor('strategy')} rounded-xl mx-auto mb-3 flex items-center justify-center`}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Strategy</CardTitle>
                  <CardDescription className="text-gray-400">Develop and refine your trading strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  {skillNodes.filter(node => node.branch === 'strategy').map((node) => {
                    const unlocked = isSkillUnlocked(node.id);
                    const canAfford = canAffordSkill(node.cost);
                    const Icon = node.icon;
                    
                    return (
                      <div key={node.id} className="mb-4 last:mb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-5 h-5 ${unlocked ? 'text-green-400' : 'text-gray-400'}`} />
                            <span className={`font-medium ${unlocked ? 'text-green-400' : 'text-white'}`}>
                              {node.name}
                            </span>
                            {unlocked && <CheckCircle className="w-4 h-4 text-green-400" />}
                            {!unlocked && !canAfford && <Lock className="w-4 h-4 text-gray-500" />}
                          </div>
                          <span className="text-yellow-400 font-semibold">{node.cost} SP</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{node.description}</p>
                        {!unlocked && (
                          <Button
                            onClick={() => unlockSkill(node.id, node.cost)}
                            disabled={!canAfford}
                            className={`w-full ${canAfford ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600'}`}
                            size="sm"
                          >
                            {canAfford ? 'Unlock Skill' : 'Insufficient Points'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* How to Earn Skill Points */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">How to Earn Skill Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                You earn <span className="text-yellow-400 font-semibold">1 Skill Point</span> every time you level up. 
                Level up by gaining XP through trading activities, completing missions, and achieving milestones.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SkillTree;
