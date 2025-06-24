
-- Add avatar configuration columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS equipped_hat TEXT,
ADD COLUMN IF NOT EXISTS equipped_outfit TEXT,
ADD COLUMN IF NOT EXISTS equipped_aura TEXT;

-- Update user_inventory table to have better tracking of equipped items by category
-- We'll use the existing is_equipped column but make it work per category

-- Create a function to equip an item and unequip others in the same category
CREATE OR REPLACE FUNCTION public.equip_avatar_item(
  user_profile_id UUID,
  item_id UUID,
  item_category TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- First, unequip all items of the same category for this user
  UPDATE user_inventory 
  SET is_equipped = false
  WHERE user_id = user_profile_id 
    AND store_item_id IN (
      SELECT id FROM store_items WHERE category = item_category
    );
  
  -- Then equip the selected item
  UPDATE user_inventory 
  SET is_equipped = true
  WHERE user_id = user_profile_id AND store_item_id = item_id;
  
  -- Update the profile with the equipped item key
  IF item_category = 'avatar' THEN
    UPDATE profiles SET equipped_hat = (SELECT item_key FROM store_items WHERE id = item_id) WHERE id = user_profile_id;
  ELSIF item_category = 'theme' THEN
    UPDATE profiles SET equipped_outfit = (SELECT item_key FROM store_items WHERE id = item_id) WHERE id = user_profile_id;
  ELSIF item_category = 'cosmetic' THEN
    UPDATE profiles SET equipped_aura = (SELECT item_key FROM store_items WHERE id = item_id) WHERE id = user_profile_id;
  END IF;
  
  result := json_build_object(
    'success', true,
    'message', 'Item equipped successfully'
  );
  RETURN result;
END;
$$;
