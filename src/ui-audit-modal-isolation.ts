/* #42 — lorsqu'un dialogue d'action est ouvert, la bibliotheque sous-jacente n'est plus interactive. */

function syncProjectLibraryIsolation() {
  const library = document.querySelector<HTMLElement>(".studio-library-modal");
  if (!library) return;

  const nestedDialog = document.querySelector(".studio-library-action-layer [role=\"dialog\"]");
  const isolated = Boolean(nestedDialog);

  if (isolated) {
    library.setAttribute("aria-hidden", "true");
    library.setAttribute("inert", "");
    return;
  }

  library.removeAttribute("aria-hidden");
  library.removeAttribute("inert");
}

let scheduled = false;

function scheduleProjectLibraryIsolationSync() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    syncProjectLibraryIsolation();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scheduleProjectLibraryIsolationSync, { once: true });
} else {
  scheduleProjectLibraryIsolationSync();
}

const modalIsolationObserver = new MutationObserver(scheduleProjectLibraryIsolationSync);
modalIsolationObserver.observe(document.documentElement, {
  subtree: true,
  childList: true,
});

export {};
