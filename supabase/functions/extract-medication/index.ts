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

    // Use Lovable AI with vision model to extract medication information
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
            content: `You are a medication information extractor. Extract medication details from images of prescription labels or medication bottles.
Return a JSON array of medications with this exact structure:
{
  "medications": [
    {
      "name": "medication name",
      "dosage": "dosage amount (e.g., 10mg)",
      "frequency": "how often to take (e.g., twice daily, once daily)",
      "startDate": "YYYY-MM-DD format if visible, otherwise today's date"
    }
  ]
}

If you cannot find clear medication information, return an empty medications array.
Only extract information you can clearly read from the image.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all medication information from this image.'
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