import axios from "axios";
import cheerio from "cheerio";

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function findPriceCandidates(text: string) {
  const currencyPattern = /\$\s?\d{1,3}(?:[\.,]\d{2})?|\d{1,3}(?:[\.,]\d{2})?\s?(?:USD|GBP|EUR)/gi;
  return Array.from(new Set(text.match(currencyPattern) || []));
}

export async function extractPageFields(url: string) {
  const response = await axios.get(url, { timeout: 10000, headers: { "User-Agent": "SiteTrackerBot/1.0 (+https://example.com)" } });
  const html = response.data as string;
  const $ = cheerio.load(html);

  const title = normalizeText($("title").text() || "");
  const description = normalizeText($("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || "");
  const priceCandidates = findPriceCandidates($("body").text());
  const image = $("meta[property='og:image']").attr("content") || $("img").first().attr("src") || "";

  const fields = [
    { name: "title", value: title, selector: "title" },
    { name: "description", value: description, selector: "meta[name='description']" },
    { name: "image", value: image, selector: "meta[property='og:image']" },
  ];

  if (priceCandidates.length) {
    fields.push({ name: "price", value: priceCandidates[0], selector: "body" });
  }

  const additionalFields = priceCandidates.slice(1, 4).map((price, index) => ({
    name: `price_alternative_${index + 1}`,
    value: price,
    selector: "body",
  }));

  return {
    title,
    description,
    url,
    fields: [...fields, ...additionalFields].filter((field) => field.value),
  };
}
