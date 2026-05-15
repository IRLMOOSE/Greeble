import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const trackerId = url.searchParams.get("trackerId");

  if (trackerId) {
    const tracker = await prisma.tracker.findFirst({
      where: { id: trackerId, userId: user.userId },
      include: { fields: true, snapshots: { orderBy: { capturedAt: "desc" }, take: 1 } },
    });
    if (!tracker) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(tracker);
  }

  const trackers = await prisma.tracker.findMany({
    where: { userId: user.userId },
    include: { fields: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(trackers);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url, name, fields } = body;

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  const tracker = await prisma.tracker.create({
    data: {
      userId: user.userId,
      url,
      name: name || url,
      fields: {
        create: (fields || []).map((field: any) => ({
          name: field.name,
          selector: field.selector || field.name,
          type: field.type || "text",
          isDefault: field.isDefault ?? false,
        })),
      },
    },
    include: { fields: true },
  });

  return NextResponse.json(tracker, { status: 201 });
}
