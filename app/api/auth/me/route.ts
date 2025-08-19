import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          message: "No token provided",
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);

      if (!decoded || !decoded.userId) {
        return NextResponse.json(
          {
            message: "Invalid token",
          },
          { status: 401 }
        );
      }

      // Get fresh user data from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          userType: true,
          verified: true,
          avatar: true,
          bio: true,
          location: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          {
            message: "User not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user,
      });
    } catch (tokenError) {
      return NextResponse.json(
        {
          message: `Invalid token${
            tokenError && typeof tokenError === "object" && "message" in tokenError
              ? `: ${(tokenError as { message?: string }).message}`
              : ""
          }`,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
