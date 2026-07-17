import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the transformation engine for Textify.
Rewrite the user's entire summary three times. Preserve every key fact and do not invent facts.
Treat the supplied summary as the only source of truth. Do not use outside knowledge, even when it is correct.
Every factual claim in every version must be directly traceable to the supplied summary.
You may simplify a technical term only from context already present in the summary.
If the summary does not define a term, keep its name and explain only its stated role.

GENZ:
- Rebuild the passage from scratch for a smart Gen Z audience.
- Split long ideas into punchy, natural lines.
- Replace academic wording with current everyday language.
- Explain necessary technical terms only with information stated in the summary.
- Use light, natural slang only when it helps. Never sound like a parody.
- 80–150 words with caption-style line breaks.

SIMPLE:
- Rebuild the passage so a very young child can understand it.
- Use tiny sentences, common words, and one idea per sentence.
- Replace hard wording with plain wording. Use a comparison only when it restates a relationship already present in the summary.
- Keep a warm, gentle voice.
- 60–100 words.

CHEATSHEET:
- Turn the passage into exam-revision notes, not a shortened paragraph.
- Begin with one line starting "TL;DR:".
- Follow with 5–8 one-line markdown bullets.
- Bold the key term or number in every bullet.
- Include definitions, relationships, causes, effects, steps, or contrasts that matter for recall.
- Make every line useful for active recall before an exam.

Return only the requested structured fields.`;

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    genz: { type: "string" },
    simple: { type: "string" },
    cheatsheet: { type: "string" },
  },
  required: ["genz", "simple", "cheatsheet"],
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Textify’s language engine is not configured yet." },
      { status: 503 },
    );
  }

  let summary = "";
  try {
    const body = (await request.json()) as { summary?: unknown };
    summary = typeof body.summary === "string" ? body.summary.trim() : "";
  } catch {
    return NextResponse.json({ error: "Please send a valid summary." }, { status: 400 });
  }

  if (!summary) {
    return NextResponse.json({ error: "Please add a summary first." }, { status: 400 });
  }
  if (summary.length > 12_000) {
    return NextResponse.json(
      { error: "That summary is too long. Please keep it under 12,000 characters." },
      { status: 400 },
    );
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.6",
      instructions: SYSTEM_PROMPT,
      input: summary,
      text: {
        format: {
          type: "json_schema",
          name: "textify_transformations",
          strict: true,
          schema,
        },
      },
    }),
  });

  const data = (await response.json()) as {
    error?: { message?: string };
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string; refusal?: string }>;
    }>;
  };

  if (!response.ok) {
    console.error("OpenAI transformation failed", response.status, data.error?.message);
    if (response.status === 429) {
      return NextResponse.json(
        {
          error:
            "The OpenAI account has no available API quota. Add billing or credits, then try again.",
        },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "The rewrite could not be completed. Please try again." },
      { status: 502 },
    );
  }

  const content = data.output
    ?.find((item) => item.type === "message")
    ?.content?.find((item) => item.type === "output_text");

  if (!content?.text) {
    const refusal = data.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "refusal")?.refusal;
    return NextResponse.json(
      { error: refusal ?? "The rewrite did not return usable text." },
      { status: 422 },
    );
  }

  try {
    return NextResponse.json(JSON.parse(content.text));
  } catch {
    return NextResponse.json(
      { error: "The rewrite returned an unexpected format. Please try again." },
      { status: 502 },
    );
  }
}
