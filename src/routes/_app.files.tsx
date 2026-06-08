import { createFileRoute } from "@tanstack/react-router";
import { useDropzone } from "react-dropzone";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File as FileIcon,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/files")({
  head: () => ({
    meta: [
      { title: "Files — Lumen AI" },
      { name: "description", content: "Upload and manage files for your AI workflows." },
    ],
  }),
  component: FilesPage,
});

const MAX = 20 * 1024 * 1024;

function iconFor(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.includes("sheet") || type.includes("csv")) return FileSpreadsheet;
  if (type.includes("pdf") || type.includes("text") || type.includes("word"))
    return FileText;
  return FileIcon;
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

function FilesPage() {
  const files = useApp((s) => s.files);
  const addFiles = useApp((s) => s.addFiles);
  const removeFile = useApp((s) => s.removeFile);
  const [view, setView] = useState<"grid" | "list">("grid");

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (accepted, rejected) => {
      const valid = accepted.filter((f) => {
        if (f.size > MAX) {
          toast.error(`${f.name} is over 20MB`);
          return false;
        }
        return true;
      });
      if (rejected.length) toast.error(`${rejected.length} file(s) rejected`);
      if (valid.length) {
        addFiles(valid);
        toast.success(`Added ${valid.length} file${valid.length === 1 ? "" : "s"}`);
      }
    },
    noClick: true,
    noKeyboard: true,
    maxSize: MAX,
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin" {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {files.length} file{files.length === 1 ? "" : "s"} · 20MB max each
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex border rounded-md p-0.5 bg-card">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded ${view === "grid" ? "bg-muted" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded ${view === "list" ? "bg-muted" : "text-muted-foreground"}`}
              >
                <List className="size-3.5" />
              </button>
            </div>
            <Button onClick={open} className="gradient-brand text-white">
              <UploadCloud className="size-4 mr-1.5" /> Upload
            </Button>
          </div>
        </div>

        <button
          onClick={open}
          className={`w-full rounded-2xl border-2 border-dashed p-10 mb-8 transition flex flex-col items-center justify-center text-center ${
            isDragActive
              ? "border-primary bg-accent/40"
              : "border-border hover:border-primary/50 bg-card"
          }`}
        >
          <div className="size-12 rounded-full bg-accent flex items-center justify-center mb-3">
            <UploadCloud className="size-5 text-primary" />
          </div>
          <p className="font-medium text-sm">
            {isDragActive ? "Drop your files here" : "Drag & drop files"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse · PDF, DOCX, TXT, CSV, PNG, JPG · up to 20MB
          </p>
        </button>

        {files.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No files yet.
          </p>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <AnimatePresence>
              {files.map((f) => {
                const Icon = iconFor(f.type);
                return (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group rounded-xl border bg-card p-3 hover:shadow-sm transition relative"
                  >
                    {f.type.startsWith("image/") ? (
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                        <img
                          src={f.url}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-2">
                        <Icon className="size-8 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-xs font-medium truncate">{f.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {fmtSize(f.size)} · {formatDistanceToNow(f.uploadedAt, { addSuffix: true })}
                    </p>
                    <button
                      onClick={() => removeFile(f.id)}
                      className="absolute top-2 right-2 size-7 rounded-md bg-background/90 border opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <ul className="rounded-xl border bg-card divide-y overflow-hidden">
            {files.map((f) => {
              const Icon = iconFor(f.type);
              return (
                <li key={f.id} className="flex items-center gap-3 px-4 py-3 group">
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {fmtSize(f.size)} · {formatDistanceToNow(f.uploadedAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive opacity-0 group-hover:opacity-100"
                    onClick={() => removeFile(f.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
