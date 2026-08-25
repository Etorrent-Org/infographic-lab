import { useEffect, useRef, useState } from "react";
import {
  deleteLocalProject,
  duplicateLocalProject,
  renameLocalProject,
  type LocalProjectRecord,
} from "./augmented";
import "./project-library.css";

type ProjectLibraryModalProps = {
  records: LocalProjectRecord[];
  activeProjectId: string | null;
  onOpen: (record: LocalProjectRecord) => void;
  onRestore: (record: LocalProjectRecord, snapshotIndex: number) => void;
  onChanged: () => void;
  onClose: () => void;
};

const focusableSelector = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function focusableElements(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
    return !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true";
  });
}

function focusFirst(container: HTMLElement | null, preferredSelector?: string) {
  if (!container) return;
  const preferred = preferredSelector ? container.querySelector<HTMLElement>(preferredSelector) : null;
  const target = preferred ?? focusableElements(container)[0] ?? container;
  target.focus();
}

function trapTab(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== "Tab" || !container) return;
  const focusable = focusableElements(container);
  if (!focusable.length) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  if (event.shiftKey) {
    if (!active || !container.contains(active) || active === first) {
      event.preventDefault();
      last.focus();
    }
    return;
  }

  if (!active || !container.contains(active) || active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function ProjectLibraryModal({
  records,
  activeProjectId,
  onOpen,
  onRestore,
  onChanged,
  onClose,
}: ProjectLibraryModalProps) {
  const [renameTarget, setRenameTarget] = useState<LocalProjectRecord | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LocalProjectRecord | null>(null);
  const libraryDialogRef = useRef<HTMLElement>(null);
  const renameDialogRef = useRef<HTMLFormElement>(null);
  const deleteDialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const actionTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };
    const currentPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${currentPaddingRight + scrollbarGap}px`;
    }

    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.paddingRight = previous.paddingRight;
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => {
      focusFirst(libraryDialogRef.current, ".studio-project-open");
    });

    return () => {
      window.cancelAnimationFrame(frame);
      const target = returnFocusRef.current;
      if (target && document.contains(target)) {
        window.requestAnimationFrame(() => target.focus());
      }
    };
  }, []);

  useEffect(() => {
    if (!renameTarget) return;
    const frame = window.requestAnimationFrame(() => {
      focusFirst(renameDialogRef.current, "input");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [renameTarget]);

  useEffect(() => {
    if (!deleteTarget) return;
    const frame = window.requestAnimationFrame(() => {
      focusFirst(deleteDialogRef.current, ".studio-dialog-secondary");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [deleteTarget]);

  function restoreActionFocus() {
    const target = actionTriggerRef.current;
    actionTriggerRef.current = null;
    window.requestAnimationFrame(() => {
      if (target && document.contains(target)) {
        target.focus();
        return;
      }
      focusFirst(libraryDialogRef.current, ".studio-project-open");
    });
  }

  function closeRename() {
    setRenameTarget(null);
    restoreActionFocus();
  }

  function closeDelete() {
    setDeleteTarget(null);
    restoreActionFocus();
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (renameTarget) {
          closeRename();
          return;
        }
        if (deleteTarget) {
          closeDelete();
          return;
        }
        onClose();
        return;
      }

      if (renameTarget) {
        trapTab(event, renameDialogRef.current);
        return;
      }
      if (deleteTarget) {
        trapTab(event, deleteDialogRef.current);
        return;
      }
      trapTab(event, libraryDialogRef.current);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteTarget, onClose, renameTarget]);

  function startRename(record: LocalProjectRecord, trigger: HTMLElement) {
    actionTriggerRef.current = trigger;
    setDeleteTarget(null);
    setRenameTarget(record);
    setRenameValue(record.name);
  }

  function startDelete(record: LocalProjectRecord, trigger: HTMLElement) {
    actionTriggerRef.current = trigger;
    setRenameTarget(null);
    setDeleteTarget(record);
  }

  function submitRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!renameTarget) return;
    const nextName = renameValue.trim();
    if (!nextName) return;
    renameLocalProject(renameTarget.id, nextName);
    onChanged();
    closeRename();
  }

  function duplicate(record: LocalProjectRecord) {
    duplicateLocalProject(record.id);
    onChanged();
  }

  function removeProject() {
    if (!deleteTarget) return;
    deleteLocalProject(deleteTarget.id);
    onChanged();
    closeDelete();
  }

  return (
    <div
      className="studio-modal-backdrop studio-library-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={libraryDialogRef}
        className="studio-modal studio-library-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-library-title"
        tabIndex={-1}
      >
        <header>
          <div>
            <span>BIBLIOTHÈQUE LOCALE</span>
            <h2 id="project-library-title">Mes projets</h2>
          </div>
          <button type="button" className="studio-library-close" onClick={onClose} aria-label="Fermer la bibliothèque">×</button>
        </header>

        <div className="studio-modal-content studio-library-grid">
          {!records.length && <div className="studio-panel-empty studio-library-empty">Aucun projet local pour le moment.</div>}

          {records.map((record) => (
            <article key={record.id} className={record.id === activeProjectId ? "studio-project-card active" : "studio-project-card"}>
              <div className="studio-project-card-copy">
                <div className="studio-project-card-heading">
                  <strong>{record.name}</strong>
                  {record.id === activeProjectId && <span>Ouvert</span>}
                </div>
                <small>{formatDate(record.updatedAt)} · {record.infographic.items.length} blocs</small>
              </div>

              <div className="studio-project-card-actions">
                <button type="button" className="studio-project-open" onClick={() => onOpen(record)}>Ouvrir</button>
                <button type="button" className="studio-project-quiet" onClick={() => duplicate(record)}>Dupliquer</button>
                <button type="button" className="studio-project-quiet" onClick={(event) => startRename(record, event.currentTarget)}>Renommer</button>
                <button type="button" className="studio-project-danger" onClick={(event) => startDelete(record, event.currentTarget)}>Supprimer</button>
              </div>

              {record.snapshots.length > 0 && (
                <details className="studio-project-versions">
                  <summary>{record.snapshots.length} version(s) enregistrée(s)</summary>
                  <div className="studio-version-list">
                    {record.snapshots.map((snapshot, index) => (
                      <button key={snapshot.id} type="button" onClick={() => onRestore(record, index)}>
                        <span>{formatDate(snapshot.savedAt)}</span>
                        <strong>Restaurer</strong>
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </article>
          ))}
        </div>
      </section>

      {renameTarget && (
        <div className="studio-library-action-layer" role="presentation" onMouseDown={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) closeRename(); }}>
          <form ref={renameDialogRef} className="studio-library-action-dialog" onSubmit={submitRename} role="dialog" aria-modal="true" aria-labelledby="rename-project-title" tabIndex={-1}>
            <div className="studio-library-action-copy">
              <span>RENOMMER</span>
              <h3 id="rename-project-title">Nom du projet</h3>
              <p>Choisissez un nom court et facile à retrouver dans votre bibliothèque.</p>
            </div>
            <label>
              <span>Nouveau nom</span>
              <input value={renameValue} maxLength={120} onChange={(event) => setRenameValue(event.target.value)} />
            </label>
            <div className="studio-library-action-buttons">
              <button type="button" className="studio-dialog-secondary" onClick={closeRename}>Annuler</button>
              <button type="submit" className="studio-dialog-primary" disabled={!renameValue.trim()}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="studio-library-action-layer" role="presentation" onMouseDown={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) closeDelete(); }}>
          <section ref={deleteDialogRef} className="studio-library-action-dialog studio-library-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-project-title" tabIndex={-1}>
            <div className="studio-library-danger-mark" aria-hidden="true">!</div>
            <div className="studio-library-action-copy">
              <span>SUPPRESSION</span>
              <h3 id="delete-project-title">Supprimer « {deleteTarget.name} » ?</h3>
              <p>Le projet sera retiré de la bibliothèque locale. Cette action ne touche pas aux fichiers déjà exportés.</p>
            </div>
            <div className="studio-library-action-buttons">
              <button type="button" className="studio-dialog-secondary" onClick={closeDelete}>Annuler</button>
              <button type="button" className="studio-dialog-danger" onClick={removeProject}>Supprimer</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
