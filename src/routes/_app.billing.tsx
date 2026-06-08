import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Sparkles, Zap, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({
    meta: [
      { title: "Billing & plans — Lumen AI" },
      { name: "description", content: "Choose the plan that fits your workflow." },
    ],
  }),
  component: BillingPage,
});

const TIERS = [
  {
    id: "free" as const,
    name: "Free",
    icon: Sparkles,
    monthly: 0,
    yearly: 0,
    description: "For trying out Lumen.",
    features: [
      "20 messages / day",
      "100 MB file storage",
      "Lumen Fast and Lumen-mini",
      "Community support",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    icon: Zap,
    monthly: 20,
    yearly: 16,
    description: "For individuals doing serious work.",
    highlight: true,
    features: [
      "Unlimited messages",
      "10 GB file storage",
      "All frontier models",
      "Priority queues",
      "Email support",
    ],
  },
  {
    id: "team" as const,
    name: "Team",
    icon: Users,
    monthly: 30,
    yearly: 25,
    description: "For small teams shipping together.",
    features: [
      "Everything in Pro",
      "Shared workspaces",
      "Admin & billing roles",
      "100 GB pooled storage",
      "SSO & audit log",
    ],
  },
];

function BillingPage() {
  const plan = useApp((s) => s.plan);
  const setPlan = useApp((s) => s.setPlan);
  const chats = useApp((s) => s.chats);
  const files = useApp((s) => s.files);
  const [yearly, setYearly] = useState(true);

  const messages = chats.reduce((n, c) => n + c.messages.length, 0);
  const storageMB = files.reduce((n, f) => n + f.size, 0) / (1024 * 1024);

  const choose = (id: "free" | "pro" | "team") => {
    if (id === plan) {
      toast.message("That's your current plan.");
      return;
    }
    setPlan(id);
    toast.success(`Switched to ${id.toUpperCase()} (mock checkout)`);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your plan and usage.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div>
              <p className="text-xs text-muted-foreground">Current plan</p>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-xl font-semibold capitalize">{plan}</h2>
                <Badge className="gradient-brand text-white border-0">Active</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => toast.message("Manage billing — coming soon")}>
              Manage billing
            </Button>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            <UsageBar label="Messages" value={messages} max={plan === "free" ? 600 : 10000} unit="" />
            <UsageBar
              label="Storage"
              value={Math.round(storageMB)}
              max={plan === "free" ? 100 : plan === "pro" ? 10240 : 102400}
              unit=" MB"
            />
            <UsageBar label="Chats" value={chats.length} max={plan === "free" ? 50 : 9999} unit="" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className={`text-sm ${!yearly ? "font-medium" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <Switch checked={yearly} onCheckedChange={setYearly} />
          <span className={`text-sm ${yearly ? "font-medium" : "text-muted-foreground"}`}>
            Yearly
          </span>
          {yearly && (
            <Badge variant="secondary" className="ml-1">
              Save 20%
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {TIERS.map((t) => {
            const price = yearly ? t.yearly : t.monthly;
            const isCurrent = plan === t.id;
            return (
              <div
                key={t.id}
                className={`rounded-2xl border p-6 flex flex-col bg-card transition ${
                  t.highlight
                    ? "border-primary/40 ring-1 ring-primary/20 shadow-md relative"
                    : ""
                }`}
              >
                {t.highlight && (
                  <Badge className="absolute -top-2.5 left-6 gradient-brand text-white border-0">
                    Most popular
                  </Badge>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <t.icon className={`size-4 ${t.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="font-semibold">{t.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{t.description}</p>
                <div className="mb-5">
                  <span className="text-3xl font-semibold tracking-tight">
                    ${price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {price === 0 ? " forever" : "/mo"}
                  </span>
                  {yearly && price > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      billed ${price * 12}/year
                    </p>
                  )}
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm">
                      <Check className="size-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => choose(t.id)}
                  disabled={isCurrent}
                  className={`w-full ${t.highlight ? "gradient-brand text-white" : ""}`}
                  variant={t.highlight ? "default" : "outline"}
                >
                  {isCurrent ? "Current plan" : t.id === "free" ? "Downgrade" : `Upgrade to ${t.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          Prices in USD. Cancel anytime. Real Stripe checkout can be wired up on request.
        </p>
      </div>
    </div>
  );
}

function UsageBar({
  label,
  value,
  max,
  unit,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium tabular-nums">
          {value.toLocaleString()}
          {unit} <span className="text-muted-foreground">/ {max.toLocaleString()}{unit}</span>
        </span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
