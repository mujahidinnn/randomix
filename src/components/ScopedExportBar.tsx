import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  Copy,
  CheckCircle,
  Loader,
} from "lucide-react";
import { useStore } from "../store/useStore";
import {
  downloadImage,
  downloadPDF,
  downloadExcel,
  copyPlainText,
} from "../lib/export";
import { ExportScope } from "../types";

type Status = "idle" | "loading" | "done";

interface Props {
  scope: ExportScope;
  captureId: string;
  label?: string;
}

interface Btn {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => Promise<void>;
}

export default function ScopedExportBar({ scope, captureId, label }: Props) {
  const { teams, tournament } = useStore();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Record<string, Status>>({});

  async function run(id: string, fn: () => Promise<void>) {
    setStatus((s) => ({ ...s, [id]: "loading" }));
    try {
      await fn();
    } catch (e) {
      console.error(e);
    }
    setStatus((s) => ({ ...s, [id]: "done" }));
    setTimeout(() => setStatus((s) => ({ ...s, [id]: "idle" })), 2500);
  }

  const buttons: Btn[] = [
    {
      id: "copy",
      icon: <Copy size={13} />,
      label: "Copy Text",
      action: () =>
        copyPlainText(
          scope !== "tournament" ? teams : [],
          scope !== "teams" ? tournament : null,
        ),
    },
    {
      id: "image",
      icon: <ImageIcon size={13} />,
      label: "PNG",
      action: () => downloadImage(captureId, `randomix-${scope}`),
    },
    {
      id: "pdf",
      icon: <FileText size={13} />,
      label: "PDF",
      action: () =>
        downloadPDF({
          teams: scope !== "tournament" ? teams : [],
          tournament: scope !== "teams" ? tournament : null,
          scope,
        }),
    },
    {
      id: "excel",
      icon: <FileSpreadsheet size={13} />,
      label: "Excel",
      action: () =>
        downloadExcel({
          teams: scope !== "tournament" ? teams : [],
          tournament: scope !== "teams" ? tournament : null,
          scope,
        }),
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-montserrat border transition-all
          ${
            open
              ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300"
              : "border-border text-muted hover:border-cyan-400/30 hover:text-text bg-surface2"
          }`}
      >
        <Download size={13} />
        {label ?? "Export"}
      </button>

      {/* Inline action buttons */}
      <AnimatePresence>
        {open &&
          buttons.map((btn, i) => {
            const st = status[btn.id] ?? "idle";
            return (
              <motion.button
                key={btn.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => run(btn.id, btn.action)}
                disabled={st === "loading"}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all
                ${
                  st === "done"
                    ? "border-green-400/40 bg-green-400/10 text-green-400"
                    : "border-border bg-surface2 text-muted hover:border-cyan-400/30 hover:text-cyan-300"
                }`}
                title={btn.label}
              >
                {st === "loading" ? (
                  <Loader size={12} className="animate-spin" />
                ) : st === "done" ? (
                  <CheckCircle size={12} />
                ) : (
                  btn.icon
                )}
                <span>{btn.label}</span>
              </motion.button>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
