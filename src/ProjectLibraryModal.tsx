import { useEffect, useState } from "react";
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

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (renameTarget) {
        setRenameTarget(null);
        return;
      }
      if (deleteTarget) {
        setDeleteTarget(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteTarget, onClose, renameTarget]);

  function startRename(record: LocalProjectRecord) {
    setDeleteTarget(null);
    setRenameTarget(record);
    setRenameValue(record.name);
  }

  function submitRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!renameTarget) return;
    const nextName = renameValue.trim();
    if (!nextName) return;
    renameLocalProject(renameTarget.id, nextName);
    onChanged();
    setRenameTarget(null);
  }

  function duplicate(record: LocalProjectRecord) {
    duplicateLocalProject(record.id);
    onChanged();
  }

  function removeProject() {
    if (!deleteTarget) return;
    deleteLocalProject(deleteTarget.id);
    onChanged();
    setDeleteTarget(null);
  }

  return (
    <div
      className="studio-modal-backdrop studio-library-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="studio-modal studio-library-modal" role="dialog" aria-modal="true" aria-labelledby="project-library-title">
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
                <button type="button" className="studio-project-quiet" onClick={() => startRename(record)}>Renommer</button>
                <button type="button" className="studio-project-danger" onClick={() => { setRenameTarget(null); setDeleteTarget(record); }}>Supprimer</button>
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
        <div className="studio-library-action-layer" role="presentation" onMouseDown={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) setRenameTarget(null); }}>
          <form className="studio-library-action-dialog" onSubmit={submitRename} role="dialog" aria-modal="true" aria-labelledby="rename-project-title">
            <div className="studio-library-action-copy">
              <span>RENOMMER</span>
              <h3 id="rename-project-title">Nom du projet</h3>
              <p>Choisissez un nom court et facile à retrouver dans votre bibliothèque.</p>
            </div>
            <label>
              <span>Nouveau nom</span>
              <input autoFocus value={renameValue} maxLength={120} onChange={(event) => setRenameValue(event.target.value)} />
            </label>
            <div className="studio-library-action-buttons">
              <button type="button" className="studio-dialog-secondary" onClick={() => setRenameTarget(null)}>Annuler</button>
              <button type="submit" className="studio-dialog-primary" disabled={!renameValue.trim()}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="studio-library-action-layer" role="presentation" onMouseDown={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) setDeleteTarget(null); }}>
          <section className="studio-library-action-dialog studio-library-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-project-title">
            <div className="studio-library-danger-mark" aria-hidden="true">!</div>
            <div className="studio-library-action-copy">
              <span>SUPPRESSION</span>
              <h3 id="delete-project-title">Supprimer « {deleteTarget.name} » ?</h3>
              <p>Le projet sera retiré de la bibliothèque locale. Cette action ne touche pas aux fichiers déjà exportés.</p>
            </div>
            <div className="studio-library-action-buttons">
              <button type="button" className="studio-dialog-secondary" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button type="button" className="studio-dialog-danger" onClick={removeProject}>Supprimer</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
