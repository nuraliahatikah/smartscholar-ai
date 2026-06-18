import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const InputSchema = z.object({ scholarshipId: z.string().uuid() });

export const getAiInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: scholarship }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("scholarships").select("*").eq("id", data.scholarshipId).maybeSingle(),
    ]);

    if (!scholarship) throw new Error("Scholarship not found");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const prompt = `You are an academic advisor for Malaysian university students. In 2-3 short sentences, explain why this scholarship is or isn't a strong match for the student. Be specific, encouraging, and actionable. Do not use bullet points.

STUDENT PROFILE:
- Name: ${profile?.full_name ?? "Student"}
- University: ${profile?.university ?? "Not provided"}
- Course: ${profile?.course ?? "Not provided"}
- CGPA: ${profile?.cgpa ?? "Not provided"}
- Household income (annual): ${profile?.household_income ?? "Not provided"}
- Interests: ${(profile?.interests ?? []).join(", ") || "Not provided"}

SCHOLARSHIP:
- Name: ${scholarship.name}
- Provider: ${scholarship.provider}
- Amount: RM ${scholarship.amount}
- Eligibility: ${scholarship.eligibility}
- Description: ${scholarship.description}
- Minimum CGPA: ${scholarship.min_cgpa ?? "—"}
- Max household income: ${scholarship.max_household_income ?? "—"}
- Tags: ${(scholarship.tags ?? []).join(", ")}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (res.status === 429) throw new Error("AI is busy right now. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    if (!res.ok) throw new Error(`AI error: ${res.status}`);

    const json = await res.json();
    const insight: string = json?.choices?.[0]?.message?.content ?? "No insight available.";
    return { insight };
  });
