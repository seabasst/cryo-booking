// Client-side Meta Pixel helpers. All calls are no-ops on the server.

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string }
    ) => void;
  }
}

export function trackPixel(
  event: string,
  params?: Record<string, unknown>,
  eventID?: string
) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventID) {
    window.fbq("track", event, params, { eventID });
  } else {
    window.fbq("track", event, params);
  }
}
