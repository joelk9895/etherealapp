import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    // Verify user is a producer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true },
    });

    if (!user || user.userType !== "producer") {
      return NextResponse.json(
        {
          error: "Only producers can access this endpoint",
        },
        { status: 403 }
      );
    }

    // Get producer's samples
    const samples = await prisma.sample.findMany({
      where: { producerId: userId },
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        plays: true,
        sales: true,
        createdAt: true,
        previewUrl: true,
        artworkUrl: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      samples,
    });
  } catch (error) {
    console.error("Error fetching producer samples:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch samples",
      },
      { status: 500 }
    );
  }
}
