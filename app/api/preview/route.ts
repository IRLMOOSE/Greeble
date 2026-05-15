import { NextRequest } from "next/server";
import { extractPageFields } from "../../../lib/extractor";
import { isCrawlerAllowed } from "../../../lib/robots";
import {
  successResponse,
  errorResponse,
} from "../../../lib/api-response";
import { rateLimiters } from "../../../lib/rate-limit";
import { z } from "zod";

const PreviewSchema = z.object({
  url: z.string().url("Invalid URL"),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for scraping
    const rateLimitCheck = rateLimiters.scraping.check(request);
    if (!rateLimitCheck.allowed) {
      return errorResponse(
        "Too many preview requests. Please try again later.",
        429
      );
    }

    const body = await request.json();
    const validation = PreviewSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse("Invalid URL provided", 400);
    }

    const { url } = validation.data;

    // Check robots.txt compliance
    const allowed = await isCrawlerAllowed(url);
    if (!allowed) {
      return errorResponse("Scraping is disallowed by robots.txt", 403);
    }

    // Extract page fields
    const fields = await extractPageFields(url);
    return successResponse(fields);
  } catch (error) {
    console.error("Preview error:", error);
    return errorResponse("Failed to preview page", 500);
  }
}
