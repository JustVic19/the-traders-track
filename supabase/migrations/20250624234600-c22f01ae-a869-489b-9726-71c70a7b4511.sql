
-- Create guilds table
CREATE TABLE public.guilds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  max_members INTEGER NOT NULL DEFAULT 10,
  is_private BOOLEAN NOT NULL DEFAULT true,
  invite_code TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 8)
);

-- Create guild members table
CREATE TABLE public.guild_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

-- Create guild chat messages table
CREATE TABLE public.guild_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guild tournaments table
CREATE TABLE public.guild_tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(week_start)
);

-- Create guild tournament results table
CREATE TABLE public.guild_tournament_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES guild_tournaments(id) ON DELETE CASCADE,
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  combined_profit_factor DECIMAL NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL,
  members_count INTEGER NOT NULL,
  total_trades INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, guild_id)
);

-- Create guild achievements table
CREATE TABLE public.guild_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all guild tables
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guilds
CREATE POLICY "Users can view guilds they are members of" ON public.guilds
  FOR SELECT USING (
    id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create guilds" ON public.guilds
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Guild owners can update their guilds" ON public.guilds
  FOR UPDATE USING (
    id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- RLS Policies for guild_members
CREATE POLICY "Users can view guild members of their guilds" ON public.guild_members
  FOR SELECT USING (
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join guilds" ON public.guild_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Guild owners can manage members" ON public.guild_members
  FOR DELETE USING (
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- RLS Policies for guild_messages
CREATE POLICY "Guild members can view messages" ON public.guild_messages
  FOR SELECT USING (
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Guild members can send messages" ON public.guild_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

-- RLS Policies for tournaments (read-only for users)
CREATE POLICY "Users can view tournaments" ON public.guild_tournaments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view tournament results" ON public.guild_tournament_results
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for guild achievements
CREATE POLICY "Users can view guild achievements" ON public.guild_achievements
  FOR SELECT USING (
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

-- Function to calculate guild combined metrics
CREATE OR REPLACE FUNCTION public.calculate_guild_metrics(guild_id_param UUID, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  total_trades INTEGER := 0;
  winning_trades INTEGER := 0;
  total_profit DECIMAL := 0;
  total_loss DECIMAL := 0;
  combined_profit_factor DECIMAL := 0;
  member_count INTEGER := 0;
BEGIN
  -- Get member count
  SELECT COUNT(*) INTO member_count
  FROM guild_members 
  WHERE guild_id = guild_id_param;
  
  -- Get combined trading metrics for all guild members
  WITH guild_trades AS (
    SELECT t.*
    FROM trades t
    JOIN guild_members gm ON t.user_id = gm.user_id
    WHERE gm.guild_id = guild_id_param
      AND NOT t.is_open
      AND t.profit_loss IS NOT NULL
      AND (start_date IS NULL OR t.exit_date::DATE >= start_date)
      AND (end_date IS NULL OR t.exit_date::DATE <= end_date)
  )
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE profit_loss > 0),
    COALESCE(SUM(profit_loss) FILTER (WHERE profit_loss > 0), 0),
    COALESCE(ABS(SUM(profit_loss)) FILTER (WHERE profit_loss < 0), 0)
  INTO total_trades, winning_trades, total_profit, total_loss
  FROM guild_trades;
  
  -- Calculate combined profit factor
  IF total_loss > 0 THEN
    combined_profit_factor := total_profit / total_loss;
  ELSIF total_profit > 0 THEN
    combined_profit_factor := 999; -- Cap for infinite profit factor
  ELSE
    combined_profit_factor := 0;
  END IF;
  
  result := json_build_object(
    'member_count', member_count,
    'total_trades', total_trades,
    'winning_trades', winning_trades,
    'win_rate', CASE WHEN total_trades > 0 THEN ROUND((winning_trades::DECIMAL / total_trades) * 100, 1) ELSE 0 END,
    'total_profit', total_profit,
    'total_loss', total_loss,
    'combined_pnl', total_profit - total_loss,
    'combined_profit_factor', combined_profit_factor
  );
  
  RETURN result;
END;
$$;

-- Function to start weekly tournament
CREATE OR REPLACE FUNCTION public.start_weekly_tournament()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  week_start DATE;
  week_end DATE;
  tournament_id UUID;
  guild_record RECORD;
  guild_metrics JSON;
  rank_counter INTEGER := 1;
BEGIN
  -- Calculate current week dates (Monday to Sunday)
  week_start := date_trunc('week', CURRENT_DATE)::DATE;
  week_end := (week_start + INTERVAL '6 days')::DATE;
  
  -- Create or get current tournament
  INSERT INTO guild_tournaments (week_start, week_end, status)
  VALUES (week_start, week_end, 'active')
  ON CONFLICT (week_start) DO UPDATE SET status = 'active'
  RETURNING id INTO tournament_id;
  
  -- Calculate metrics for each guild and insert results
  FOR guild_record IN (
    SELECT g.id, g.name
    FROM guilds g
    WHERE EXISTS (SELECT 1 FROM guild_members gm WHERE gm.guild_id = g.id)
    ORDER BY g.id
  ) LOOP
    -- Calculate guild metrics for the current week
    guild_metrics := calculate_guild_metrics(guild_record.id, week_start, week_end);
    
    -- Insert or update tournament result
    INSERT INTO guild_tournament_results (
      tournament_id, 
      guild_id, 
      combined_profit_factor, 
      rank, 
      members_count, 
      total_trades
    ) VALUES (
      tournament_id,
      guild_record.id,
      (guild_metrics->>'combined_profit_factor')::DECIMAL,
      0, -- Will be updated below
      (guild_metrics->>'member_count')::INTEGER,
      (guild_metrics->>'total_trades')::INTEGER
    )
    ON CONFLICT (tournament_id, guild_id) 
    DO UPDATE SET 
      combined_profit_factor = (guild_metrics->>'combined_profit_factor')::DECIMAL,
      members_count = (guild_metrics->>'member_count')::INTEGER,
      total_trades = (guild_metrics->>'total_trades')::INTEGER;
  END LOOP;
  
  -- Update ranks based on combined profit factor
  WITH ranked_results AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY combined_profit_factor DESC, total_trades DESC) as new_rank
    FROM guild_tournament_results 
    WHERE tournament_id = tournament_id
  )
  UPDATE guild_tournament_results 
  SET rank = ranked_results.new_rank
  FROM ranked_results 
  WHERE guild_tournament_results.id = ranked_results.id;
END;
$$;

-- Function to complete weekly tournament and award prizes
CREATE OR REPLACE FUNCTION public.complete_weekly_tournament()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tournament_id UUID;
  winning_guild_id UUID;
  member_record RECORD;
BEGIN
  -- Get current active tournament
  SELECT id INTO current_tournament_id
  FROM guild_tournaments 
  WHERE status = 'active' 
  ORDER BY week_start DESC 
  LIMIT 1;
  
  IF current_tournament_id IS NULL THEN
    RETURN; -- No active tournament
  END IF;
  
  -- Get winning guild (rank 1)
  SELECT guild_id INTO winning_guild_id
  FROM guild_tournament_results 
  WHERE tournament_id = current_tournament_id AND rank = 1
  LIMIT 1;
  
  IF winning_guild_id IS NOT NULL THEN
    -- Award 1000 Alpha Coins to all members of winning guild
    UPDATE profiles 
    SET alpha_coins = alpha_coins + 1000
    WHERE id IN (
      SELECT user_id FROM guild_members WHERE guild_id = winning_guild_id
    );
    
    -- Record achievement
    INSERT INTO guild_achievements (guild_id, achievement_type, achievement_data)
    VALUES (
      winning_guild_id, 
      'weekly_tournament_winner',
      json_build_object(
        'tournament_id', current_tournament_id,
        'week_start', (SELECT week_start FROM guild_tournaments WHERE id = current_tournament_id),
        'week_end', (SELECT week_end FROM guild_tournaments WHERE id = current_tournament_id)
      )
    );
  END IF;
  
  -- Mark tournament as completed
  UPDATE guild_tournaments 
  SET status = 'completed' 
  WHERE id = current_tournament_id;
END;
$$;

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON guilds FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
