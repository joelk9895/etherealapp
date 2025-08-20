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

interface Props {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const packId = params.id;
    
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
        { error: "Only producers can edit packs" },
        { status: 403 }
      );
    }

    // Check if pack exists and belongs to this user
    const existingPack = await prisma.pack.findUnique({
      where: { id: packId },
      select: { producerId: true, previewKey: true, artworkKey: true }
    });

    if (!existingPack) {
      return NextResponse.json(
        { error: "Pack not found" },
        { status: 404 }
      );
    }

    if (existingPack.producerId !== userId) {
      return NextResponse.json(
        { error: "You can only edit your own packs" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    
    // Extract pack data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priceRaw = formData.get("price") as string;
    console.log("Raw price value:", priceRaw);
    const price = priceRaw ? parseFloat(priceRaw) : NaN;
    const category = formData.get("category") as string;
    const bpmRaw = formData.get("bpm") as string;
    const bpm = bpmRaw ? parseInt(bpmRaw) : null;
    const key = formData.get("key") as string || null;
    
    // Extract tags
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
    
    // Extract selected samples
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

    // Validate required fields
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
    
    console.log("Form data validation passed", { 
      title, 
      price, 
      category, 
      selectedSamplesCount: selectedSamples?.length
    });

    // Verify selected samples belong to the user
    const samplesCheck = await prisma.sample.findMany({
      where: {
        id: { in: selectedSamples },
        producerId: userId
      },
      select: { id: true, packId: true }
    });

    // Check if all samples exist and belong to this user
    if (samplesCheck.length !== selectedSamples.length) {
      const foundIds = samplesCheck.map((s) => s.id);
      const missingIds = selectedSamples.filter((id: string) => !foundIds.includes(id));
      
      return NextResponse.json(
        { 
          error: "Some sample IDs do not exist or don't belong to you", 
          details: {
            missingIds,
            selectedCount: selectedSamples.length,
            foundCount: samplesCheck.length
          }
        },
        { status: 400 }
      );
    }

    // Make sure samples are either already in this pack or not in any pack
    const invalidSamples = samplesCheck.filter(s => s.packId !== null && s.packId !== packId);
    if (invalidSamples.length > 0) {
      return NextResponse.json(
        { 
          error: "Some samples are already in another pack", 
          details: {
            invalidSampleIds: invalidSamples.map(s => s.id)
          }
        },
        { status: 400 }
      );
    }

    // Extract files
    const previewFile = formData.get("previewFile") as File | null;
    const artworkFile = formData.get("artworkFile") as File | null;

    // Upload new preview file to S3 if provided
    let previewUrl = undefined;
    let previewKey = undefined;
    if (previewFile) {
      previewKey = `packs/${userId}/${uuidv4()}-preview.${previewFile.name.split('.').pop()}`;
      const previewBuffer = Buffer.from(await previewFile.arrayBuffer());
      
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: previewKey,
        Body: previewBuffer,
        ContentType: previewFile.type,
      }));

      previewUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${previewKey}`;
    }

    // Upload new artwork if provided
    let artworkUrl = undefined;
    let artworkKey = undefined;
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

    // First, update the pack with the new data
    const updatedPack = await prisma.pack.update({
      where: { id: packId },
      data: {
        title,
        description,
        category,
        price,
        bpm,
        key,
        ...(previewUrl && { previewUrl }),
        ...(previewKey && { previewKey }),
        ...(artworkUrl && { artworkUrl }),
        ...(artworkKey && { artworkKey }),
        styleTags,
        moodTags,
        processingTags,
        soundDesignTags
      },
      include: {
        producer: {
          select: { name: true }
        }
      }
    });

    // Get current samples in the pack
    const currentPackSamples = await prisma.sample.findMany({
      where: { packId },
      select: { id: true }
    });
    const currentPackSampleIds = currentPackSamples.map(s => s.id);

    // Find samples to add and remove
    const samplesToAdd = selectedSamples.filter(id => !currentPackSampleIds.includes(id));
    const samplesToRemove = currentPackSampleIds.filter(id => !selectedSamples.includes(id));

    // Remove samples that are no longer in the pack
    if (samplesToRemove.length > 0) {
      await prisma.sample.updateMany({
        where: {
          id: { in: samplesToRemove }
        },
        data: {
          packId: null
        }
      });
    }

    // Add new samples to the pack
    if (samplesToAdd.length > 0) {
      await prisma.sample.updateMany({
        where: {
          id: { in: samplesToAdd }
        },
        data: {
          packId
        }
      });
    }

    // Calculate updated pack metadata
    const samples = await prisma.sample.findMany({
      where: {
        packId
      },
      select: { duration: true }
    });
    
    const totalDuration = samples.reduce((sum, sample) => sum + sample.duration, 0);
    const totalSamples = samples.length;

    // Update the pack with the new metadata
    const finalPack = await prisma.pack.update({
      where: { id: packId },
      data: {
        totalSamples,
        totalDuration
      },
      include: {
        producer: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({
      message: "Pack updated successfully",
      pack: {
        ...finalPack,
        producer: finalPack.producer.name
      }
    });

  } catch (error) {
    console.error("Error updating pack:", error);
    
    // More detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack
    });
    
    return NextResponse.json(
      { 
        error: "Failed to update pack", 
        details: errorMessage,
        // Don't include stack trace in production, but useful for debugging
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined 
      },
      { status: 500 }
    );
  }
}
