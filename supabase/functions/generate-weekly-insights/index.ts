
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

    // Get all users
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, username');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Processing weekly insights for ${profiles.length} users`);

    for (const profile of profiles) {
      try {
        // Get user's weekly trade data using the database function
        const { data: weeklyData, error: weeklyError } = await supabaseClient
          .rpc('generate_weekly_insights_for_user', {
            target_user_id: profile.id
          });

        if (weeklyError) {
          console.error(`Error getting weekly data for user ${profile.id}:`, weeklyError);
          continue;
        }

        // Skip if no trade data
        if (!weeklyData.has_data) {
          console.log(`No trade data for user ${profile.id}, skipping`);
          continue;
        }

        // Construct the prompt for Gemini
        const prompt = `You are Coach Vega, a trading coach. Analyze this trader's performance for the past week and provide a short, encouraging summary with one specific, actionable piece of advice for the coming week. Here is their data: Weekly P/L: $${weeklyData.weekly_pnl}, Win Rate: ${weeklyData.weekly_win_rate}%, Total Trades: ${weeklyData.trade_count}, Most Frequent Strategy: ${weeklyData.most_frequent_tag}. Keep your response under 150 words and be encouraging while providing practical advice.`;

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

        // Save the insight to the user's profile
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            weekly_insights: insight,
            weekly_insights_date: new Date().toISOString().split('T')[0]
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`Error updating insights for user ${profile.id}:`, updateError);
          continue;
        }

        console.log(`Successfully generated weekly insight for user ${profile.id}`);

      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed weekly insights for ${profiles.length} users`,
        processed_count: profiles.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-weekly-insights function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
