import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const packId = params.id;

    const pack = await prisma.pack.findUnique({
      where: { id: packId },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatar: true
          }
        },
        samples: {
          select: {
            id: true,
            title: true,
            duration: true,
            contentType: true,
            soundGroup: true,
            soundType: true,
            bpm: true,
            key: true,
            styleTags: true,
            moodTags: true,
            processingTags: true,
            soundDesignTags: true
          },
          orderBy: {
            title: 'asc'
          }
        }
      }
    });

    if (!pack) {
      return NextResponse.json(
        { error: "Pack not found" },
        { status: 404 }
      );
    }

    // Increment play count
    await prisma.pack.update({
      where: { id: packId },
      data: { plays: { increment: 1 } }
    });

    // Ensure samples is always defined
    const samplesArray = pack.samples || [];
    
    return NextResponse.json({
      pack: {
        ...pack,
        samples: samplesArray,
        sampleCount: samplesArray.length
      }
    });

  } catch (error) {
    console.error("Error fetching pack:", error);
    return NextResponse.json(
      { error: "Failed to fetch pack" },
      { status: 500 }
    );
  }
}
