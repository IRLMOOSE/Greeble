import { NextRequest, NextResponse } from "next/server";
import { extractPageFields } from "../../../lib/extractor";
import { isCrawlerAllowed } from "../../../lib/robots";

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const allowed = await isCrawlerAllowed(url);
  if (!allowed) {
    return NextResponse.json({ error: "Scraping is disallowed by robots.txt" }, { status: 403 });
  }

  const fields = await extractPageFields(url);
  return NextResponse.json(fields);
}
