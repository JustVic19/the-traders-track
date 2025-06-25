
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Get all users or specific user from request
    const { user_id } = await req.json().catch(() => ({}));
    
    let profiles;
    if (user_id) {
      // Single user analysis
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id, username')
        .eq('id', user_id);
      
      if (error) throw error;
      profiles = data;
    } else {
      // All users analysis
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('id, username');
      
      if (error) throw error;
      profiles = data;
    }

    console.log(`Processing mistake pattern analysis for ${profiles.length} users`);

    for (const profile of profiles) {
      try {
        // Analyze user's mistake patterns using the database function
        const { data: patternData, error: patternError } = await supabaseClient
          .rpc('analyze_user_mistake_patterns', {
            target_user_id: profile.id
          });

        if (patternError) {
          console.error(`Error analyzing patterns for user ${profile.id}:`, patternError);
          continue;
        }

        // Skip if no data
        if (!patternData.has_data) {
          console.log(`No pattern data for user ${profile.id}, skipping`);
          continue;
        }

        // Construct the prompt for Gemini
        const prompt = `You are Coach Vega, an expert trading mentor. A trader has a specific costly pattern in their trading behavior: "${patternData.pattern_description}". 

Based on this pattern analysis from their last ${patternData.total_trades} trades, provide a personalized, encouraging insight that:
1. Acknowledges this specific pattern without being judgmental
2. Explains why this pattern might be happening psychologically
3. Gives one specific, actionable strategy to overcome it
4. Ends with encouragement about their potential for improvement

Keep your response under 120 words and make it personal and motivating.

Pattern details:
- Pattern type: ${patternData.pattern_type}
- Total trades analyzed: ${patternData.total_trades}
- Friday losses: $${patternData.friday_losses}
- Monday losses: $${patternData.monday_losses}
- Weekend losses: $${patternData.weekend_losses}
- Revenge trades: ${patternData.revenge_trades}
- Quick trades: ${patternData.quick_trades}`;

        // Call Gemini API
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        if (!geminiResponse.ok) {
          console.error(`Gemini API error for user ${profile.id}:`, await geminiResponse.text());
          continue;
        }

        const geminiData = await geminiResponse.json();
        const insight = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!insight) {
          console.error(`No insight generated for user ${profile.id}`);
          continue;
        }

        // Save the mistake pattern insight to the user's profile
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            mistake_pattern_insight: insight,
            mistake_pattern_date: new Date().toISOString().split('T')[0],
            mistake_pattern_type: patternData.pattern_type
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`Error updating insights for user ${profile.id}:`, updateError);
          continue;
        }

        // Generate a custom mission based on the pattern
        const { error: missionError } = await supabaseClient
          .rpc('generate_mistake_pattern_mission', {
            target_user_id: profile.id,
            pattern_type: patternData.pattern_type,
            pattern_description: patternData.pattern_description
          });

        if (missionError) {
          console.error(`Error generating mission for user ${profile.id}:`, missionError);
        }

        console.log(`Successfully generated mistake pattern insight and mission for user ${profile.id}`);

      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed mistake pattern analysis for ${profiles.length} users`,
        processed_count: profiles.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-mistake-patterns function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
