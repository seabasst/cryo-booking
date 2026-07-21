import { NextRequest, NextResponse } from "next/server";
import { getOpenDaysForService } from "@/lib/bokadirekt";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const serviceId = params.get("serviceId");
  const from = params.get("from");
  const to = params.get("to");

  if (!serviceId || !from || !to) {
    return NextResponse.json(
      { error: "serviceId, from and to are required" },
      { status: 400 }
    );
  }
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRe.test(from) || !dateRe.test(to)) {
    return NextResponse.json(
      { error: "from/to must be YYYY-MM-DD" },
      { status: 400 }
    );
  }

  try {
    const openByDate = await getOpenDaysForService(serviceId, from, to);
    return NextResponse.json({ openByDate });
  } catch (error) {
    console.error("Error fetching available days:", error);
    return NextResponse.json(
      { error: "Failed to fetch available days" },
      { status: 500 }
    );
  }
}
