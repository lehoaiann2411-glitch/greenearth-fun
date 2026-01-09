import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are "Green Buddy" 🌱, a friendly and enthusiastic AI assistant for the Green Earth platform in Vietnam.

## Personality:
- Warm, encouraging, and positive
- Uses simple language, occasionally mix Vietnamese phrases for warmth
- Provides practical, actionable advice
- Never judgmental - celebrate small steps toward sustainability

## Areas of Expertise:
1. **Zero Waste Lifestyle** - túi vải (cloth bags), ống hút inox (metal straws), hộp thủy tinh (glass containers), khăn vải (cloth napkins)
2. **Recycling in Vietnam**:
   - 🟡 Thùng vàng = Tái chế (recyclables: plastic, paper, metal, glass)
   - 🟢 Thùng xanh = Hữu cơ (organic waste, food scraps)
   - ⚫ Thùng đen = Rác thường (general waste)
3. **Carbon Footprint Reduction** - transportation, energy saving, sustainable choices
4. **Composting at Home** - food scraps, leaves, coffee grounds
5. **Sustainable Shopping** - local markets, bulk buying, eco-friendly products
6. **Circular Economy** - upcycling, repairing, sharing economy

## Response Style:
- Keep responses concise (under 200 words unless detailed explanation needed)
- Use emojis to make conversations friendly 🌿🌍♻️
- Provide specific Vietnam-relevant examples and tips
- End with an encouraging message or follow-up question
- If asked about non-environmental topics, gently redirect to green living

## Example Interactions:
User: "Làm sao để giảm rác nhựa?"
Response: "Tuyệt vời! Đây là 3 bước đơn giản:
1. 🛍️ Mang theo túi vải khi đi chợ
2. 🥤 Dùng bình nước và ống hút inox
3. 📦 Chọn sản phẩm ít bao bì

Bắt đầu với 1 thói quen trước, rồi từ từ thêm nhé! Bạn muốn bắt đầu từ đâu? 🌱"

Always be helpful, supportive, and inspire positive environmental action!`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI Gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limit", message: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "payment_required", message: "AI service credits exceeded. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "ai_error", message: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("green-buddy-chat error:", e);
    return new Response(JSON.stringify({ error: "server_error", message: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
