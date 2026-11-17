import { useEffect, useMemo, useRef, useState } from "react";

export const lifeEditorUrl = (import.meta.env.VITE_LIFE_EDITOR_URL ?? "").trim();

type LifeEditorDocument = {
  schema: string;
  documentId: string;
  title: string;
  markdown: string;
  plainText: string;
};

type Props = {
  documentId: string;
  title: string;
  markdown: string;
  onApply: (markdown: string) => void;
  onClose: () => void;
};

export function LifeEditorEmbed({ documentId, title, markdown, onApply, onClose }: Props) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState("");
  const editorUrl = useMemo(() => {
    try {
      const url = new URL(lifeEditorUrl);
      if (!["http:", "https:"].includes(url.protocol)) return null;
      url.searchParams.set("documentId", documentId);
      url.searchParams.set("parentOrigin", window.location.origin);
      return url;
    } catch { return null; }
  }, [documentId]);

  useEffect(() => {
    if (!editorUrl) return;
    const origin = editorUrl.origin;
    const receive = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== iframe.current?.contentWindow) return;
      if (!event.data || typeof event.data !== "object" || event.data.documentId !== documentId) return;
      if (event.data.type === "life-editor:ready") {
        iframe.current?.contentWindow?.postMessage({
          type: "life-editor:setDocument", documentId, title, markdown,
        }, origin);
      }
      if (event.data.type === "life-editor:action" && event.data.action === "apply") {
        const document: LifeEditorDocument | undefined = event.data.document;
        if (document?.schema !== "life-editor/1" || document.documentId !== documentId || typeof document.markdown !== "string") {
          setError("Document Life Editor invalide.");
          return;
        }
        if (document.markdown.length > 12000) {
          setError("Le contenu dépasse 12 000 caractères.");
          return;
        }
        onApply(document.markdown);
      }
    };
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("message", receive);
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("message", receive);
      window.removeEventListener("keydown", keydown);
    };
  }, [editorUrl, documentId, title, markdown, onApply, onClose]);

  return <div className="life-editor-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="life-editor-dialog" role="dialog" aria-modal="true" aria-label="Life Editor">
      <header className="life-editor-dialog-header">
        <div><strong>Life Editor</strong><small>Écriture libre · Style Life Desk · Appliquer pour revenir au brief</small></div>
        <button type="button" onClick={onClose} aria-label="Fermer Life Editor">Fermer ✕</button>
      </header>
      {error && <div className="life-editor-warning" role="alert">{error}</div>}
      {editorUrl
        ? <iframe ref={iframe} title="Life Editor, édition du texte source" src={editorUrl.toString()} allow="clipboard-write" />
        : <p>Définissez une URL Life Editor http(s) valide à la compilation.</p>}
    </section>
  </div>;
}
