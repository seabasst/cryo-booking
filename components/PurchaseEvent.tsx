"use client";

import { useEffect } from "react";
import { trackPixel } from "@/lib/pixel";

interface PurchaseEventProps {
  eventId: string;
  value: number;
  contentId: string;
  contentName: string;
}

/**
 * Fires the Meta Pixel `Purchase` event once on mount.
 * Deduplicated with the server-side CAPI Purchase event via `eventId`
 * (both use the Stripe session id).
 */
export default function PurchaseEvent({
  eventId,
  value,
  contentId,
  contentName,
}: PurchaseEventProps) {
  useEffect(() => {
    trackPixel(
      "Purchase",
      {
        value,
        currency: "SEK",
        content_ids: [contentId],
        content_name: contentName,
        content_type: "product",
        num_items: 1,
      },
      eventId
    );
  }, [eventId, value, contentId, contentName]);

  return null;
}
