const tabRailSelector = ".studio-inspector-tabs, .marketing-panel-tabs";
const mobileQuery = window.matchMedia("(max-width: 760px)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function keepActiveTabVisible(nav: HTMLElement) {
  if (!mobileQuery.matches) return;
  const active = nav.querySelector<HTMLElement>("button.active");
  if (!active) return;

  const navRect = nav.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const edgePadding = 8;

  let delta = 0;
  if (activeRect.left < navRect.left + edgePadding) {
    delta = activeRect.left - navRect.left - edgePadding;
  } else if (activeRect.right > navRect.right - edgePadding) {
    delta = activeRect.right - navRect.right + edgePadding;
  }

  if (Math.abs(delta) < 1) return;

  nav.scrollTo({
    left: nav.scrollLeft + delta,
    behavior: reducedMotionQuery.matches ? "auto" : "smooth",
  });
}

let scheduled = false;

function refreshVisibleTabs() {
  scheduled = false;
  document.querySelectorAll<HTMLElement>(tabRailSelector).forEach(keepActiveTabVisible);
}

function scheduleRefresh() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(refreshVisibleTabs);
}

const observer = new MutationObserver((mutations) => {
  if (!mobileQuery.matches) return;

  const relevant = mutations.some((mutation) => {
    if (mutation.type === "attributes") {
      return mutation.target instanceof HTMLElement
        && Boolean(mutation.target.closest(tabRailSelector));
    }

    return Array.from(mutation.addedNodes).some((node) => (
      node instanceof HTMLElement
      && (node.matches(tabRailSelector) || Boolean(node.querySelector(tabRailSelector)))
    ));
  });

  if (relevant) scheduleRefresh();
});

observer.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ["class"],
});

mobileQuery.addEventListener("change", scheduleRefresh);
window.addEventListener("resize", scheduleRefresh, { passive: true });
scheduleRefresh();
