import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { ChatComposer } from "@/components/chat/composer";
import { Sparkles, Lightbulb, Code2, FileText, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Lumen AI — Your calm AI workspace" },
      {
        name: "description",
        content: "Chat with AI, manage prompt history, files, and your subscription in one workspace.",
      },
    ],
  }),
  component: NewChat,
});

const SUGGESTIONS = [
  { icon: Lightbulb, title: "Brainstorm 10 product names", prompt: "Brainstorm 10 distinctive product names for a calm, focus-oriented AI assistant. Avoid generic AI clichés." },
  { icon: Code2, title: "Explain this SQL query", prompt: "Explain step-by-step what this SQL query does and how I could optimize it: SELECT ..." },
  { icon: FileText, title: "Summarize a long document", prompt: "Summarize the key points of the document I'll paste next, in 5 bullet points." },
  { icon: Wand2, title: "Polish my writing", prompt: "Tighten this paragraph for clarity and a warm but professional tone:" },
];

function NewChat() {
  const navigate = useNavigate();
  const createChat = useApp((s) => s.createChat);

  const start = (prompt: string) => {
    const id = createChat(prompt);
    navigate({ to: "/chat/$chatId", params: { chatId: id } });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <div className="inline-flex size-12 rounded-2xl gradient-brand items-center justify-center text-white shadow-lg mb-5">
              <Sparkles className="size-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              How can I help, <span className="text-gradient-brand">today</span>?
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Ask anything, draft together, or pick up where you left off.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-2.5 mb-6">
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                onClick={() => start(s.prompt)}
                className="text-left p-3.5 rounded-xl border bg-card hover:bg-accent/40 hover:border-primary/30 transition-all group"
              >
                <s.icon className="size-4 text-primary mb-2" />
                <p className="text-sm font-medium leading-snug">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {s.prompt}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t bg-background/80 backdrop-blur">
        <div className="max-w-3xl mx-auto p-4">
          <ChatComposer
            onSend={(text) => start(text)}
            placeholder="Message Lumen AI…"
          />
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Lumen may produce inaccurate information.
          </p>
        </div>
      </div>
    </div>
  );
}
