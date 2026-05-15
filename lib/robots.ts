import axios from "axios";

interface RobotsRules {
  userAgent: string;
  disallow: string[];
}

function parseRobots(content: string): RobotsRules {
  const lines = content.split(/\r?\n/).map((line) => line.trim());
  const rules: RobotsRules = { userAgent: "*", disallow: [] };
  let currentAgent = "";

  for (const rawLine of lines) {
    if (!rawLine || rawLine.startsWith("#")) continue;
    const [key, value] = rawLine.split(":", 2).map((part) => part.trim());
    if (!key || value === undefined) continue;

    if (/^user-agent$/i.test(key)) {
      currentAgent = value.toLowerCase();
      rules.userAgent = value;
    }

    if (/^disallow$/i.test(key) && currentAgent === "*") {
      rules.disallow.push(value);
    }
  }

  return rules;
}

function isAllowedByRules(path: string, rules: RobotsRules) {
  if (!rules.disallow.length) return true;
  return !rules.disallow.some((disallowPath) => disallowPath && path.startsWith(disallowPath));
}

export async function isCrawlerAllowed(targetUrl: string) {
  try {
    const { origin, pathname } = new URL(targetUrl);
    const robotsUrl = `${origin}/robots.txt`;
    const response = await axios.get(robotsUrl, { timeout: 8000 });

    if (response.status !== 200) {
      return true;
    }

    const rules = parseRobots(response.data as string);
    return isAllowedByRules(pathname, rules);
  } catch (error) {
    return true;
  }
}
