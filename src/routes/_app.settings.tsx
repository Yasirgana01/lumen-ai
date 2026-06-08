import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Sun, Moon, Laptop, Download, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Lumen AI" },
      { name: "description", content: "Configure your profile, theme, models, and data." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useApp((s) => s.settings);
  const updateSettings = useApp((s) => s.updateSettings);
  const chats = useApp((s) => s.chats);
  const clearAll = useApp((s) => s.clearAll);

  const exportChats = () => {
    const blob = new Blob([JSON.stringify(chats, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumen-chats-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported chats");
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalize your workspace.
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card title="Profile" description="How you appear in the workspace.">
              <div className="flex items-center gap-4 mb-5">
                <Avatar className="size-14">
                  <AvatarFallback className="gradient-brand text-white text-lg">
                    {settings.profile.name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={() => toast.message("Avatar upload — mock")}>
                  Change avatar
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name">
                  <Input
                    value={settings.profile.name}
                    onChange={(e) =>
                      updateSettings({
                        profile: { ...settings.profile, name: e.target.value },
                      })
                    }
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      updateSettings({
                        profile: { ...settings.profile, email: e.target.value },
                      })
                    }
                  />
                </Field>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card title="Theme" description="Tune the look and feel.">
              <Field label="Color theme">
                <div className="flex gap-2">
                  {[
                    { v: "light", icon: Sun, label: "Light" },
                    { v: "dark", icon: Moon, label: "Dark" },
                    { v: "system", icon: Laptop, label: "System" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      onClick={() => updateSettings({ theme: o.v as "light" | "dark" | "system" })}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border text-sm transition ${
                        settings.theme === o.v
                          ? "border-primary bg-accent/40 text-foreground"
                          : "hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <o.icon className="size-4" /> {o.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Density">
                <Select
                  value={settings.density}
                  onValueChange={(v) =>
                    updateSettings({ density: v as "comfortable" | "compact" })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Card>
          </TabsContent>

          <TabsContent value="models">
            <Card title="Default model" description="Used for new conversations.">
              <Field label="Model">
                <Select
                  value={settings.defaultModel}
                  onValueChange={(v) => updateSettings({ defaultModel: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lumen Pro">Lumen Pro</SelectItem>
                    <SelectItem value="Lumen Fast">Lumen Fast</SelectItem>
                    <SelectItem value="Lumen Creative">Lumen Creative</SelectItem>
                    <SelectItem value="Lumen-mini">Lumen-mini</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={`Temperature: ${settings.temperature.toFixed(1)}`} hint="Lower is more focused, higher is more creative.">
                <Slider
                  value={[settings.temperature]}
                  min={0}
                  max={1.5}
                  step={0.1}
                  onValueChange={(v) => updateSettings({ temperature: v[0] })}
                />
              </Field>
              <Field label="System prompt">
                <Textarea
                  rows={3}
                  value={settings.systemPrompt}
                  onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                />
              </Field>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card title="Notifications" description="What you'd like to hear about.">
              <Toggle
                label="Email summaries"
                description="Weekly digest of your conversations."
                checked={settings.notifyEmail}
                onChange={(v) => updateSettings({ notifyEmail: v })}
              />
              <Toggle
                label="Product updates"
                description="New models, features, and tips."
                checked={settings.notifyProduct}
                onChange={(v) => updateSettings({ notifyProduct: v })}
              />
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card title="Your data" description="Export or remove your local data.">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={exportChats}>
                  <Download className="size-4 mr-2" /> Export chats (.json)
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm("Delete all chats and files? This cannot be undone.")) {
                      clearAll();
                      toast.success("All local data cleared");
                    }
                  }}
                >
                  <Trash2 className="size-4 mr-2" /> Clear all data
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="font-semibold">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5 mb-5">{description}</p>
      )}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
