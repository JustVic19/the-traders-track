
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

    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log(`Generating quick insight for user: ${user_id}`);

    // Get user's last 3-5 trades
    const { data: trades, error: tradesError } = await supabaseClient
      .from('trades')
      .select('symbol, trade_type, profit_loss, entry_date, exit_date, notes')
      .eq('user_id', user_id)
      .eq('is_open', false)
      .not('profit_loss', 'is', null)
      .order('exit_date', { ascending: false })
      .limit(5);

    if (tradesError) {
      console.error('Error fetching trades:', tradesError);
      throw tradesError;
    }

    if (!trades || trades.length === 0) {
      return new Response(
        JSON.stringify({ 
          insight: "Start logging some trades and I'll give you personalized feedback on your recent performance!",
          has_data: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format trade data for the prompt
    const tradesData = trades.map((trade, index) => {
      const profitLossFormatted = trade.profit_loss >= 0 
        ? `+$${trade.profit_loss.toFixed(2)}` 
        : `-$${Math.abs(trade.profit_loss).toFixed(2)}`;
      
      return `Trade ${index + 1}: ${trade.symbol} ${trade.trade_type} - ${profitLossFormatted}${trade.notes ? ` (Notes: ${trade.notes})` : ''}`;
    }).join('\n');

    // Construct the prompt
    const prompt = `You are Coach Vega, an expert trading mentor. Based only on my last few trades, give me a single, actionable sentence of feedback or observation. Here are the trades:

${tradesData}

Provide one specific, encouraging insight or actionable advice in 25 words or less.`;

    console.log('Calling Gemini API for quick insight...');

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
      console.error('Gemini API error:', await geminiResponse.text());
      throw new Error('Failed to generate insight');
    }

    const geminiData = await geminiResponse.json();
    const insight = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!insight) {
      throw new Error('No insight generated from Gemini API');
    }

    console.log('Successfully generated quick insight');

    return new Response(
      JSON.stringify({ 
        insight: insight.trim(),
        has_data: true,
        trades_analyzed: trades.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quick-insights function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
