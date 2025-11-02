import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Extracting medication info from image...');

    // Use Lovable AI with better vision model to extract medication information
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are an expert medication information extractor. Carefully analyze images of prescription labels, medication bottles, pill containers, or prescription documents.

IMPORTANT INSTRUCTIONS:
1. Look for medication names (generic or brand names)
2. Find dosage information (e.g., 10mg, 500mg, 5ml)
3. Identify frequency (e.g., "once daily", "twice daily", "every 8 hours", "as needed")
4. Check for dates if visible
5. If the image shows handwritten prescriptions, typed labels, or printed text on bottles, extract all readable medication information
6. Be thorough - even if text is slightly blurry, attempt to extract what you can read

Return extracted medications using the function call. If you genuinely cannot find ANY medication information, return an empty array.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please carefully examine this image and extract ALL medication information you can find. Look for medication names, dosages, frequencies, and any dates. Even if the image quality is not perfect, extract what you can clearly identify.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_medications",
              description: "Extract medication information from the image",
              parameters: {
                type: "object",
                properties: {
                  medications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        dosage: { type: "string" },
                        frequency: { type: "string" },
                        startDate: { type: "string" }
                      },
                      required: ["name", "dosage", "frequency", "startDate"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["medications"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_medications" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to process image');
    }

    const result = await response.json();
    console.log('AI response:', JSON.stringify(result, null, 2));

    // Extract the tool call result
    const toolCall = result.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No medication data extracted');
    }

    const medications = JSON.parse(toolCall.function.arguments);
    console.log('Extracted medications:', medications);

    return new Response(
      JSON.stringify(medications),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-medication:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, medications: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});