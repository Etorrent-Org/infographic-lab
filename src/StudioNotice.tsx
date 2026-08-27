import { useEffect, type ReactNode } from "react";
import "./studio-notice.css";

type NoticeTone = "success" | "warning" | "error";

type StudioNoticeProps = {
  tone: NoticeTone;
  children: ReactNode;
  onClose: () => void;
  autoDismiss?: boolean;
};

const labels: Record<NoticeTone, string> = {
  success: "Terminé",
  warning: "À vérifier",
  error: "Action impossible",
};

const icons: Record<NoticeTone, string> = {
  success: "✓",
  warning: "!",
  error: "×",
};

export function StudioNotice({ tone, children, onClose, autoDismiss = false }: StudioNoticeProps) {
  useEffect(() => {
    if (!autoDismiss) return;
    const timer = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timer);
  }, [autoDismiss, children, onClose]);

  return (
    <div
      className={`studio-notice studio-notice-${tone}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <span className="studio-notice-icon" aria-hidden="true">{icons[tone]}</span>
      <div className="studio-notice-copy">
        <strong>{labels[tone]}</strong>
        <span>{children}</span>
      </div>
      <button type="button" className="studio-notice-close" onClick={onClose} aria-label="Fermer la notification">×</button>
    </div>
  );
}
