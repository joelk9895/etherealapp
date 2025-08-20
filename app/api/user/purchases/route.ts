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

    // Get user info to check if email matches any guest orders
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

    // Get user's purchased samples - including both user ID and email matches
    const purchasedSamples = await prisma.purchasedSample.findMany({
      where: {
        OR: [
          // Samples from orders linked to user ID
          {
            order: {
              userId: userId,
            },
          },
          // Samples purchased as guest with matching email
          {
            customerEmail: user.email,
          },
        ],
      },
      include: {
        pack: {
          include: {
            producer: {
              select: {
                name: true,
              },
            },
            samples: true,
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

    // Group purchases by packId to show packs instead of individual samples
    const packMap = new Map();
    
    // Group samples by their pack
    for (const purchase of purchasedSamples) {
      const packId = purchase.packId;
      
      if (!packMap.has(packId)) {
        packMap.set(packId, {
          packId: packId,
          packTitle: purchase.pack.title,
          producer: purchase.pack.producer.name,
          purchaseDate: purchase.order.createdAt,
          downloadTokens: [purchase.downloadToken], // Collect all download tokens for this pack
          downloadCount: purchase.downloadCount,
          maxDownloads: purchase.maxDownloads,
          expiresAt: purchase.expiresAt,
          sampleCount: 1,
        });
      } else {
        const existingPack = packMap.get(packId);
        existingPack.downloadTokens.push(purchase.downloadToken);
        existingPack.sampleCount += 1;
      }
    }
    
    // Convert map to array for the response
    const purchases = Array.from(packMap.values()).map(pack => ({
      sampleId: pack.packId, // Use packId for compatibility
      sampleTitle: pack.packTitle, // Show pack title instead of sample title
      producer: pack.producer,
      purchaseDate: pack.purchaseDate,
      downloadUrl: `/api/download/${pack.downloadTokens[0]}`, // Use first token for download
      downloadCount: pack.downloadCount,
      maxDownloads: pack.maxDownloads,
      expiresAt: pack.expiresAt,
      // Add new field to show it's a pack
      isPack: true,
      sampleCount: pack.sampleCount,
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
