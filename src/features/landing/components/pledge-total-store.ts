/**
 * The live pledge total, shared by every display on the page (hero card,
 * poster counter). Polls the CDN-cached /api/pledges/total every 30 s while
 * at least one display is mounted and the tab is visible.
 */

export const POLL_INTERVAL_MS = 30_000;
const ENDPOINT = "/api/pledges/total";

let latest: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function readTotal(data: unknown): number | null {
  return typeof data === "object" && data !== null && "total" in data && typeof data.total === "number"
    ? data.total
    : null;
}

async function refresh() {
  if (document.visibilityState !== "visible") return;
  try {
    const response = await fetch(ENDPOINT, { cache: "no-store" });
    if (!response.ok) return;
    const next = readTotal(await response.json());
    if (next === null || next === latest) return;
    latest = next;
    listeners.forEach((listener) => listener());
  } catch {
    // Keep showing the last known total.
  }
}

function start() {
  timer = setInterval(refresh, POLL_INTERVAL_MS);
  document.addEventListener("visibilitychange", refresh);
}

function stop() {
  clearInterval(timer);
  timer = undefined;
  document.removeEventListener("visibilitychange", refresh);
}

export function subscribePledgeTotal(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

/** The newest polled total, or null before the first successful poll. */
export function getLatestPledgeTotal(): number | null {
  return latest;
}

/** Test hook: forget the polled total and stop polling. */
export function resetPledgeTotalStore() {
  latest = null;
  listeners.clear();
  stop();
}
