import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { createToken, setAuthCookie } from "../../../../lib/auth";
import { LoginSchema } from "../../../../lib/validators";
import {
  successResponse,
  validationErrorResponse,
  errorResponse,
  unauthorizedResponse,
} from "../../../../lib/api-response";
import { rateLimiters } from "../../../../lib/rate-limit";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitCheck = rateLimiters.auth.check(request);
    if (!rateLimitCheck.allowed) {
      return errorResponse(
        "Too many login attempts. Please try again later.",
        429
      );
    }

    const body = await request.json();

    // Validate input
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return unauthorizedResponse();
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return unauthorizedResponse();
    }

    // Create JWT and set cookie
    const token = await createToken({ userId: user.id, email: user.email });
    await setAuthCookie(token);

    return successResponse({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Login failed", 500);
  }
}
