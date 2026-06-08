import { createFileRoute } from "@tanstack/react-router";

const FAST_DEFAULT = "gpt-4o-mini";

const MODEL_MAP: Record<string, string> = {
  "Lumen Pro": "gpt-4o-mini",
  "Lumen Fast": "gpt-4o-mini",
  "Lumen Creative": "gpt-4o",
  "Lumen-mini": FAST_DEFAULT,
};

function resolveModel(name?: string) {
  if (!name) return FAST_DEFAULT;
  return MODEL_MAP[name] ?? name;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LUMEN_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "LUMEN_API_KEY is not configured" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }

        let body: { messages?: Array<{ role: string; content: string }>; model?: string; system?: string };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const messages = body.messages ?? [];
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response(JSON.stringify({ error: "messages required" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const system =
          body.system?.trim() ||
          "You are Lumen, a calm, concise AI assistant. Be brief — prefer short, direct answers in clear Markdown. Use code blocks only when needed.";

        const apiUrl =
          process.env.LUMEN_API_URL ?? "https://api.openai.com/v1/chat/completions";
        const upstream = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: resolveModel(body.model),
            stream: true,
            messages: [{ role: "system", content: system }, ...messages],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          if (upstream.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit reached. Please try again shortly." }),
              { status: 429, headers: { "content-type": "application/json" } },
            );
          }
          if (upstream.status === 402) {
            return new Response(
              JSON.stringify({
                error: "Credits exhausted. Check your provider billing settings.",
              }),
              { status: 402, headers: { "content-type": "application/json" } },
            );
          }
          console.error("AI gateway error:", upstream.status, text);
          return new Response(JSON.stringify({ error: "AI gateway error" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(upstream.body, {
          headers: {
            "content-type": "text/event-stream",
            "cache-control": "no-cache",
            connection: "keep-alive",
          },
        });
      },
    },
  },
});
