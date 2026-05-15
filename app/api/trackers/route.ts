import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { TrackerCreateSchema } from "../../../lib/validators";
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
} from "../../../lib/api-response";
import { rateLimiters } from "../../../lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const trackerId = url.searchParams.get("trackerId");

    if (trackerId) {
      // Permission check: ensure tracker belongs to user
      const tracker = await prisma.tracker.findFirst({
        where: { id: trackerId, userId: user.userId },
        include: { fields: true, snapshots: { orderBy: { capturedAt: "desc" }, take: 10 } },
      });
      if (!tracker) {
        return notFoundResponse();
      }
      return successResponse(tracker);
    }

    const trackers = await prisma.tracker.findMany({
      where: { userId: user.userId },
      include: { fields: true },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(trackers);
  } catch (error) {
    console.error("GET trackers error:", error);
    return errorResponse("Failed to fetch trackers", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitCheck = rateLimiters.api.check(request);
    if (!rateLimitCheck.allowed) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate input
    const validation = TrackerCreateSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { url, name, fields } = validation.data;

    const tracker = await prisma.tracker.create({
      data: {
        userId: user.userId,
        url,
        name: name || url,
        fields: {
          create: (fields || []).map((field) => ({
            name: field.name,
            selector: field.selector,
            type: field.type || "text",
            isDefault: true,
          })),
        },
      },
      include: { fields: true },
    });

    return successResponse(tracker, 201);
  } catch (error) {
    console.error("POST trackers error:", error);
    return errorResponse("Failed to create tracker", 500);
  }
}
