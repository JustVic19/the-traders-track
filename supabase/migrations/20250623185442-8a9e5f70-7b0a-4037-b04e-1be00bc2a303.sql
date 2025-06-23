
-- Create store items table
CREATE TABLE public.store_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('avatar', 'theme', 'cosmetic', 'premium', 'tools')),
  item_key TEXT NOT NULL UNIQUE,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user inventory table to track purchased items
CREATE TABLE public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  store_item_id UUID REFERENCES public.store_items NOT NULL,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, store_item_id)
);

-- Add Row Level Security
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Store items are public (everyone can see them)
CREATE POLICY "Anyone can view store items" 
  ON public.store_items 
  FOR SELECT 
  USING (true);

-- User inventory policies
CREATE POLICY "Users can view their own inventory" 
  ON public.user_inventory 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory" 
  ON public.user_inventory 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" 
  ON public.user_inventory 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add a 'plan' column to profiles table for Pro users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro'));

-- Insert some sample store items
INSERT INTO public.store_items (name, description, price, category, item_key) VALUES
('Advanced Analytics', 'Unlock detailed performance analytics and insights', 500, 'premium', 'advanced_analytics'),
('Trade Journal Pro', 'Enhanced journaling features with AI insights', 300, 'premium', 'trade_journal_pro'),
('Risk Calculator', 'Advanced risk management tools', 200, 'tools', 'risk_calculator'),
('Trading Cap', 'A stylish cap for professional traders', 100, 'avatar', 'trading_cap'),
('Dark Blue Theme', 'An exclusive dark blue dashboard theme', 250, 'theme', 'dark_blue_theme'),
('Golden Badge', 'A premium golden badge for your profile', 150, 'cosmetic', 'golden_badge');

-- Create trigger to update updated_at column
CREATE TRIGGER update_store_items_updated_at 
  BEFORE UPDATE ON public.store_items 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create a secure function to purchase items
CREATE OR REPLACE FUNCTION public.purchase_store_item(
  item_id UUID,
  user_profile_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_price INTEGER;
  user_coins INTEGER;
  item_available BOOLEAN;
  result JSON;
BEGIN
  -- Get item details
  SELECT price, is_available INTO item_price, item_available
  FROM store_items 
  WHERE id = item_id;
  
  -- Check if item exists and is available
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'error', 'Item not found'
    );
    RETURN result;
  END IF;
  
  IF NOT item_available THEN
    result := json_build_object(
      'success', false,
      'error', 'Item not available'
    );
    RETURN result;
  END IF;
  
  -- Get user's current alpha coins
  SELECT alpha_coins INTO user_coins
  FROM profiles 
  WHERE id = user_profile_id;
  
  -- Check if user has enough coins
  IF user_coins < item_price THEN
    result := json_build_object(
      'success', false,
      'error', 'Insufficient Alpha Coins'
    );
    RETURN result;
  END IF;
  
  -- Check if user already owns this item
  IF EXISTS (SELECT 1 FROM user_inventory WHERE user_id = user_profile_id AND store_item_id = item_id) THEN
    result := json_build_object(
      'success', false,
      'error', 'Item already owned'
    );
    RETURN result;
  END IF;
  
  -- Perform the purchase transaction
  -- 1. Subtract coins from user
  UPDATE profiles 
  SET alpha_coins = alpha_coins - item_price
  WHERE id = user_profile_id;
  
  -- 2. Add item to user inventory
  INSERT INTO user_inventory (user_id, store_item_id)
  VALUES (user_profile_id, item_id);
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'Item purchased successfully',
    'remaining_coins', user_coins - item_price
  );
  RETURN result;
END;
$$;

-- Create function to grant monthly Pro coins
CREATE OR REPLACE FUNCTION public.grant_monthly_pro_coins()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add 500 Alpha Coins to all Pro users
  UPDATE profiles 
  SET alpha_coins = alpha_coins + 500
  WHERE plan = 'pro';
  
  -- Log the operation (optional)
  RAISE NOTICE 'Granted 500 Alpha Coins to all Pro users on %', now();
END;
$$;
