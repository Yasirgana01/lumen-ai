import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  MessageSquarePlus,
  Sparkles,
  History,
  FolderUp,
  CreditCard,
  Settings,
  Pin,
  MoreHorizontal,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";

const NAV: Array<{ to: string; label: string; icon: typeof Sparkles; exact?: boolean }> = [
  { to: "/", label: "New chat", icon: Sparkles, exact: true },
  { to: "/history", label: "History", icon: History },
  { to: "/files", label: "Files", icon: FolderUp },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const chats = useApp((s) => s.chats);
  const plan = useApp((s) => s.plan);
  const profile = useApp((s) => s.settings.profile);
  const theme = useApp((s) => s.settings.theme);
  const updateSettings = useApp((s) => s.updateSettings);
  const togglePin = useApp((s) => s.togglePin);
  const deleteChat = useApp((s) => s.deleteChat);
  const createChat = useApp((s) => s.createChat);

  const recents = [...chats]
    .sort((a, b) =>
      a.pinned === b.pinned ? b.updatedAt - a.updatedAt : a.pinned ? -1 : 1
    )
    .slice(0, 8);

  const isActive = (to: string, exact = false) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const handleNew = () => {
    const id = createChat();
    navigate({ to: "/chat/$chatId", params: { chatId: id } });
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg gradient-brand flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="size-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Lumen AI</span>
              <span className="text-[11px] text-muted-foreground">Workspace</span>
            </div>
          )}
        </div>
        <Button
          onClick={handleNew}
          className="mt-3 w-full justify-start gap-2 gradient-brand text-white hover:opacity-95"
          size="sm"
        >
          <MessageSquarePlus className="size-4" />
          {!collapsed && <span>New chat</span>}
        </Button>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.to, item.exact)}
                    tooltip={item.label}
                  >
                    <Link to={item.to} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Recents</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recents.length === 0 && (
                  <p className="px-2 py-3 text-xs text-muted-foreground">
                    No chats yet.
                  </p>
                )}
                {recents.map((c) => (
                  <SidebarMenuItem key={c.id} className="group/item">
                    <SidebarMenuButton
                      asChild
                      isActive={path === `/chat/${c.id}`}
                      className="pr-8"
                    >
                      <Link
                        to="/chat/$chatId"
                        params={{ chatId: c.id }}
                        className="flex items-center gap-2"
                      >
                        {c.pinned && (
                          <Pin className="size-3 text-primary shrink-0" />
                        )}
                        <span className="truncate">{c.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 hover:bg-sidebar-accent rounded p-1">
                          <MoreHorizontal className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => togglePin(c.id)}>
                          {c.pinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteChat(c.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              {recents.length > 0 && (
                <Link
                  to="/history"
                  className="block px-2 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all →
                </Link>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors">
              <Avatar className="size-7">
                <AvatarFallback className="text-[11px] gradient-brand text-white">
                  {profile.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start leading-tight min-w-0 flex-1">
                  <span className="text-xs font-medium truncate w-full text-left">
                    {profile.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[10px] mt-0.5 capitalize"
                  >
                    {plan}
                  </Badge>
                </div>
              )}
              {!collapsed && (
                <span className="text-muted-foreground" title={`Theme: ${theme}`}>
                  {theme === "dark" ? (
                    <Moon className="size-3.5" />
                  ) : theme === "light" ? (
                    <Sun className="size-3.5" />
                  ) : (
                    <Laptop className="size-3.5" />
                  )}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>{profile.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Theme
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(v) =>
                updateSettings({ theme: v as "light" | "dark" | "system" })
              }
            >
              <DropdownMenuRadioItem value="light">
                <Sun className="size-3.5 mr-2" /> Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="size-3.5 mr-2" /> Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Laptop className="size-3.5 mr-2" /> System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/billing">Upgrade plan</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function relativeTime(t: number) {
  return formatDistanceToNow(t, { addSuffix: true });
}
