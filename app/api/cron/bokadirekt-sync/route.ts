import { NextRequest, NextResponse } from "next/server";
import { getUpcomingPaidBookings } from "@/lib/stripe";
import {
  getUnsyncedPaidBookings,
  getBokadirektServiceInfo,
} from "@/lib/bokadirekt";
import { sendSyncReminder } from "@/lib/slack";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron (see vercel.json): posts one Slack reminder listing paid online
 * bookings that still have no matching booking in Bokadirekt. Stops by itself
 * once staff enter them.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const paid = await getUpcomingPaidBookings();
  const unsynced = await getUnsyncedPaidBookings(paid);

  if (unsynced.length > 0) {
    await sendSyncReminder(
      unsynced
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
        .map((u) => ({
          bdServiceName:
            getBokadirektServiceInfo(u.serviceId)?.bokadirektServiceName ??
            u.serviceName,
          date: u.date,
          time: u.time,
          customerName: u.customerName,
        }))
    );
  }

  return NextResponse.json({ paid: paid.length, unsynced: unsynced.length });
}
