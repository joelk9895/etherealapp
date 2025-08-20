import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import crypto from "crypto";
import { sendPurchaseConfirmationEmail } from "@/lib/email";

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }
    
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update the order in the database
        if (session.metadata?.orderId) {
          const orderId = session.metadata.orderId;
          
          // Retrieve any additional data from the session
        const userId = session.metadata?.userId || null;
          
        // Mark order as completed and associate with user if possible
        await prisma.order.update({
          where: {
            id: orderId,
          },
          data: {
            status: "COMPLETED",
            userId: userId || undefined,
          },
        });
          
          // Get order items and create purchased sample records
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              orderItems: {
                include: {
                  pack: {
                    include: {
                      samples: true,
                      producer: true
                    }
                  }
                }
              }
            }
          });
          
          if (order) {
            // Generate unique download tokens and create records for each purchased sample
            const purchasedSamplesData = [];
            const emailItems = [];
            
            for (const item of order.orderItems) {
              if (item.pack?.samples) {
                for (const sample of item.pack.samples) {
                  // Create a unique token for this sample download
                  const downloadToken = crypto.randomUUID();
                  
                  // Create expiry date (7 days from now)
                  const expiryDate = new Date();
                  expiryDate.setDate(expiryDate.getDate() + 7);
                  
                  purchasedSamplesData.push({
                    orderId,
                    packId: item.packId,
                    customerEmail: order.customerEmail,
                    downloadToken,
                    maxDownloads: 3,
                    downloadCount: 0,
                    expiresAt: expiryDate,
                    // Adding this field for compatibility with our dashboard
                    sampleId: sample.id, 
                  });
                  
                  // Prepare data for email
                  emailItems.push({
                    sampleTitle: sample.title,
                    packTitle: item.pack.title, // Add pack title for grouping 
                    packId: item.packId, // Add packId for reference
                    producer: item.pack.producer?.name || "Unknown Producer", 
                    downloadUrl: `${BASE_URL}/api/download/${downloadToken}`,
                    expiresAt: expiryDate,
                    maxDownloads: 3
                  });
                }
              }
            }
            
            if (purchasedSamplesData.length > 0) {
              // Create purchased sample records
              await prisma.purchasedSample.createMany({
                data: purchasedSamplesData
              });
              
              // Group by pack for email
              const packMap = new Map();
              for (const item of emailItems) {
                const packId = item.packId;
                
                if (!packMap.has(packId)) {
                  packMap.set(packId, {
                    sampleTitle: item.packTitle || item.sampleTitle,
                    producer: item.producer,
                    downloadUrl: item.downloadUrl,
                    expiresAt: item.expiresAt,
                    maxDownloads: item.maxDownloads,
                    sampleCount: 1,
                    samples: [item]
                  });
                } else {
                  const pack = packMap.get(packId);
                  pack.sampleCount++;
                  pack.samples.push(item);
                }
              }
              
              // Convert to array for email
              const packsForEmail = Array.from(packMap.values());
              
              // Send email with download links
              try {
                if (order.customerEmail) {
                  await sendPurchaseConfirmationEmail(
                    order.customerEmail,
                    {
                      orderId: order.id,
                      total: order.total
                    },
                    packsForEmail
                  );
                  console.log(`Email with download links sent to ${order.customerEmail}`);
                }
              } catch (emailError) {
                console.error("Failed to send email:", emailError);
              }
              
              console.log(`Order ${orderId} has been marked as completed and ${purchasedSamplesData.length} samples prepared for download`);
            } else {
              console.log(`Order ${orderId} has been marked as completed but no samples were found to process`);
            }
          }
        }
        break;
      }
      
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.metadata?.orderId) {
          await prisma.order.update({
            where: {
              id: session.metadata.orderId,
            },
            data: {
              status: "CANCELLED",
            },
          });
          
          console.log(`Order ${session.metadata.orderId} has been marked as cancelled (expired)`);
        }
        break;
      }
      
      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// To handle Stripe's preflight OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({});
}
