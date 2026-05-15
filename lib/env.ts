// Validate required environment variables at startup
function validateEnv() {
  const required = ["DATABASE_URL"];
  const shouldValidateStrict = process.env.NODE_ENV === "production";

  if (shouldValidateStrict) {
    required.push("JWT_SECRET");
  }

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  // Warn if JWT_SECRET not set in any environment
  if (!process.env.JWT_SECRET) {
    console.warn(
      "⚠️  WARNING: JWT_SECRET not set. Using default dev key. This is insecure in production!"
    );
  }
}

// Run validation on module load (only once)
validateEnv();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-key-change-in-prod",
  NODE_ENV: (process.env.NODE_ENV || "development") as "development" | "production",
  API_URL: process.env.API_URL || "http://localhost:3000",
};

// Type-safe env access
export type Env = typeof env;
