
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
    const { strategyName, strategyDescription, difficulty, tags } = await req.json();
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `You are an expert trading educator. Create a comprehensive, easy-to-understand lesson about the "${strategyName}" trading strategy.

Strategy Details:
- Name: ${strategyName}
- Description: ${strategyDescription}
- Difficulty Level: ${difficulty}
- Tags: ${tags.join(', ')}

Please structure your lesson as follows:

1. **What is ${strategyName}?**
   - Clear definition and core concept
   - Why traders use this strategy

2. **How it Works**
   - Step-by-step explanation
   - Key indicators or signals to look for
   - Entry and exit rules

3. **Visual Examples**
   - Describe what the setup looks like on a chart
   - Common patterns or formations

4. **Pros and Cons**
   - Advantages of this strategy
   - Potential risks and limitations

5. **Best Market Conditions**
   - When this strategy works best
   - Market conditions to avoid

6. **Risk Management Tips**
   - Specific risk management rules for this strategy
   - Position sizing recommendations

7. **Common Mistakes**
   - What beginners often get wrong
   - How to avoid these pitfalls

Keep the language accessible for ${difficulty.toLowerCase()} traders. Use practical examples and avoid overly technical jargon. Make it engaging and educational.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini API response:', data);
      throw new Error('Invalid response from Gemini API');
    }

    const lesson = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ lesson }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-strategy-lesson function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        lesson: 'Unable to generate lesson content at the moment. Please try again later.' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
