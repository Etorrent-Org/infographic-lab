/* #37 — expose semantiquement les etats actifs des navigations sans modifier leur rendu. */

type NavigationGroup = {
  selector: string;
  label: string;
  role?: "group";
};

const navigationGroups: NavigationGroup[] = [
  { selector: ".studio-inspector-tabs", label: "Navigation du studio Structure" },
  { selector: ".marketing-panel-tabs", label: "Navigation du studio Visuels" },
  { selector: ".studio-view-tabs", label: "Representation du canvas", role: "group" },
  { selector: ".marketing-toolbar-actions", label: "Mode d apercu des visuels", role: "group" },
];

function syncNavigationAccessibility() {
  navigationGroups.forEach(({ selector, label, role }) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((group) => {
      group.setAttribute("aria-label", label);
      if (role) group.setAttribute("role", role);

      group.querySelectorAll<HTMLButtonElement>(":scope > button").forEach((button) => {
        button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
      });
    });
  });
}

let scheduled = false;

function scheduleNavigationAccessibilitySync() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    syncNavigationAccessibility();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scheduleNavigationAccessibilitySync, { once: true });
} else {
  scheduleNavigationAccessibilitySync();
}

const navigationObserver = new MutationObserver(scheduleNavigationAccessibilitySync);
navigationObserver.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ["class"],
});

export {};
