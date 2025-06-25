import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface TradingPlan {
  id: string;
  title: string;
  entry_rules: string;
  exit_rules: string;
  risk_management_rules: string;
  created_at: string;
  updated_at: string;
}

const Playbook = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tradingPlans, setTradingPlans] = useState<TradingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TradingPlan | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    entry_rules: '',
    exit_rules: '',
    risk_management_rules: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTradingPlans();
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
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTradingPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trading_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTradingPlans(data || []);
    } catch (error: any) {
      console.error('Error fetching trading plans:', error);
      toast({
        title: "Error",
        description: "Failed to load trading plans.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('trading_plans')
          .update(formData)
          .eq('id', editingPlan.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Trading plan updated successfully!",
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('trading_plans')
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Trading plan created successfully!",
        });
      }

      // Reset form and close dialog
      setFormData({
        title: '',
        entry_rules: '',
        exit_rules: '',
        risk_management_rules: ''
      });
      setEditingPlan(null);
      setIsDialogOpen(false);
      fetchTradingPlans();

    } catch (error: any) {
      console.error('Error saving trading plan:', error);
      toast({
        title: "Error",
        description: "Failed to save trading plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (plan: TradingPlan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      entry_rules: plan.entry_rules,
      exit_rules: plan.exit_rules,
      risk_management_rules: plan.risk_management_rules
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('trading_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trading plan deleted successfully!",
      });

      fetchTradingPlans();
    } catch (error: any) {
      console.error('Error deleting trading plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete trading plan.",
        variant: "destructive",
      });
    }
  };

  const handleNewPlan = () => {
    setEditingPlan(null);
    setFormData({
      title: '',
      entry_rules: '',
      exit_rules: '',
      risk_management_rules: ''
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B0F19' }}>
        <div className="text-lg text-white">Loading playbook...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F19' }}>
        <AppSidebar profile={profile} />
        <SidebarInset className="flex-1 w-full" style={{ backgroundColor: '#0B0F19' }}>
          {/* Header */}
          <header className="border-b border-gray-700 px-6 py-4 w-full" style={{ backgroundColor: '#1A1F2E' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <BookOpen className="w-6 h-6 mr-3" />
                  My Playbook
                </h1>
                <p className="text-gray-400">Define and manage your trading strategies</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewPlan} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Strategy
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white text-xl">
                      {editingPlan ? 'Edit Trading Strategy' : 'Create New Trading Strategy'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-gray-300">Strategy Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Breakout Scalping, Swing Reversal"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="entry_rules" className="text-gray-300">Entry Rules *</Label>
                      <Textarea
                        id="entry_rules"
                        value={formData.entry_rules}
                        onChange={(e) => setFormData({ ...formData, entry_rules: e.target.value })}
                        placeholder="Define when and how you enter trades..."
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="exit_rules" className="text-gray-300">Exit Rules *</Label>
                      <Textarea
                        id="exit_rules"
                        value={formData.exit_rules}
                        onChange={(e) => setFormData({ ...formData, exit_rules: e.target.value })}
                        placeholder="Define when and how you exit trades..."
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="risk_management_rules" className="text-gray-300">Risk Management Rules *</Label>
                      <Textarea
                        id="risk_management_rules"
                        value={formData.risk_management_rules}
                        onChange={(e) => setFormData({ ...formData, risk_management_rules: e.target.value })}
                        placeholder="Define your risk management approach..."
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {editingPlan ? 'Update Strategy' : 'Create Strategy'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* Main Content */}
          <main className="w-full px-6 py-8 flex-1" style={{ backgroundColor: '#0B0F19' }}>
            {tradingPlans.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Trading Strategies Yet</h3>
                <p className="text-gray-400 mb-6">Create your first trading strategy to build your playbook.</p>
                <Button onClick={handleNewPlan} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Strategy
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tradingPlans.map((plan) => (
                  <Card key={plan.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{plan.title}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(plan.id)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Entry Rules</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{plan.entry_rules}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Exit Rules</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{plan.exit_rules}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Risk Management</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{plan.risk_management_rules}</p>
                      </div>
                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                        Created: {new Date(plan.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Playbook;
