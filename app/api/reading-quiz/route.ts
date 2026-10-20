import { NextRequest, NextResponse } from "next/server";
import { ARTICLES_BY_ID } from "@/lib/articles";
import { buildOfflineReadingQuiz, validReadingQuestions, type ReadingQuizResult } from "@/lib/reading-quiz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fallback(articleId: string): ReadingQuizResult {
  return buildOfflineReadingQuiz(ARTICLES_BY_ID[articleId]);
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 2000) {
    return NextResponse.json({ error: "Yêu cầu quá lớn." }, { status: 413 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  const articleId = typeof body === "object" && body !== null && "articleId" in body
    ? (body as { articleId?: unknown }).articleId : undefined;
  if (typeof articleId !== "string" || !Object.hasOwn(ARTICLES_BY_ID, articleId)) {
    return NextResponse.json({ error: "Không tìm thấy bài đọc." }, { status: 404 });
  }
  const article = ARTICLES_BY_ID[articleId];
  const offline = fallback(articleId);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json(offline, { headers: { "Cache-Control": "no-store" } });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.OPENAI_READING_MODEL || "gpt-4.1-mini",
          store: false,
          max_output_tokens: 2300,
          instructions: [
            "You are a careful English reading coach for CEFR B2-C2 learners.",
            "Generate exactly 5 challenging four-choice comprehension questions in English.",
            "Include a mix of main idea, inference, author stance, contextual vocabulary and detail.",
            "Use only the supplied article. Exactly one option correct, and no trick questions.",
            "Provide concise Vietnamese explanations referring to evidence in the article.",
            "Return only the specified JSON; avoid unsupported facts."
          ].join(" "),
          input: JSON.stringify({
            title: article.title,
            level: article.level,
            paragraphs: article.paragraphs
          }),
          text: {
            format: {
              type: "json_schema",
              name: "reading_comprehension",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["questions"],
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["id", "prompt", "options", "answerIndex", "explanation"],
                      properties: {
                        id: { type: "string" },
                        prompt: { type: "string" },
                        options: { type: "array", items: { type: "string" } },
                        answerIndex: { type: "integer" },
                        explanation: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        })
      });
      if (!response.ok) return NextResponse.json(offline, { headers: { "Cache-Control": "no-store" } });
      const data: unknown = await response.json();
      const output = (data as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }).output;
      const jsonText = output?.flatMap((block) => block.content || [])
        .find((block) => block.type === "output_text")?.text;
      if (!jsonText) return NextResponse.json(offline, { headers: { "Cache-Control": "no-store" } });
      const parsed = JSON.parse(jsonText) as { questions?: unknown };
      if (!validReadingQuestions(parsed.questions)) {
        return NextResponse.json(offline, { headers: { "Cache-Control": "no-store" } });
      }
      return NextResponse.json({ source: "ai", questions: parsed.questions } satisfies ReadingQuizResult, {
        headers: { "Cache-Control": "no-store" }
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return NextResponse.json(offline, { headers: { "Cache-Control": "no-store" } });
  }
}
