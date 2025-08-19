import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { generateETFileName } from "@/app/upload/utils/fileNaming";
import { uploadSampleFiles } from "@/lib/s3";

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

    // Verify user is a producer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true, name: true },
    });

    if (!user || user.userType !== "producer") {
      return NextResponse.json(
        {
          error: "Only producers can upload samples",
        },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();

    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const bpm = formData.get("bpm") as string;
    const key = formData.get("key") as string;
    const price = formData.get("price") as string;
    const tags = formData.get("tags") as string;
    const contentType = formData.get("contentType") as string;
    const soundGroup = formData.get("soundGroup") as string;
    const soundType = formData.get("soundType") as string;
    const audioFile = formData.get("audio") as File;
    const artworkFile = formData.get("artwork") as File;
    const originalFileName = formData.get("originalFileName") as string;

    // Extract tag arrays that were JSON stringified
    const styleTags = formData.get("styleTags")
      ? JSON.parse(formData.get("styleTags") as string)
      : [];
    const moodTags = formData.get("moodTags")
      ? JSON.parse(formData.get("moodTags") as string)
      : [];
    const processingTags = formData.get("processingTags")
      ? JSON.parse(formData.get("processingTags") as string)
      : [];
    const soundDesignTags = formData.get("soundDesignTags")
      ? JSON.parse(formData.get("soundDesignTags") as string)
      : [];

    // Validate required fields - note: title is no longer required as it will be generated
    // Set default category based on content type if not provided
    const sampleCategory = category || "techno"; // Default category

    if (!sampleCategory) {
      return NextResponse.json(
        {
          error: "Category is required",
        },
        { status: 400 }
      );
    }

    // Set default price if not provided
    const samplePrice = price ? parseFloat(price) : 9.99; // Default price
    if (samplePrice <= 0) {
      return NextResponse.json(
        {
          error: "Valid price is required",
        },
        { status: 400 }
      );
    }

    if (!audioFile) {
      return NextResponse.json(
        {
          error: "Audio file is required",
        },
        { status: 400 }
      );
    }

    if (!contentType) {
      return NextResponse.json(
        {
          error: "Content type is required",
        },
        { status: 400 }
      );
    }

    // Validate content type
    const validContentTypes = [
      "sample-one-shot",
      "sample-loop",
      "sample-loop-midi",
      "midi",
      "preset",
      "construction-kit",
    ];

    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        {
          error: "Invalid content type",
        },
        { status: 400 }
      );
    }

    // For sample-one-shot, validate sound group and sound type are provided
    if (contentType === "sample-one-shot" && (!soundGroup || !soundType)) {
      return NextResponse.json(
        {
          error: "Sound group and sound type are required for sample one-shots",
        },
        { status: 400 }
      );
    }

    // For sample loops, validate BPM is provided
    if (
      (contentType === "sample-loop" || contentType === "sample-loop-midi") &&
      (!bpm || parseInt(bpm) <= 0)
    ) {
      return NextResponse.json(
        {
          error: "BPM is required for sample loops",
        },
        { status: 400 }
      );
    }

    // Validate audio file
    const validAudioTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
      "audio/mp3",
      "audio/mpeg3",
      "audio/x-mpeg-3",
    ];

    console.log("Audio file type:", audioFile.type);
    console.log("Audio file name:", audioFile.name);

    if (!validAudioTypes.includes(audioFile.type)) {
      return NextResponse.json(
        {
          error: `Invalid audio file type: ${audioFile.type}. Please use MP3 or WAV.`,
        },
        { status: 400 }
      );
    }

    // In a production app, you would:
    // 1. Upload files to cloud storage (AWS S3, Google Cloud, etc.) ✓ IMPLEMENTED
    // 2. Generate waveform data ✓ IMPLEMENTED
    // 3. Create preview clips ✓ IMPLEMENTED
    // 4. Process audio metadata (duration, etc.) - TODO

    // Process tags
    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    // Combine all tag arrays for the final tags
    const allTags = [
      ...tagsArray,
      ...styleTags,
      ...moodTags,
      ...processingTags,
      ...soundDesignTags,
    ];

    // Create sample record first to get the ID for S3 paths
    const tempSample = await prisma.sample.create({
      data: {
        title: "temp", // Will be updated with ET name
        description: description?.trim() || null,
        category: sampleCategory,
        bpm: bpm ? parseInt(bpm) : null,
        key: key || null,
        price: samplePrice,
        duration: 180, // Will be updated after processing
        previewUrl: "temp", // Will be updated after S3 upload
        downloadUrl: "temp", // Will be updated after S3 upload
        artworkUrl: null, // Will be updated after S3 upload
        waveformUrl: "temp", // Will be updated after S3 upload
        tags: [],
        contentType,
        soundGroup: soundGroup || null,
        soundType: soundType || null,
        producerId: userId,
      },
    });

    try {
      // Upload files to S3
      const s3Upload = await uploadSampleFiles(
        tempSample.id,
        {
          audio: audioFile,
          artwork: artworkFile || undefined,
        },
        originalFileName || audioFile.name
      );

      console.log("S3 Upload results:", {
        audioUrl: s3Upload.audioUrl,
        previewUrl: s3Upload.previewUrl,
        downloadUrl: s3Upload.downloadUrl,
        artworkUrl: s3Upload.artworkUrl,
        waveformUrl: s3Upload.waveformUrl,
      });

      // Generate ET title using the naming system
      const fileExtension =
        originalFileName?.split(".").pop() ||
        audioFile.name.split(".").pop() ||
        "mp3";
      const etFileName = generateETFileName({
        contentType,
        soundType: soundType || "Generic",
        title: `${soundType || "Sample"}_${Date.now()}`, // Fallback title for naming
        bpm: bpm ? parseInt(bpm) : undefined,
        key: key || undefined,
        originalFileName: originalFileName || audioFile.name,
        fileExtension,
      });

      // Use the generated filename as the title (without extension)
      const generatedTitle = etFileName.newFileName.replace(
        `.${fileExtension}`,
        ""
      );

      // Update the sample with real data from S3 upload
      const sample = await prisma.sample.update({
        where: { id: tempSample.id },
        data: {
          title: generatedTitle,
          previewUrl: s3Upload.previewUrl,
          downloadUrl: s3Upload.downloadUrl,
          artworkUrl: s3Upload.artworkUrl || null,
          waveformUrl: s3Upload.waveformUrl,
          tags: allTags,
        },
      });

      return NextResponse.json({
        message: "Sample uploaded successfully",
        sample: {
          id: sample.id,
          title: sample.title,
          category: sample.category,
          contentType: sample.contentType,
          soundGroup: sample.soundGroup,
          soundType: sample.soundType,
          price: sample.price,
        },
      });
    } catch (uploadError) {
      // If S3 upload fails, clean up the database record
      await prisma.sample.delete({
        where: { id: tempSample.id },
      });

      console.error("S3 upload error:", uploadError);
      throw new Error("Failed to upload files to storage");
    }
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
