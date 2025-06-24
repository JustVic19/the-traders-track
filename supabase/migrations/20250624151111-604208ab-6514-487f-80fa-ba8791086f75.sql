
-- Add new columns to missions table to support randomized objectives
ALTER TABLE public.missions 
ADD COLUMN min_value INTEGER,
ADD COLUMN max_value INTEGER,
ADD COLUMN is_template BOOLEAN NOT NULL DEFAULT false;

-- Update existing missions to be templates with appropriate ranges
UPDATE public.missions 
SET 
  is_template = true,
  min_value = CASE 
    WHEN mission_key = 'first_trade' THEN 1
    WHEN mission_key = 'log_5_trades' THEN 3
    WHEN mission_key = 'daily_trade' THEN 1
    WHEN mission_key = 'active_day' THEN 2
    WHEN mission_key = 'weekly_10_trades' THEN 8
    WHEN mission_key = 'profit_3_trades' THEN 2
    ELSE 1
  END,
  max_value = CASE 
    WHEN mission_key = 'first_trade' THEN 1
    WHEN mission_key = 'log_5_trades' THEN 7
    WHEN mission_key = 'daily_trade' THEN 2
    WHEN mission_key = 'active_day' THEN 5
    WHEN mission_key = 'weekly_10_trades' THEN 15
    WHEN mission_key = 'profit_3_trades' THEN 5
    ELSE 1
  END;

-- Create table for user-specific generated missions
CREATE TABLE public.user_generated_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  template_id UUID REFERENCES public.missions NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  mission_type TEXT NOT NULL,
  generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, template_id, generated_date)
);

-- Add Row Level Security
ALTER TABLE public.user_generated_missions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_generated_missions
CREATE POLICY "Users can view their own generated missions" 
  ON public.user_generated_missions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated missions" 
  ON public.user_generated_missions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated missions" 
  ON public.user_generated_missions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to generate daily missions for a user
CREATE OR REPLACE FUNCTION public.generate_daily_missions_for_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  template_record RECORD;
  random_target INTEGER;
  random_xp INTEGER;
  mission_title TEXT;
  mission_description TEXT;
  expire_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set expiration to end of next day
  expire_time := (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '23 hours 59 minutes');
  
  -- Delete any existing unclaimed missions from previous days
  DELETE FROM user_generated_missions 
  WHERE user_id = target_user_id 
    AND expires_at < NOW() 
    AND NOT is_claimed;
  
  -- Select 2-3 random mission templates and generate missions
  FOR template_record IN (
    SELECT * FROM missions 
    WHERE is_template = true 
    ORDER BY RANDOM() 
    LIMIT (2 + FLOOR(RANDOM() * 2)::INTEGER)
  ) LOOP
    
    -- Skip if user already has this template for today
    IF EXISTS (
      SELECT 1 FROM user_generated_missions 
      WHERE user_id = target_user_id 
        AND template_id = template_record.id 
        AND generated_date = CURRENT_DATE
    ) THEN
      CONTINUE;
    END IF;
    
    -- Generate random target value
    random_target := template_record.min_value + 
      FLOOR(RANDOM() * (template_record.max_value - template_record.min_value + 1))::INTEGER;
    
    -- Generate random XP reward (base reward + 0-50% bonus)
    random_xp := template_record.xp_reward + 
      FLOOR(RANDOM() * (template_record.xp_reward * 0.5))::INTEGER;
    
    -- Generate dynamic title and description
    mission_title := REPLACE(template_record.title, '[value]', random_target::TEXT);
    mission_description := REPLACE(template_record.description, '[value]', random_target::TEXT);
    
    -- Insert the generated mission
    INSERT INTO user_generated_missions (
      user_id, 
      template_id, 
      title, 
      description, 
      target_value, 
      xp_reward, 
      mission_type,
      expires_at
    ) VALUES (
      target_user_id,
      template_record.id,
      mission_title,
      mission_description,
      random_target,
      random_xp,
      template_record.type,
      expire_time
    );
  END LOOP;
END;
$$;

-- Create function to generate missions for all users (for cron job)
CREATE OR REPLACE FUNCTION public.generate_daily_missions_for_all_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all users and generate missions
  FOR user_record IN (SELECT id FROM profiles) LOOP
    PERFORM generate_daily_missions_for_user(user_record.id);
  END LOOP;
  
  RAISE NOTICE 'Generated daily missions for all users at %', now();
END;
$$;

-- Add trigger to update updated_at column
CREATE TRIGGER update_user_generated_missions_updated_at 
  BEFORE UPDATE ON public.user_generated_missions 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Update mission templates to use [value] placeholder in title/description
UPDATE public.missions 
SET 
  title = CASE 
    WHEN mission_key = 'first_trade' THEN 'First Trade'
    WHEN mission_key = 'log_5_trades' THEN 'Trade Logger ([value] trades)'
    WHEN mission_key = 'daily_trade' THEN 'Daily Trader ([value] trades today)'
    WHEN mission_key = 'active_day' THEN 'Active Day ([value] trades today)'
    WHEN mission_key = 'weekly_10_trades' THEN 'Weekly Warrior ([value] trades this week)'
    WHEN mission_key = 'profit_3_trades' THEN 'Profit Seeker ([value] profitable trades)'
    ELSE title
  END,
  description = CASE 
    WHEN mission_key = 'first_trade' THEN 'Log your first trade to get started'
    WHEN mission_key = 'log_5_trades' THEN 'Log [value] trades in total'
    WHEN mission_key = 'daily_trade' THEN 'Log [value] trade(s) today'
    WHEN mission_key = 'active_day' THEN 'Log [value] trades in a single day'
    WHEN mission_key = 'weekly_10_trades' THEN 'Log [value] trades this week'
    WHEN mission_key = 'profit_3_trades' THEN 'Close [value] profitable trades'
    ELSE description
  END
WHERE is_template = true;
