import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const genre = searchParams.get("genre");

    // Build filter conditions
    const where: any = {
      userType: "producer", // Only get users who are producers
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    // For genre filtering, we need to check if producer has samples in that genre
    let genreFilter = {};
    if (genre) {
      genreFilter = {
        samples: {
          some: {
            category: genre,
          },
        },
      };
    }

    const producers = await prisma.user.findMany({
      where: {
        ...where,
        ...genreFilter,
      },
      include: {
        samples: {
          select: {
            category: true,
          },
        },
        _count: {
          select: {
            samples: true,
            followers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to match frontend expectations
    const transformedProducers = producers.map((producer) => {
      // Extract unique genres from producer's samples
      const genres = Array.from(
        new Set(producer.samples.map((sample) => sample.category))
      );

      return {
        id: producer.id,
        name: producer.name,
        bio: producer.bio || "No bio provided",
        avatar: producer.avatar || "",
        genres: genres,
        samplesCount: producer._count.samples,
        totalSales: Math.floor(Math.random() * 1000) + 50, // Mock data for now
        rating: 4.0 + Math.random() * 1, // Mock rating
        location: producer.location || "Unknown",
        joinedDate: producer.createdAt.toISOString(),
        verified: producer.verified,
        socialLinks: {}, // Would be stored in a separate table or JSON field
      };
    });

    return NextResponse.json({
      producers: transformedProducers,
      total: transformedProducers.length,
    });
  } catch (error) {
    console.error("Error fetching producers:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch producers",
      },
      { status: 500 }
    );
  }
}
