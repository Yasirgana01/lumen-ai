import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Sparkles, User, Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Message } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface Props {
  message: Message;
  onEdit?: (messageId: string, newContent: string) => void;
  canEdit?: boolean;
}

export function MessageBubble({ message, onEdit, canEdit }: Props) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUser = message.role === "user";

  useEffect(() => {
    if (!editing) return;
    setDraft(message.content);
    const el = textareaRef.current;
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      el.style.height = "0px";
      el.style.height = Math.min(el.scrollHeight, 320) + "px";
    }
  }, [editing, message.content]);

  const copy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submitEdit = () => {
    const next = draft.trim();
    if (!next || next === message.content) {
      setEditing(false);
      return;
    }
    onEdit?.(message.id, next);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="size-7 rounded-full gradient-brand flex items-center justify-center text-white shrink-0 mt-0.5">
          <Sparkles className="size-3.5" />
        </div>
      )}
      <div
        className={`group max-w-[85%] sm:max-w-[80%] ${
          isUser
            ? editing
              ? "w-full"
              : "bg-secondary text-secondary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5"
            : "text-foreground"
        }`}
      >
        {isUser && editing ? (
          <div className="rounded-2xl border bg-card focus-within:ring-2 focus-within:ring-primary/30 transition">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                const el = e.currentTarget;
                el.style.height = "0px";
                el.style.height = Math.min(el.scrollHeight, 320) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  submitEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setEditing(false);
                }
              }}
              rows={1}
              className="w-full bg-transparent resize-none p-3 text-sm outline-none scrollbar-thin"
            />
            <div className="flex items-center justify-end gap-2 px-2 pb-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => setEditing(false)}
              >
                <X className="size-3" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={submitEdit}
                disabled={!draft.trim() || draft.trim() === message.content}
                className="h-7 px-3 text-xs gradient-brand text-white"
              >
                Send
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose-chat text-sm">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : message.content === "" ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <span className="size-1.5 rounded-full bg-current animate-pulse" />
                <span className="size-1.5 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
              </span>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {!editing && (
          <div
            className={`mt-2 flex items-center gap-3 text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition ${
              isUser ? "justify-end" : ""
            }`}
          >
            {isUser && canEdit && onEdit && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 hover:text-foreground"
                title="Edit and regenerate"
              >
                <Pencil className="size-3" /> Edit
              </button>
            )}
            {!isUser && message.content !== "" && (
              <button
                onClick={copy}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                {copied ? (
                  <>
                    <Check className="size-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3" /> Copy
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
          <User className="size-3.5" />
        </div>
      )}
    </motion.div>
  );
}
