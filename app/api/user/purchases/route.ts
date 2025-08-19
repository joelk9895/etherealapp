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

    // Get user's purchased samples
    const purchasedSamples = await prisma.purchasedSample.findMany({
      where: {
        order: {
          userId: userId,
        },
      },
      include: {
        sample: {
          include: {
            producer: {
              select: {
                name: true,
              },
            },
          },
        },
        order: {
          select: {
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for frontend
    const purchases = purchasedSamples.map((purchase) => ({
      sampleId: purchase.sampleId,
      sampleTitle: purchase.sample.title,
      producer: purchase.sample.producer.name,
      purchaseDate: purchase.order.createdAt,
      downloadUrl: `/api/download/${purchase.downloadToken}`,
      downloadCount: purchase.downloadCount,
      maxDownloads: purchase.maxDownloads,
      expiresAt: purchase.expiresAt,
    }));

    return NextResponse.json({
      purchases,
    });
  } catch (error) {
    console.error("Error fetching user purchases:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch purchases",
      },
      { status: 500 }
    );
  }
}
