import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface Props {
  params: {
    orderId: string;
  };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { orderId } = params;
    const sessionId = request.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get order from database
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {
          include: {
            pack: {
              select: {
                title: true,
                producer: {
                  select: {
                    name: true,
                  },
                },
                samples: {
                  select: {
                    id: true,
                    title: true,
                    contentType: true,
                    audioKey: true,
                    producerId: true,
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
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify this session belongs to this order
    if (order.stripeSessionId !== sessionId) {
      return NextResponse.json(
        { error: "Invalid session for this order" },
        { status: 403 }
      );
    }

    // If status is PENDING, check with Stripe
    if (order.status === "PENDING") {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
          // Update order status
          await prisma.order.update({
            where: {
              id: orderId,
            },
            data: {
              status: "COMPLETED",
            },
          });

          // Update order in memory
          order.status = "COMPLETED";
        }
      } catch (error) {
        console.error("Error checking Stripe session:", error);
        // Continue with what we have in the database
      }
    }

    // Generate temporary download URLs for samples
    const purchasedSamples = [];
    
    for (const item of order.orderItems) {
      if (item.pack?.samples) {
        for (const sample of item.pack.samples) {
          try {
            // Generate pre-signed URL valid for 1 hour
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME!,
              Key: sample.audioKey,
            });
            
            const downloadUrl = await getSignedUrl(s3Client, command, {
              expiresIn: 3600, // 1 hour
            });
            
            purchasedSamples.push({
              sampleId: sample.id,
              sampleTitle: sample.title,
              producer: item.pack.producer.name,
              downloadUrl,
            });
          } catch (error) {
            console.error(`Error generating URL for sample ${sample.id}:`, error);
            // Continue with other samples
          }
        }
      }
    }

    // Sanitize the order data for response
    const sanitizedOrder = {
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      items: order.orderItems.map(item => ({
        id: item.id,
        packId: item.packId,
        packTitle: item.pack?.title || "Unknown Pack",
        producerName: item.pack?.producer?.name || "Unknown Producer",
        quantity: item.quantity,
        price: item.price,
        totalSamples: item.pack?.samples?.length || 0
      }))
    };

    return NextResponse.json({
      message: "Order details retrieved",
      order: sanitizedOrder,
      purchasedSamples,
    });

  } catch (error) {
    console.error("Error retrieving order details:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve order details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
