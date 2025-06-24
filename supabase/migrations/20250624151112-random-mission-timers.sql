
-- Update the generate_daily_missions_for_user function to include random but reasonable expiration times
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
  base_hours INTEGER;
  random_hours INTEGER;
BEGIN
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
    
    -- Set base completion time based on mission type and difficulty
    IF template_record.type = 'daily' THEN
      -- Daily missions: 8-16 hours (same day completion expected)
      base_hours := 8;
      random_hours := FLOOR(RANDOM() * 9)::INTEGER; -- 0-8 additional hours
    ELSIF template_record.type = 'weekly' THEN
      -- Weekly missions: 3-5 days (longer term goals)
      base_hours := 72; -- 3 days base
      random_hours := FLOOR(RANDOM() * 49)::INTEGER; -- 0-48 additional hours (up to 2 more days)
    ELSIF template_record.type = 'achievement' THEN
      -- Achievement missions: Based on difficulty/target value
      IF random_target <= 2 THEN
        -- Easy achievements: 12-24 hours
        base_hours := 12;
        random_hours := FLOOR(RANDOM() * 13)::INTEGER; -- 0-12 additional hours
      ELSIF random_target <= 5 THEN
        -- Medium achievements: 1-3 days
        base_hours := 24;
        random_hours := FLOOR(RANDOM() * 49)::INTEGER; -- 0-48 additional hours
      ELSE
        -- Hard achievements: 2-4 days
        base_hours := 48;
        random_hours := FLOOR(RANDOM() * 49)::INTEGER; -- 0-48 additional hours
      END IF;
    ELSE
      -- Default: 1-2 days
      base_hours := 24;
      random_hours := FLOOR(RANDOM() * 25)::INTEGER; -- 0-24 additional hours
    END IF;
    
    -- Calculate expiration time
    expire_time := NOW() + INTERVAL '1 hour' * (base_hours + random_hours);
    
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
