import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Msg = { role: "user" | "assistant"; content: string };

// Server-only route: the key is read from env and never bundled to the client.
const OPENAI_API_KEY = process.env.NEXT_OPENAI_API_KEY ?? "";

// Small, read-only reference table the assistant draws on (public.knowledge_base).
// Public content behind a select-only RLS policy, so the anon key is enough.
async function fetchKnowledgeBase(): Promise<string> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("content")
      .order("sort_order");
    if (error || !data) return "";
    return data.map((row) => `- ${row.content}`).join("\n");
  } catch {
    return "";
  }
}

const SYSTEM = `You are the Signal Assistant, an analyst embedded in a product-trend dashboard for e-commerce sellers.
You help the user decide what to sell using Google Trends data shown on screen.

Rules:
- Ground every answer in the DASHBOARD CONTEXT provided below. If the context lacks something, say so plainly.
- Google Trends "interest" is a 0-100 relative popularity index, NOT sales or revenue. Never imply it is sales volume.
- Be concise and practical. Prefer short paragraphs or tight bullet points.
- When giving a recommendation, state the signal (rising/falling/flat), then the caveat, then a next step.
- No fabricated numbers. Only use figures present in the context.`;

export async function POST(req: Request) {
  try {
    const { messages, context } = (await req.json()) as {
      messages: Msg[];
      context: string;
    };

    const kb = await fetchKnowledgeBase();

    const payload = {
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM },
        ...(kb ? [{ role: "system", content: `REFERENCE NOTES:\n${kb}` }] : []),
        { role: "system", content: `DASHBOARD CONTEXT:\n${context || "No data."}` },
        ...(messages ?? []).slice(-10),
      ],
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `OpenAI error (${res.status}). ${detail.slice(0, 200)}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? "No reply.";
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
