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

    // Get producer's sample statistics
    const samples = await prisma.sample.findMany({
      where: { producerId: userId },
      select: {
        price: true,
        plays: true,
        sales: true,
      },
    });

    // Get follower count
    const followerCount = await prisma.follow.count({
      where: { followingId: userId },
    });

    // Calculate stats
    const totalSamples = samples.length;
    const totalSales = samples.reduce((sum, sample) => sum + sample.sales, 0);
    const totalEarnings = samples.reduce(
      (sum, sample) => sum + sample.price * sample.sales,
      0
    );
    const totalPlays = samples.reduce((sum, sample) => sum + sample.plays, 0);

    const stats = {
      totalSamples,
      totalSales,
      totalEarnings,
      totalPlays,
      followers: followerCount,
    };

    return NextResponse.json({
      stats,
    });
  } catch (error) {
    console.error("Error fetching producer stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
      },
      { status: 500 }
    );
  }
}
