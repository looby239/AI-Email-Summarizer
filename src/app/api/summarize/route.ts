import { NextResponse } from "next/server";

import { openai, openAIModel } from "@/lib/openai";

const priorities = ["Low", "Medium", "High", "Urgent"] as const;

type Priority = (typeof priorities)[number];

interface SummaryResult {
  summary: string;
  actionItems: string[];
  priority: Priority;
}

const systemPrompt = `You analyze emails and return a concise, faithful result.
- Summarize the email briefly and clearly in the same language as the email.
- Extract only concrete action items explicitly supported by the email.
- Never invent missing details.
- If there are no action items, return an empty array.
- Always follow the provided JSON schema.

Priority classification:
- Low: Informational only, no action or deadline.
- Medium: Action is requested but no near-term deadline or serious consequence.
- High: Important action, close deadline, escalation, or material business impact.
- Urgent: Immediate action is explicitly required, a deadline is imminent,
  or an active issue is blocking operations.

Use only evidence found in the email. Do not mark an email Urgent merely
because it contains words such as "urgent" or "ASAP".`;

function isSummaryResult(value: unknown): value is SummaryResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;

  return (
    typeof result.summary === "string" &&
    Array.isArray(result.actionItems) &&
    result.actionItems.every((item) => typeof item === "string") &&
    priorities.includes(result.priority as Priority)
  );
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured.");
      return NextResponse.json({ error: "Service is not configured." }, { status: 500 });
    }

    const body: unknown = await request.json();
    const emailContent =
      body && typeof body === "object" && "emailContent" in body
        ? (body as { emailContent?: unknown }).emailContent
        : undefined;

    if (typeof emailContent !== "string" || !emailContent.trim()) {
      return NextResponse.json({ error: "Email content is required." }, { status: 400 });
    }

    if (emailContent.length > 50_000) {
      return NextResponse.json({ error: "Email content is too long." }, { status: 413 });
    }

    const response = await openai.responses.create({
      model: openAIModel,
      instructions: systemPrompt,
      input: emailContent.trim(),
      text: {
        format: {
          type: "json_schema",
          name: "email_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              actionItems: { type: "array", items: { type: "string" } },
              priority: { type: "string", enum: priorities },
            },
            required: ["summary", "actionItems", "priority"],
            additionalProperties: false,
          },
        },
      },
    });

    const result: unknown = JSON.parse(response.output_text);
    if (!isSummaryResult(result)) throw new Error("OpenAI returned an invalid result.");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to summarize email:", error);
    return NextResponse.json({ error: "Unable to process email." }, { status: 500 });
  }
}
