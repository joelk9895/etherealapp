import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { producer: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    // Get packs with producer info and sample count
    const packs = await prisma.pack.findMany({
      where,
      include: {
        producer: {
          select: {
            id: true,
            name: true
          }
        },
        samples: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder as "asc" | "desc"
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.pack.count({ where });

    return NextResponse.json({
      packs: packs.map(pack => ({
        ...pack,
        producer: pack.producer.name,
        sampleCount: pack.samples.length
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching packs:", error);
    return NextResponse.json(
      { error: "Failed to fetch packs" },
      { status: 500 }
    );
  }
}
