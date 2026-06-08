const REPLIES = [
  `Sure — here's a clean way to think about it:\n\n1. **Define the goal** in one sentence.\n2. **List constraints** (time, budget, scope).\n3. **Pick the smallest viable next step** and ship it within 24 hours.\n\nWant me to draft that next step for you?`,
  `Good question. The short version:\n\n- It's an **abstraction** that hides complexity behind a stable API.\n- The trade-off is flexibility for clarity.\n- Use it when the surface area changes more often than the internals.\n\nLet me know if you'd like a code example.`,
  `Here's a tightened version:\n\n> The fastest way to learn is to ship something small, watch how people use it, then improve the parts that matter.\n\nIt removes hedging and lands the point in one breath.`,
  "```ts\nfunction debounce<T extends (...a: unknown[]) => void>(fn: T, ms = 200) {\n  let t: ReturnType<typeof setTimeout> | undefined;\n  return (...args: Parameters<T>) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), ms);\n  };\n}\n```\n\nUse it for resize / search-input handlers — anywhere bursty calls would otherwise overwhelm downstream work.",
  `Three angles to consider:\n\n- **User** — what becomes obvious that wasn't before?\n- **Business** — what does it unlock 6 months out?\n- **Team** — what does it cost to maintain?\n\nA decision that wins on at least two is usually the right call.`,
  `Got it. Here's a concise plan:\n\n| Step | Owner | Done by |\n|---|---|---|\n| Draft brief | You | Tue |\n| Review | Team | Wed |\n| Ship v1 | Eng | Fri |\n\nWant me to expand any row?`,
];

export function mockReplyTo(prompt: string): string {
  // crude routing: code questions get the code reply
  const p = prompt.toLowerCase();
  if (/\bcode|function|typescript|sql|bug\b/.test(p)) return REPLIES[3];
  if (/\bplan|roadmap|launch|schedule\b/.test(p)) return REPLIES[5];
  if (/\bpolish|tighten|edit|rewrite\b/.test(p)) return REPLIES[2];
  return REPLIES[Math.floor(Math.random() * REPLIES.length)];
}

export function simulateStream(
  full: string,
  onChunk: (partial: string) => void,
  opts: { chunkSize?: number; intervalMs?: number } = {}
): () => void {
  const { chunkSize = 3, intervalMs = 18 } = opts;
  let i = 0;
  const id = setInterval(() => {
    i = Math.min(full.length, i + chunkSize);
    onChunk(full.slice(0, i));
    if (i >= full.length) clearInterval(id);
  }, intervalMs);
  return () => clearInterval(id);
}
