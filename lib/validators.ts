import { z } from "zod";

// Auth schemas
export const SignupSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// Tracker schemas
export const TrackerCreateSchema = z.object({
  url: z.string().url("Invalid URL").refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    "Only HTTP/HTTPS URLs are allowed"
  ),
  name: z.string().min(1, "Tracker name is required").max(255),
  fields: z
    .array(
      z.object({
        name: z.string(),
        selector: z.string(),
        type: z.enum(["text", "number", "date"]).default("text"),
      })
    )
    .optional(),
});

export const TrackerUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  active: z.boolean().optional(),
});

export const TrackerFieldCreateSchema = z.object({
  trackerId: z.string().cuid("Invalid tracker ID"),
  name: z.string().min(1).max(100),
  selector: z.string().min(1, "CSS selector is required"),
  type: z.enum(["text", "number", "date"]).default("text"),
});

export const SnapshotCreateSchema = z.object({
  trackerId: z.string().cuid("Invalid tracker ID"),
  data: z.record(z.any()),
});

// Type exports
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type TrackerCreateInput = z.infer<typeof TrackerCreateSchema>;
export type TrackerUpdateInput = z.infer<typeof TrackerUpdateSchema>;
export type TrackerFieldCreateInput = z.infer<typeof TrackerFieldCreateSchema>;
export type SnapshotCreateInput = z.infer<typeof SnapshotCreateSchema>;
