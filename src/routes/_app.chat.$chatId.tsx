import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { ChatComposer } from "@/components/chat/composer";
import { MessageBubble } from "@/components/chat/message";
import { streamChat } from "@/lib/stream-chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/chat/$chatId")({
  component: ChatView,
});

function ChatView() {
  const { chatId } = Route.useParams();
  const navigate = useNavigate();
  const chat = useApp((s) => s.chats.find((c) => c.id === chatId));
  const appendMessage = useApp((s) => s.appendMessage);
  const updateAssistant = useApp((s) => s.updateAssistantMessage);
  const editUserMessage = useApp((s) => s.editUserMessage);
  const systemPrompt = useApp((s) => s.settings.systemPrompt);

  const scrollRef = useRef<HTMLDivElement>(null);
  const respondingRef = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat?.messages.length, chat?.messages.at(-1)?.content]);

  // Auto-respond if the last message is a user message with no reply yet
  useEffect(() => {
    if (!chat) return;
    const last = chat.messages.at(-1);
    if (!last || last.role !== "user") return;
    const key = `${chat.id}:${last.id}`;
    if (respondingRef.current.has(key)) return;
    respondingRef.current.add(key);

    const chatId = chat.id;
    const model = chat.model;
    const history = chat.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const assistantId = appendMessage(chatId, { role: "assistant", content: "" });
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsStreaming(true);

    let acc = "";
    streamChat({
      messages: history,
      model,
      system: systemPrompt,
      signal: ctrl.signal,
      onDelta: (d) => {
        acc += d;
        updateAssistant(chatId, assistantId, acc);
      },
    })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        const msg = err instanceof Error ? err.message : "Something went wrong";
        toast.error(msg);
        updateAssistant(
          chatId,
          assistantId,
          acc || `_⚠️ ${msg}_`,
        );
      })
      .finally(() => {
        setIsStreaming(false);
        if (abortRef.current === ctrl) abortRef.current = null;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?.messages.at(-1)?.id]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-lg font-semibold">Chat not found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            It may have been deleted.
          </p>
          <Button className="mt-4" onClick={() => navigate({ to: "/" })}>
            Start a new chat
          </Button>
        </div>
      </div>
    );
  }

  const send = (text: string, _model: string) => {
    appendMessage(chat.id, { role: "user", content: text });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="border-b px-4 py-2 flex items-center gap-2 sticky top-12 bg-background/80 backdrop-blur z-10">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 -ml-1"
          onClick={() => (window.history.length > 1 ? window.history.back() : navigate({ to: "/" }))}
          title="Back"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-sm font-medium truncate">{chat.title}</h1>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {chat.model}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {chat.messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              canEdit={!isStreaming}
              onEdit={(messageId, newContent) => {
                abortRef.current?.abort();
                editUserMessage(chat.id, messageId, newContent);
              }}
            />
          ))}
        </div>
      </div>

      <div className="border-t bg-background/80 backdrop-blur">
        <div className="max-w-3xl mx-auto p-4">
          <ChatComposer
            onSend={send}
            defaultModel={chat.model}
            placeholder="Reply to Lumen…"
            isStreaming={isStreaming}
            onStop={() => abortRef.current?.abort()}
          />
        </div>
      </div>
    </div>
  );
}
