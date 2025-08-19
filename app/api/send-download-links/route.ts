import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, orderId } = await request.json();

    if (!email || !orderId) {
      return NextResponse.json(
        { error: "Email and order ID are required" },
        { status: 400 }
      );
    }

    // Verify order exists and get purchased samples
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        purchasedSamples: {
          include: {
            sample: {
              include: {
                producer: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order with provided email if different
    if (order.customerEmail !== email) {
      await prisma.order.update({
        where: { id: orderId },
        data: { customerEmail: email },
      });

      // Also update purchased samples records
      await prisma.purchasedSample.updateMany({
        where: { orderId },
        data: { customerEmail: email },
      });
    }

    // Format download links
    const downloadLinks = order.purchasedSamples.map((purchase) => ({
      sampleTitle: purchase.sample.title,
      producer: purchase.sample.producer.name,
      downloadUrl: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
      }/api/download/${purchase.downloadToken}`,
      expiresAt: purchase.expiresAt,
      remainingDownloads: purchase.maxDownloads - purchase.downloadCount,
    }));

    // In a production app, you would send an email here with the download links
    // await sendDownloadLinksEmail(email, downloadLinks, order);

    console.log(`Download links prepared for email: ${email}`, downloadLinks);

    return NextResponse.json({
      message: "Download links prepared successfully",
      email: email,
      orderTotal: order.total,
      downloadLinks: downloadLinks,
      // In production, set this to true after email is sent
      emailSent: false,
      note: "Email sending not implemented in demo",
    });
  } catch (error) {
    console.error("Error preparing download links:", error);
    return NextResponse.json(
      { error: "Failed to prepare download links" },
      { status: 500 }
    );
  }
}
