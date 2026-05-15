import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { createToken, setAuthCookie } from "../../../../lib/auth";
import { SignupSchema } from "../../../../lib/validators";
import {
  successResponse,
  validationErrorResponse,
  errorResponse,
} from "../../../../lib/api-response";
import { rateLimiters } from "../../../../lib/rate-limit";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitCheck = rateLimiters.auth.check(request);
    if (!rateLimitCheck.allowed) {
      return errorResponse(
        "Too many signup attempts. Please try again later.",
        429
      );
    }

    const body = await request.json();

    // Validate input
    const validation = SignupSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { email, password } = validation.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("Email already registered", 409);
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
      select: { id: true, email: true, createdAt: true },
    });

    // Create JWT and set cookie
    const token = await createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return successResponse(user, 201);
  } catch (error) {
    console.error("Signup error:", error);
    return errorResponse("Signup failed", 500);
  }
}
