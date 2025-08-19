import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Verify user is a producer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true, name: true }
    });

    if (!user || user.userType !== "producer") {
      return NextResponse.json(
        { error: "Only producers can create packs" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    
    // Log received form data keys for debugging
    console.log("Received form data keys:", Array.from(formData.keys()));
    
    // Extract pack data with validation
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priceRaw = formData.get("price") as string;
    console.log("Raw price value:", priceRaw);
    const price = priceRaw ? parseFloat(priceRaw) : NaN;
    const category = formData.get("category") as string;
    const bpmRaw = formData.get("bpm") as string;
    const bpm = bpmRaw ? parseInt(bpmRaw) : null;
    const key = formData.get("key") as string || null;
    
    // Extract tags with error handling
    let styleTags: string[], moodTags: string[], processingTags: string[], soundDesignTags: string[];
    try {
      const styleTagsRaw = formData.get("styleTags") as string || "[]";
      console.log("Raw styleTags:", styleTagsRaw);
      styleTags = JSON.parse(styleTagsRaw);
      
      const moodTagsRaw = formData.get("moodTags") as string || "[]";
      console.log("Raw moodTags:", moodTagsRaw);
      moodTags = JSON.parse(moodTagsRaw);
      
      const processingTagsRaw = formData.get("processingTags") as string || "[]";
      console.log("Raw processingTags:", processingTagsRaw);
      processingTags = JSON.parse(processingTagsRaw);
      
      const soundDesignTagsRaw = formData.get("soundDesignTags") as string || "[]";
      console.log("Raw soundDesignTags:", soundDesignTagsRaw);
      soundDesignTags = JSON.parse(soundDesignTagsRaw);
    } catch (e) {
      console.error("Error parsing tags:", e);
      return NextResponse.json(
        { error: "Invalid tag format", details: e instanceof Error ? e.message : "Unknown parsing error" },
        { status: 400 }
      );
    }
    
    // Extract selected samples with error handling
    let selectedSamples: string[];
    try {
      const samplesRaw = formData.get("selectedSamples");
      if (!samplesRaw) {
        console.error("Missing selectedSamples in form data");
        return NextResponse.json(
          { error: "Missing selectedSamples field in request" },
          { status: 400 }
        );
      }
      console.log("Raw selectedSamples:", samplesRaw);
      selectedSamples = JSON.parse(samplesRaw as string);
      
      if (!Array.isArray(selectedSamples)) {
        console.error("selectedSamples is not an array:", selectedSamples);
        return NextResponse.json(
          { error: "selectedSamples must be an array of strings" },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("Error parsing selectedSamples:", e);
      return NextResponse.json(
        { error: "Invalid selectedSamples format", details: e instanceof Error ? e.message : "Unknown parsing error" },
        { status: 400 }
      );
    }
    
    // Extract files
    const previewFile = formData.get("previewFile") as File;
    const artworkFile = formData.get("artworkFile") as File | null;

    // Check individual required fields and provide specific error message
    if (!title) {
      return NextResponse.json(
        { error: "Missing required field: title" },
        { status: 400 }
      );
    }
    if (!price) {
      return NextResponse.json(
        { error: "Missing required field: price" },
        { status: 400 }
      );
    }
    if (!category) {
      return NextResponse.json(
        { error: "Missing required field: category" },
        { status: 400 }
      );
    }
    if (!selectedSamples?.length) {
      return NextResponse.json(
        { error: "Missing required field: No samples selected" },
        { status: 400 }
      );
    }
    if (!previewFile) {
      return NextResponse.json(
        { error: "Missing required field: preview audio file" },
        { status: 400 }
      );
    }
    
    console.log("Form data validation passed", { 
      title, 
      price, 
      category, 
      selectedSamplesCount: selectedSamples?.length,
      previewFileType: previewFile?.type,
      previewFileName: previewFile?.name
    });

    console.log("Attempting to validate samples:", { 
      selectedSampleIds: selectedSamples,
      userId
    });

    // First check if all IDs actually exist
    const allSamples = await prisma.sample.findMany({
      where: {
        id: { in: selectedSamples }
      },
      select: {
        id: true,
        producerId: true,
        packId: true
      }
    });
    
    console.log("Found samples:", allSamples.length);
    
    if (allSamples.length < selectedSamples.length) {
      const foundIds = allSamples.map(s => s.id);
      const missingIds = selectedSamples.filter((id: string) => !foundIds.includes(id));
      
      return NextResponse.json(
        { 
          error: "Some sample IDs do not exist", 
          details: {
            missingIds,
            selectedCount: selectedSamples.length,
            foundCount: allSamples.length
          }
        },
        { status: 400 }
      );
    }
    
    // Check which samples don't belong to this user
    const notOwnedSamples = allSamples.filter(s => s.producerId !== userId);
    if (notOwnedSamples.length > 0) {
      return NextResponse.json(
        { 
          error: "Some samples don't belong to you", 
          details: {
            notOwnedIds: notOwnedSamples.map(s => s.id)
          }
        },
        { status: 400 }
      );
    }
    
    // Check which samples are already in a pack
    const alreadyInPackSamples = allSamples.filter(s => s.packId !== null);
    if (alreadyInPackSamples.length > 0) {
      return NextResponse.json(
        { 
          error: "Some samples are already in another pack", 
          details: {
            alreadyInPackIds: alreadyInPackSamples.map(s => s.id)
          }
        },
        { status: 400 }
      );
    }
    
    // Now get the full sample data for valid samples
    const samples = await prisma.sample.findMany({
      where: {
        id: { in: selectedSamples },
        producerId: userId,
        packId: null // Not already in a pack
      }
    });
    
    console.log("Valid samples found:", samples.length);

    // Upload preview file to S3
    const previewKey = `packs/${userId}/${uuidv4()}-preview.${previewFile.name.split('.').pop()}`;
    const previewBuffer = Buffer.from(await previewFile.arrayBuffer());
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: previewKey,
      Body: previewBuffer,
      ContentType: previewFile.type,
    }));

    const previewUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${previewKey}`;

    // Upload artwork if provided
    let artworkUrl = null;
    let artworkKey = null;
    if (artworkFile) {
      artworkKey = `packs/${userId}/${uuidv4()}-artwork.${artworkFile.name.split('.').pop()}`;
      const artworkBuffer = Buffer.from(await artworkFile.arrayBuffer());
      
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: artworkKey,
        Body: artworkBuffer,
        ContentType: artworkFile.type,
      }));

      artworkUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${artworkKey}`;
    }

    // Calculate pack metadata
    const totalDuration = samples.reduce((sum, sample) => sum + sample.duration, 0);
    const totalSamples = samples.length;

    // Create pack in database
    const pack = await prisma.pack.create({
      data: {
        title,
        description,
        category,
        price,
        bpm,
        key,
        previewUrl,
        previewKey,
        artworkUrl,
        artworkKey,
        totalSamples,
        totalDuration,
        styleTags,
        moodTags,
        processingTags,
        soundDesignTags,
        producerId: userId,
      },
      include: {
        producer: {
          select: { name: true }
        }
      }
    });

    // Update samples to belong to this pack
    await prisma.sample.updateMany({
      where: {
        id: { in: selectedSamples }
      },
      data: {
        packId: pack.id
      }
    });

    return NextResponse.json({
      message: "Pack created successfully",
      pack: {
        ...pack,
        producer: pack.producer.name
      }
    });

  } catch (error) {
    console.error("Error creating pack:", error);
    
    // More detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack
    });
    
    return NextResponse.json(
      { 
        error: "Failed to create pack", 
        details: errorMessage,
        // Don't include stack trace in production, but useful for debugging
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined 
      },
      { status: 500 }
    );
  }
}
