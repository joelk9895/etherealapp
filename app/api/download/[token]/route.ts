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
    });
    
    if (!purchasedSample) {
      return NextResponse.json(
        {
          error: "Invalid download token",
        },
        { status: 404 }
      );
    }
    
    // Get pack and sample data
    const pack = await prisma.pack.findUnique({
      where: { id: purchasedSample.packId },
      include: {
        producer: {
          select: { name: true }
        },
        samples: true
      }
    });

    if (!purchasedSample) {
      return NextResponse.json(
        {
          error: "Invalid download token",
        },
        { status: 404 }
      );
    }
    
    // Get pack and sample data
    const pack = await prisma.pack.findUnique({
      where: { id: purchasedSample.packId },
      include: {
        producer: {
          select: { name: true }
        },
        samples: true
      }
    });
    
    if (!pack || !pack.samples || pack.samples.length === 0) {
      return NextResponse.json(
        {
          error: "Pack or samples not found",
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

    // Use the first sample in the pack for download
    const sample = pack.samples[0];
      
    if (!sample) {
      return NextResponse.json(
        {
          error: "No samples found in pack",
        },
        { status: 404 }
      );
    }

    // Generate presigned URL for the actual audio file download
    try {
      // Use the audioKey from the sample record
      const audioKey = sample.audioKey;
      if (!audioKey) {
        throw new Error("Sample has no audio file");
      }

      const downloadUrl = await generatePresignedDownloadUrl(
        audioKey,
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
          title: sample.title,
          producer: pack.producer.name,
          category: sample.category,
          bpm: sample.bpm,
          key: sample.key,
        },
        downloadInfo: {
          downloadCount: purchasedSample.downloadCount,
          maxDownloads: purchasedSample.maxDownloads,
          remainingDownloads:
            purchasedSample.maxDownloads - purchasedSample.downloadCount,
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
