import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
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

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Find all purchased samples with the same email that don't have a userId
    const guestPurchases = await prisma.purchasedSample.findMany({
      where: {
        customerEmail: user.email,
        order: {
          userId: null, // Only guest orders
        },
      },
      include: {
        order: true,
        sample: {
          include: {
            producer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (guestPurchases.length === 0) {
      return NextResponse.json({
        message: "No guest purchases found for this email",
        claimedCount: 0,
      });
    }

    // Update orders to link them to the user
    const orderIds = [...new Set(guestPurchases.map((p) => p.order.id))];

    await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: {
        userId: userId,
      },
    });

    // Return claimed purchases info
    const claimedSamples = guestPurchases.map((purchase) => ({
      sampleId: purchase.sampleId,
      sampleTitle: purchase.sample.title,
      producer: purchase.sample.producer.name,
      purchaseDate: purchase.createdAt,
      downloadToken: purchase.downloadToken,
      downloadUrl: `/api/download/${purchase.downloadToken}`,
      expiresAt: purchase.expiresAt,
    }));

    return NextResponse.json({
      message: `Successfully claimed ${guestPurchases.length} purchased samples`,
      claimedCount: guestPurchases.length,
      claimedSamples,
    });
  } catch (error) {
    console.error("Error claiming guest purchases:", error);
    return NextResponse.json(
      {
        error: "Failed to claim guest purchases",
      },
      { status: 500 }
    );
  }
}
