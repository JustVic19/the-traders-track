
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, trade_data } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the trade and associated trading plan
    const { data: tradeWithPlan, error: tradeError } = await supabaseClient
      .from('trades')
      .select(`
        *,
        trading_plans (
          title,
          entry_rules,
          exit_rules,
          risk_management_rules
        )
      `)
      .eq('id', trade_data.trade_id)
      .single()

    if (tradeError) {
      throw tradeError
    }

    let prompt = ''
    
    if (tradeWithPlan.trading_plans) {
      // Trade is linked to a playbook strategy
      const plan = tradeWithPlan.trading_plans
      prompt = `You are Coach Vega, a trading coach. A trader executed a trade using their "${plan.title}" strategy from their playbook. 

Strategy Rules:
- Entry Rules: ${plan.entry_rules}
- Exit Rules: ${plan.exit_rules}  
- Risk Management: ${plan.risk_management_rules}

Trade Details:
- Symbol: ${tradeWithPlan.symbol}
- Type: ${tradeWithPlan.trade_type}
- Entry Price: $${tradeWithPlan.entry_price}
- Exit Price: $${tradeWithPlan.exit_price || 'Still open'}
- P/L: $${tradeWithPlan.profit_loss || 'N/A'}
- Notes: ${tradeWithPlan.notes || 'No notes provided'}

Analyze whether this trade followed or broke the specific rules defined in their "${plan.title}" strategy. Provide specific feedback on rule adherence and actionable advice for improvement. Keep it concise but insightful.`
    } else {
      // Standard trade analysis without playbook
      prompt = `You are Coach Vega, a trading coach. Analyze this trade and provide a short, encouraging insight with one specific, actionable piece of advice.

Trade Details:
- Symbol: ${tradeWithPlan.symbol}
- Type: ${tradeWithPlan.trade_type}
- Entry Price: $${tradeWithPlan.entry_price}
- Exit Price: $${tradeWithPlan.exit_price || 'Still open'}
- P/L: $${tradeWithPlan.profit_loss || 'N/A'}
- Notes: ${tradeWithPlan.notes || 'No notes provided'}

Provide constructive feedback and one actionable tip for their next trade.`
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + Deno.env.get('GEMINI_API_KEY'), {
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
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`)
    }

    const insight = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate insight at this time.'

    return new Response(
      JSON.stringify({ insight }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        insight: 'Unable to generate insight at the moment. Please try again later.'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
