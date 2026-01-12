import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WasteAnalysisResult {
  waste_type: string;
  waste_type_vi: string;
  material: string;
  material_vi: string;
  recyclable: boolean;
  bin_color: "yellow" | "blue" | "black" | "red";
  disposal_instructions: string;
  disposal_instructions_vi: string;
  reuse_suggestions: string[];
  reuse_suggestions_vi: string[];
  environmental_note: string;
  environmental_note_vi: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64, image_url } = await req.json();

    if (!image_base64 && !image_url) {
      return new Response(
        JSON.stringify({ error: "Image is required (base64 or URL)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const imageContent = image_base64
      ? { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image_base64}` } }
      : { type: "image_url", image_url: { url: image_url } };

    const systemPrompt = `You are an expert waste classification AI for Vietnam's recycling system. Analyze the image and identify the waste item(s).

IMPORTANT: Return ONLY a valid JSON object with these exact fields:
{
  "waste_type": "English name of the waste type",
  "waste_type_vi": "Vietnamese name",
  "material": "Main material in English",
  "material_vi": "Main material in Vietnamese",
  "recyclable": true or false,
  "bin_color": "yellow" | "blue" | "black" | "red",
  "disposal_instructions": "How to dispose in English",
  "disposal_instructions_vi": "How to dispose in Vietnamese",
  "reuse_suggestions": ["Suggestion 1", "Suggestion 2"],
  "reuse_suggestions_vi": ["Gợi ý 1", "Gợi ý 2"],
  "environmental_note": "Environmental fact in English",
  "environmental_note_vi": "Environmental fact in Vietnamese",
  "confidence": 0.0 to 1.0
}

Vietnam bin colors:
- yellow: Recyclables (plastic, paper, metal, glass)
- blue: Organic waste (food scraps, leaves, biodegradable)
- black: Non-recyclable (styrofoam, mixed materials, dirty items)
- red: Hazardous (batteries, chemicals, medical waste, electronics)

Be specific and helpful. If multiple items, focus on the main one.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this waste item and provide classification details." },
              imageContent,
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const result: WasteAnalysisResult = JSON.parse(jsonStr.trim());

    // Validate bin_color
    if (!["yellow", "blue", "black", "red"].includes(result.bin_color)) {
      result.bin_color = "black"; // Default to non-recyclable
    }

    // Ensure confidence is a number between 0 and 1
    result.confidence = Math.min(1, Math.max(0, result.confidence || 0.8));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-waste error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
