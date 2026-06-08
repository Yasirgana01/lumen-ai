import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, Mic, Square } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const MODELS = ["Lumen Pro", "Lumen Fast", "Lumen Creative", "Lumen-mini"];

interface Props {
  onSend: (text: string, model: string) => void;
  placeholder?: string;
  defaultModel?: string;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
}

export function ChatComposer({
  onSend,
  placeholder = "Ask anything…",
  defaultModel = "Lumen Pro",
  disabled,
  isStreaming,
  onStop,
}: Props) {
  const [text, setText] = useState("");
  const [model, setModel] = useState(defaultModel);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [text]);

  const send = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t, model);
    setText("");
  };

  return (
    <div className="rounded-2xl border bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition">
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        rows={1}
        placeholder={placeholder}
        className="w-full bg-transparent resize-none p-4 pb-2 text-sm outline-none placeholder:text-muted-foreground scrollbar-thin"
      />
      <div className="flex items-center gap-1.5 px-2 pb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          title="Attach file"
        >
          <Paperclip className="size-4" />
        </Button>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="h-8 border-0 bg-transparent gap-1 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-0 shadow-none w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((m) => (
              <SelectItem key={m} value={m} className="text-xs">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          title="Voice input (mock)"
        >
          <Mic className="size-4" />
        </Button>
        {isStreaming ? (
          <Button
            type="button"
            onClick={onStop}
            size="icon"
            className="size-8 rounded-full bg-foreground text-background hover:bg-foreground/90"
            title="Stop generating"
          >
            <Square className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={send}
            disabled={!text.trim() || disabled}
            size="icon"
            className="size-8 rounded-full gradient-brand text-white disabled:opacity-40"
          >
            <ArrowUp className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
