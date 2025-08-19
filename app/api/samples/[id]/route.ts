import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sampleId } = params;

    const sample = await prisma.sample.findUnique({
      where: { id: sampleId },
      include: {
        producer: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!sample) {
      return NextResponse.json(
        {
          error: "Sample not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sample,
    });
  } catch (error) {
    console.error("Error fetching sample:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch sample",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id: sampleId } = params;

    // Parse request body
    const body = await request.json();
    const { title, description, category, bpm, key, price, tags } = body;

    // Verify the sample exists and belongs to the user
    const sample = await prisma.sample.findUnique({
      where: { id: sampleId },
      select: { producerId: true, title: true },
    });

    if (!sample) {
      return NextResponse.json(
        {
          error: "Sample not found",
        },
        { status: 404 }
      );
    }

    if (sample.producerId !== userId) {
      return NextResponse.json(
        {
          error: "You can only edit your own samples",
        },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        {
          error: "Title is required",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          error: "Category is required",
        },
        { status: 400 }
      );
    }

    if (!price || parseFloat(price) <= 0) {
      return NextResponse.json(
        {
          error: "Valid price is required",
        },
        { status: 400 }
      );
    }

    // Update the sample
    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || null,
      category,
      price: parseFloat(price),
      tags: Array.isArray(tags) ? tags : [],
    };

    if (bpm) {
      updateData.bpm = parseInt(bpm);
    }

    if (key) {
      updateData.key = key;
    }

    const updatedSample = await prisma.sample.update({
      where: { id: sampleId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Sample updated successfully",
      sample: {
        id: updatedSample.id,
        title: updatedSample.title,
        category: updatedSample.category,
        price: updatedSample.price,
      },
    });
  } catch (error) {
    console.error("Error updating sample:", error);
    return NextResponse.json(
      {
        error: "Failed to update sample",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id: sampleId } = params;

    // Verify the sample exists and belongs to the user
    const sample = await prisma.sample.findUnique({
      where: { id: sampleId },
      select: { producerId: true, title: true },
    });

    if (!sample) {
      return NextResponse.json(
        {
          error: "Sample not found",
        },
        { status: 404 }
      );
    }

    if (sample.producerId !== userId) {
      return NextResponse.json(
        {
          error: "You can only delete your own samples",
        },
        { status: 403 }
      );
    }

    // Check if sample has been purchased
    const purchaseCount = await prisma.purchasedSample.count({
      where: { sampleId },
    });

    if (purchaseCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete sample that has been purchased by users",
        },
        { status: 400 }
      );
    }

    // Delete related records first
    await prisma.cartItem.deleteMany({
      where: { sampleId },
    });

    await prisma.guestCart.deleteMany({
      where: { sampleId },
    });

    // Delete the sample
    await prisma.sample.delete({
      where: { id: sampleId },
    });

    // In production, you would also delete the files from cloud storage:
    /*
    await deleteFromCloudStorage(sample.previewUrl);
    await deleteFromCloudStorage(sample.downloadUrl);
    if (sample.artworkUrl) {
      await deleteFromCloudStorage(sample.artworkUrl);
    }
    if (sample.waveformUrl) {
      await deleteFromCloudStorage(sample.waveformUrl);
    }
    */

    return NextResponse.json({
      message: "Sample deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sample:", error);
    return NextResponse.json(
      {
        error: "Failed to delete sample",
      },
      { status: 500 }
    );
  }
}
