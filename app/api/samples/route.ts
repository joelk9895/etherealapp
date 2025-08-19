import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const minBpm = searchParams.get("minBpm");
    const maxBpm = searchParams.get("maxBpm");
    const key = searchParams.get("key");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    // Build filter conditions
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (minBpm || maxBpm) {
      where.bpm = {};
      if (minBpm) where.bpm.gte = parseInt(minBpm);
      if (maxBpm) where.bpm.lte = parseInt(maxBpm);
    }

    if (key) {
      where.key = key;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
        { producer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const samples = await prisma.sample.findMany({
      where,
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            verified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to match frontend expectations
    const transformedSamples = samples.map((sample) => ({
      id: sample.id,
      title: sample.title,
      producer: sample.producer.name,
      category: sample.category,
      bpm: sample.bpm,
      key: sample.key || "N/A",
      price: sample.price,
      duration: sample.duration,
      preview_url: `/api/samples/preview-proxy/${sample.id}`,
      waveform: sample.waveformUrl || "/waveforms/default.png",
      tags: sample.tags,
    }));

    return NextResponse.json({
      samples: transformedSamples,
      total: transformedSamples.length,
    });
  } catch (error) {
    console.error("Error fetching samples:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch samples",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication middleware to verify user is logged in
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, category, bpm, key, price, description, tags, producerId } =
      body;

    // Validate required fields
    if (!title || !category || !bpm || !price || !producerId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // In a real app, you would:
    // 1. Upload audio file to cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Generate waveform data
    // 3. Process audio metadata (duration, etc.)

    const newSample = await prisma.sample.create({
      data: {
        title,
        description: description || "",
        category,
        bpm: parseInt(bpm),
        key: key || null,
        price: parseFloat(price),
        duration: 30, // Would be extracted from audio file
        previewUrl: "/samples/preview-new.mp3", // Would be actual uploaded file URL
        downloadUrl: "/samples/download-new.zip", // Would be actual file URL
        waveformUrl: "/waveforms/new.png", // Would be generated
        tags: Array.isArray(tags) ? tags : [],
        producerId,
      },
      include: {
        producer: {
          select: {
            id: true,
            name: true,
            verified: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Sample uploaded successfully",
        sample: {
          id: newSample.id,
          title: newSample.title,
          producer: newSample.producer.name,
          category: newSample.category,
          bpm: newSample.bpm,
          key: newSample.key,
          price: newSample.price,
          duration: newSample.duration,
          preview_url: newSample.previewUrl,
          tags: newSample.tags,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading sample:", error);
    return NextResponse.json(
      {
        error: "Failed to upload sample",
      },
      { status: 500 }
    );
  }
}
