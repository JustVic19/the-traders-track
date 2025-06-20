
-- Create store items table
CREATE TABLE public.store_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('avatar', 'theme', 'cosmetic')),
  item_key TEXT NOT NULL UNIQUE,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user purchases table
CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  store_item_id UUID REFERENCES public.store_items NOT NULL,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, store_item_id)
);

-- Add Row Level Security
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Store items are public (everyone can see them)
CREATE POLICY "Anyone can view store items" 
  ON public.store_items 
  FOR SELECT 
  USING (true);

-- User purchases policies
CREATE POLICY "Users can view their own purchases" 
  ON public.user_purchases 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" 
  ON public.user_purchases 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" 
  ON public.user_purchases 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert some sample store items
INSERT INTO public.store_items (name, description, price, category, item_key) VALUES
('Trading Cap', 'A stylish cap for professional traders', 100, 'avatar', 'trading_cap'),
('Dark Blue Theme', 'An exclusive dark blue dashboard theme', 250, 'theme', 'dark_blue_theme'),
('Golden Badge', 'A premium golden badge for your profile', 150, 'cosmetic', 'golden_badge'),
('VIP Border', 'An exclusive border around your profile', 300, 'cosmetic', 'vip_border');

-- Create trigger to update updated_at column
CREATE TRIGGER update_store_items_updated_at 
  BEFORE UPDATE ON public.store_items 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
