import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        purchasedSamples: {
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
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // Generate download links
    const downloadLinks = order.purchasedSamples.map((purchase) => ({
      sampleId: purchase.sampleId,
      sampleTitle: purchase.sample.title,
      producer: purchase.sample.producer.name,
      downloadUrl: `/api/download/${purchase.downloadToken}`,
      expiresAt: purchase.expiresAt,
      downloadCount: purchase.downloadCount,
      maxDownloads: purchase.maxDownloads,
    }));

    return NextResponse.json({
      order: {
        id: order.id,
        customerEmail: order.customerEmail,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
      downloadLinks,
    });
  } catch (error) {
    console.error("Error fetching guest order:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch order details",
      },
      { status: 500 }
    );
  }
}
