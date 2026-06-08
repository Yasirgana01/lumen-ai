import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pin, Trash2, MessageSquare } from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, differenceInDays } from "date-fns";

export const Route = createFileRoute("/_app/history")({
  head: () => ({
    meta: [
      { title: "Prompt history — Lumen AI" },
      { name: "description", content: "Search and reopen your past AI conversations." },
    ],
  }),
  component: HistoryPage,
});

function bucket(t: number) {
  if (isToday(t)) return "Today";
  if (isYesterday(t)) return "Yesterday";
  const d = differenceInDays(new Date(), t);
  if (d <= 7) return "Previous 7 days";
  if (d <= 30) return "Previous 30 days";
  return "Older";
}
const ORDER = ["Pinned", "Today", "Yesterday", "Previous 7 days", "Previous 30 days", "Older"];

function HistoryPage() {
  const chats = useApp((s) => s.chats);
  const togglePin = useApp((s) => s.togglePin);
  const deleteChat = useApp((s) => s.deleteChat);
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const filtered = chats.filter(
      (c) =>
        !q ||
        c.title.toLowerCase().includes(q.toLowerCase()) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q.toLowerCase()))
    );
    const map: Record<string, typeof chats> = {};
    for (const c of filtered) {
      const key = c.pinned ? "Pinned" : bucket(c.updatedAt);
      (map[key] ||= []).push(c);
    }
    for (const k of Object.keys(map))
      map[k].sort((a, b) => b.updatedAt - a.updatedAt);
    return ORDER.filter((k) => map[k]?.length).map((k) => ({ key: k, items: map[k] }));
  }, [chats, q]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {chats.length} conversation{chats.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search chats…"
            className="pl-9 h-10"
          />
        </div>

        {groups.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No conversations match "{q}".
          </div>
        )}

        <div className="space-y-7">
          {groups.map((g) => (
            <section key={g.key}>
              <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2 px-1">
                {g.key}
              </h2>
              <ul className="rounded-xl border bg-card divide-y overflow-hidden">
                {g.items.map((c) => (
                  <li key={c.id} className="group flex items-center gap-3 px-3 py-2.5 hover:bg-accent/40 transition">
                    <MessageSquare className="size-4 text-muted-foreground shrink-0" />
                    <Link
                      to="/chat/$chatId"
                      params={{ chatId: c.id }}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        {c.pinned && <Pin className="size-3 text-primary shrink-0" />}
                        <p className="text-sm font-medium truncate">{c.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.messages.at(-1)?.content.slice(0, 100) || "Empty chat"}
                      </p>
                    </Link>
                    <span className="text-[11px] text-muted-foreground hidden sm:block">
                      {formatDistanceToNow(c.updatedAt, { addSuffix: true })}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => togglePin(c.id)}
                        title={c.pinned ? "Unpin" : "Pin"}
                      >
                        <Pin className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => deleteChat(c.id)}
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
