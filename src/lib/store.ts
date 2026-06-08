import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  title: string;
  pinned?: boolean;
  model: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; // object URL
  uploadedAt: number;
}

export interface Settings {
  theme: "light" | "dark" | "system";
  density: "comfortable" | "compact";
  defaultModel: string;
  temperature: number;
  systemPrompt: string;
  notifyEmail: boolean;
  notifyProduct: boolean;
  profile: { name: string; email: string; avatar?: string };
}

interface AppState {
  chats: Chat[];
  files: UploadedFile[];
  settings: Settings;
  plan: "free" | "pro" | "team";

  createChat: (firstMessage?: string, model?: string) => string;
  appendMessage: (chatId: string, msg: Omit<Message, "id" | "createdAt">) => string;
  updateAssistantMessage: (chatId: string, messageId: string, content: string) => void;
  editUserMessage: (chatId: string, messageId: string, content: string) => string | null;
  renameChat: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
  togglePin: (chatId: string) => void;

  addFiles: (files: File[]) => UploadedFile[];
  removeFile: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  setPlan: (plan: "free" | "pro" | "team") => void;
  clearAll: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultSettings: Settings = {
  theme: "light",
  density: "comfortable",
  defaultModel: "Lumen Pro",
  temperature: 0.7,
  systemPrompt: "You are a helpful, concise assistant.",
  notifyEmail: true,
  notifyProduct: false,
  profile: { name: "Alex Morgan", email: "alex@example.com" },
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      chats: [],
      files: [],
      settings: defaultSettings,
      plan: "free",

      createChat: (firstMessage, model) => {
        const id = uid();
        const now = Date.now();
        const chat: Chat = {
          id,
          title: firstMessage ? firstMessage.slice(0, 60) : "New chat",
          model: model ?? get().settings.defaultModel,
          messages: firstMessage
            ? [{ id: uid(), role: "user", content: firstMessage, createdAt: now }]
            : [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ chats: [chat, ...s.chats] }));
        return id;
      },

      appendMessage: (chatId, msg) => {
        const id = uid();
        set((s) => ({
          chats: s.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  updatedAt: Date.now(),
                  title:
                    c.messages.length === 0 && msg.role === "user"
                      ? msg.content.slice(0, 60)
                      : c.title,
                  messages: [
                    ...c.messages,
                    { ...msg, id, createdAt: Date.now() },
                  ],
                }
              : c
          ),
        }));
        return id;
      },

      updateAssistantMessage: (chatId, messageId, content) =>
        set((s) => ({
          chats: s.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                }
              : c
          ),
        })),

      editUserMessage: (chatId, messageId, content) => {
        let newId: string | null = null;
        set((s) => ({
          chats: s.chats.map((c) => {
            if (c.id !== chatId) return c;
            const idx = c.messages.findIndex((m) => m.id === messageId);
            if (idx === -1 || c.messages[idx].role !== "user") return c;
            newId = uid();
            const truncated = c.messages.slice(0, idx);
            return {
              ...c,
              updatedAt: Date.now(),
              messages: [
                ...truncated,
                {
                  id: newId,
                  role: "user",
                  content,
                  createdAt: Date.now(),
                },
              ],
            };
          }),
        }));
        return newId;
      },

      renameChat: (chatId, title) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === chatId ? { ...c, title } : c)),
        })),

      deleteChat: (chatId) =>
        set((s) => ({ chats: s.chats.filter((c) => c.id !== chatId) })),

      togglePin: (chatId) =>
        set((s) => ({
          chats: s.chats.map((c) =>
            c.id === chatId ? { ...c, pinned: !c.pinned } : c
          ),
        })),

      addFiles: (files) => {
        const created: UploadedFile[] = files.map((f) => ({
          id: uid(),
          name: f.name,
          size: f.size,
          type: f.type || "application/octet-stream",
          url: URL.createObjectURL(f),
          uploadedAt: Date.now(),
        }));
        set((s) => ({ files: [...created, ...s.files] }));
        return created;
      },

      removeFile: (id) =>
        set((s) => ({ files: s.files.filter((f) => f.id !== id) })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      setPlan: (plan) => set({ plan }),

      clearAll: () => set({ chats: [], files: [] }),
    }),
    {
      name: "lumen-app",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (s) => ({
        chats: s.chats,
        settings: s.settings,
        plan: s.plan,
      }),
    }
  )
);
