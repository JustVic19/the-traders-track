
-- Add onboarding and persona fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN trader_avatar TEXT,
ADD COLUMN trading_goal TEXT;
