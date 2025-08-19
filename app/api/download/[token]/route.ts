import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePresignedDownloadUrl } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Find the purchased sample by token
    const purchasedSample = await prisma.purchasedSample.findUnique({
      where: { downloadToken: token },
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
      },
    });

    if (!purchasedSample) {
      return NextResponse.json(
        {
          error: "Invalid download token",
        },
        { status: 404 }
      );
    }

    // Check if download has expired
    if (new Date() > purchasedSample.expiresAt) {
      return NextResponse.json(
        {
          error: "Download link has expired",
        },
        { status: 410 }
      );
    }

    // Check download limit
    if (purchasedSample.downloadCount >= purchasedSample.maxDownloads) {
      return NextResponse.json(
        {
          error: "Download limit exceeded",
        },
        { status: 429 }
      );
    }

    // Increment download count
    await prisma.purchasedSample.update({
      where: { id: purchasedSample.id },
      data: {
        downloadCount: purchasedSample.downloadCount + 1,
      },
    });

    // Generate presigned URL for the actual audio file download
    try {
      const downloadUrl = await generatePresignedDownloadUrl(
        `samples/${purchasedSample.sampleId}/audio.mp3`,
        3600 // 1 hour expiration
      );

      // Redirect to the presigned S3 URL for direct download
      return NextResponse.redirect(downloadUrl);
    } catch (s3Error) {
      console.error("S3 download error:", s3Error);

      // Fallback: return download info if S3 fails
      return NextResponse.json({
        success: true,
        sample: {
          title: purchasedSample.sample.title,
          producer: purchasedSample.sample.producer.name,
          category: purchasedSample.sample.category,
          bpm: purchasedSample.sample.bpm,
          key: purchasedSample.sample.key,
        },
        downloadInfo: {
          downloadCount: purchasedSample.downloadCount + 1,
          maxDownloads: purchasedSample.maxDownloads,
          remainingDownloads:
            purchasedSample.maxDownloads - (purchasedSample.downloadCount + 1),
          expiresAt: purchasedSample.expiresAt,
        },
        error: "File temporarily unavailable. Please contact support.",
      });
    }
  } catch (error) {
    console.error("Error processing download:", error);
    return NextResponse.json(
      {
        error: "Failed to process download",
      },
      { status: 500 }
    );
  }
}
