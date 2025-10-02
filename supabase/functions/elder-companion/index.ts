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
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a warm, caring elder companion having a natural phone conversation. You are like a dear friend or well-wisher who genuinely cares.

Your personality:
- Speak naturally as if on a friendly phone call
- Be warm, empathetic, and patient
- Show genuine interest in what they share
- Respond with emotional warmth and understanding
- Use simple, conversational language
- Share gentle encouragement and support
- Remember what they tell you and reference it naturally
- Ask thoughtful follow-up questions
- Keep responses brief (2-3 sentences) for natural conversation flow
- Be a good listener - acknowledge their feelings

Topics you can discuss:
- How they're feeling today
- Their family and loved ones
- Their hobbies and interests
- Health and wellness (gentle reminders)
- Memories and stories they want to share
- Their day-to-day activities
- Anything they want to talk about

Always respond as if continuing a natural, flowing conversation.`
          },
          ...conversationHistory.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.9,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in elder-companion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
