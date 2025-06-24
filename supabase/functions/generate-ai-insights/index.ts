
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trades } = await req.json();

    if (!trades || trades.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No trade data provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Calculate basic metrics for context
    const closedTrades = trades.filter((t: any) => !t.isOpen && t.pnl !== null);
    const winningTrades = closedTrades.filter((t: any) => t.pnl > 0);
    const losingTrades = closedTrades.filter((t: any) => t.pnl < 0);
    const totalPnL = closedTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    // Prepare prompt for AI
    const prompt = `As Coach Vega, an expert trading mentor, analyze these recent trades and provide a personalized insight:

Recent Trading Data:
- Total trades analyzed: ${trades.length}
- Closed trades: ${closedTrades.length}
- Win rate: ${winRate.toFixed(1)}%
- Total P/L: $${totalPnL.toFixed(2)}
- Winning trades: ${winningTrades.length}
- Losing trades: ${losingTrades.length}

Trade Details:
${trades.slice(0, 5).map((t: any, i: number) => 
  `${i + 1}. ${t.symbol} (${t.type}) - ${t.isOpen ? 'Open' : `Closed: $${t.pnl?.toFixed(2) || 'N/A'}`}${t.notes ? ` - Notes: ${t.notes}` : ''}`
).join('\n')}

Provide a brief, encouraging insight (2-3 sentences) focusing on:
1. One specific strength or pattern you notice
2. One actionable improvement suggestion
3. A motivational closing

Keep it personal, specific, and under 100 words. Write as Coach Vega speaking directly to the trader.`;

    // For now, return a structured response based on the data
    // In a real implementation, you would call Gemini API here
    let insight = "";
    
    if (winRate >= 60) {
      insight = `Great consistency! Your ${winRate.toFixed(0)}% win rate shows solid decision-making skills. I notice you're maintaining discipline with your entries. To level up, focus on increasing your average winner size - perhaps by letting profitable trades run a bit longer. Keep trusting your process, you're on the right track! 📈`;
    } else if (winRate >= 40) {
      insight = `Your trading shows good potential with balanced risk-taking. The ${closedTrades.length} trades give us solid data to work with. Consider tightening your entry criteria to improve that win rate - quality over quantity often wins in trading. Stay patient and keep analyzing what works best for your style! 🎯`;
    } else if (closedTrades.length < 3) {
      insight = `You're just getting started - that's exciting! Every successful trader began exactly where you are now. Focus on consistent trade logging and following your strategy. The key is building good habits early. Each trade is a learning opportunity, so keep documenting your thoughts and stay curious! 🚀`;
    } else {
      insight = `I see you're working through some challenges, which is completely normal in trading. Your willingness to track and analyze shows real commitment. Consider reviewing your risk management - sometimes smaller position sizes while you refine your strategy can boost confidence. Every professional trader has been here! 💪`;
    }

    return new Response(
      JSON.stringify({ insight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-ai-insights function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate insight' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
