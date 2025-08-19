import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get user's samples
    const samples = await prisma.sample.findMany({
      where: {
        producerId: userId
      },
      select: {
        id: true,
        title: true,
        duration: true,
        contentType: true,
        soundGroup: true,
        soundType: true,
        bpm: true,
        key: true,
        category: true,
        packId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      samples
    });

  } catch (error) {
    console.error("Error fetching samples:", error);
    return NextResponse.json(
      { error: "Failed to fetch samples" },
      { status: 500 }
    );
  }
}
