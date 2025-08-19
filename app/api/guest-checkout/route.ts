import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// Helper function to get session ID from cookies
function getSessionId(request: NextRequest): string | null {
  return request.cookies.get("guest-session")?.value || null;
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);

    if (!sessionId) {
      return NextResponse.json(
        {
          error: "No guest session found",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { customerEmail, customerName } = body;

    if (!customerEmail) {
      return NextResponse.json(
        {
          error: "Email is required for guest checkout",
        },
        { status: 400 }
      );
    }

    // Get guest cart items
    const guestCartItems = await prisma.guestCart.findMany({
      where: { sessionId },
      include: {
        sample: {
          include: {
            producer: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (guestCartItems.length === 0) {
      return NextResponse.json(
        {
          error: "Cart is empty",
        },
        { status: 400 }
      );
    }

    // Calculate total
    const total = guestCartItems.reduce(
      (sum, item) => sum + item.sample.price * item.quantity,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        customerEmail,
        subtotal: total,
        tax: total * 0.1, // 10% tax
        total: total * 1.1, // Include tax
        status: "COMPLETED", // For demo purposes, mark as completed
      },
    });

    // Create purchased samples records
    const purchasedSamples = await Promise.all(
      guestCartItems.map(async (item) => {
        return prisma.purchasedSample.create({
          data: {
            orderId: order.id,
            sampleId: item.sampleId,
            customerEmail,
            downloadToken: uuidv4(),
            downloadCount: 0,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });
      })
    );

    // Clear guest cart
    await prisma.guestCart.deleteMany({
      where: { sessionId },
    });

    // Generate download links
    const downloadLinks = purchasedSamples.map((purchase) => ({
      sampleId: purchase.sampleId,
      sampleTitle: guestCartItems.find(
        (item) => item.sampleId === purchase.sampleId
      )?.sample.title,
      downloadUrl: `/api/download/${purchase.downloadToken}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }));

    // In a real app, you would send an email with download links here
    console.log("Order created for guest:", {
      orderId: order.id,
      customerEmail,
      downloadLinks,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order completed successfully",
      downloadLinks,
      // For demo purposes, return success URL
      checkoutUrl: `/checkout/success?orderId=${order.id}&guest=true`,
    });
  } catch (error) {
    console.error("Error processing guest checkout:", error);
    return NextResponse.json(
      {
        error: "Failed to process checkout",
      },
      { status: 500 }
    );
  }
}
