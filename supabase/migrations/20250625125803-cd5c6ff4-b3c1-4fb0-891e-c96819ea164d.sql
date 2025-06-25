
-- Create table for trading plans/strategies
CREATE TABLE public.trading_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  entry_rules TEXT NOT NULL,
  exit_rules TEXT NOT NULL,
  risk_management_rules TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for trading plans
ALTER TABLE public.trading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trading plans" 
  ON public.trading_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trading plans" 
  ON public.trading_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading plans" 
  ON public.trading_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trading plans" 
  ON public.trading_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trading plan reference to trades table
ALTER TABLE public.trades 
ADD COLUMN trading_plan_id UUID REFERENCES trading_plans(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_trading_plans_user_id ON public.trading_plans(user_id);
CREATE INDEX idx_trades_trading_plan_id ON public.trades(trading_plan_id);

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_trading_plans_updated_at
  BEFORE UPDATE ON public.trading_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
