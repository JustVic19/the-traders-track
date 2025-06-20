
-- Create missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'achievement')),
  target_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  mission_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user mission progress table
CREATE TABLE public.user_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  mission_id UUID REFERENCES public.missions NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Add Row Level Security
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- Missions are public (everyone can see them)
CREATE POLICY "Anyone can view missions" 
  ON public.missions 
  FOR SELECT 
  USING (true);

-- User mission progress policies
CREATE POLICY "Users can view their own mission progress" 
  ON public.user_missions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mission progress" 
  ON public.user_missions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission progress" 
  ON public.user_missions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert some sample missions
INSERT INTO public.missions (title, description, type, target_value, xp_reward, mission_key) VALUES
('First Trade', 'Log your first trade to get started', 'achievement', 1, 50, 'first_trade'),
('Trade Logger', 'Log 5 trades in total', 'achievement', 5, 100, 'log_5_trades'),
('Daily Trader', 'Log 1 trade today', 'daily', 1, 25, 'daily_trade'),
('Active Day', 'Log 3 trades in a single day', 'daily', 3, 50, 'active_day'),
('Weekly Warrior', 'Log 10 trades this week', 'weekly', 10, 150, 'weekly_10_trades'),
('Profit Seeker', 'Close 3 profitable trades', 'achievement', 3, 200, 'profit_3_trades');

-- Create trigger to update updated_at columns
CREATE TRIGGER update_missions_updated_at 
  BEFORE UPDATE ON public.missions 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_user_missions_updated_at 
  BEFORE UPDATE ON public.user_missions 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
