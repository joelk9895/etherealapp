import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import jwt from "jsonwebtoken";

// Debug to check if Stripe is properly initialized
console.log("Stripe object initialized:", !!stripe, "Checkout available:", !!stripe?.checkout);

interface CartItem {
  id: string;
  packId: string;
  title: string;
  producer: string;
  price: number;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cartItems,
      customerEmail,
    }: { cartItems: CartItem[]; customerEmail?: string } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Get user from token if authenticated
    let userId: string | null = null;
    let userEmail: string | null = customerEmail || null;

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.userId;

        // Get user email from database
        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
          });
          if (user) {
            userEmail = user.email;
          }
        }
      } catch (error) {
        // Invalid token, continue as guest
        console.log("Invalid token, proceeding as guest");
      }
    }

    // Validate cart items exist and get current prices
    const packIds = cartItems.map((item) => item.packId);
    const packs = await prisma.pack.findMany({
      where: { id: { in: packIds } },
      include: {
        producer: {
          select: { name: true },
        },
      },
    });

    if (packs.length !== cartItems.length) {
      return NextResponse.json(
        { error: "Some packs in cart no longer exist" },
        { status: 400 }
      );
    }

    // Calculate total using current prices from database
    let total = 0;
    const lineItems = cartItems.map((cartItem) => {
      const pack = packs.find((p) => p.id === cartItem.packId);
      if (!pack) {
        throw new Error(`Pack ${cartItem.packId} not found`);
      }

      const itemTotal = pack.price * cartItem.quantity;
      total += itemTotal;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: pack.title,
            description: `By ${pack.producer.name}`,
            metadata: {
              packId: pack.id,
              producerId: pack.producerId,
            },
          },
          unit_amount: Math.round(pack.price * 100), // Convert to cents
        },
        quantity: cartItem.quantity,
      };
    });

    // Create order in database first
    const order = await prisma.order.create({
      data: {
        userId: userId,
        customerEmail: userEmail || "",
        subtotal: 0, // Will calculate below
        tax: 0,
        total: total,
        status: "PENDING",
        stripeSessionId: "", // Will be updated after creating session
      },
    });

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    
    // Verify Stripe is properly initialized
    if (!stripe || !stripe.checkout || !stripe.checkout.sessions) {
      console.error("Stripe not properly initialized:", { 
        stripeExists: !!stripe,
        checkoutExists: !!stripe?.checkout,
        sessionsExists: !!stripe?.checkout?.sessions
      });
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${baseUrl}/cart`,
      customer_email: userEmail || undefined,
      metadata: {
        orderId: order.id,
        userId: userId || "",
      },
      // Enable automatic tax if configured
      ...(process.env.STRIPE_TAX_ENABLED === "true" && {
        automatic_tax: { enabled: true },
      }),
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeSessionId: session.id,
      },
    });

    return NextResponse.json({
      message: "Checkout session created",
      checkoutUrl: session.url,
      orderId: order.id,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle successful payment webhook
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentStatus } = body;

    // In a real app, you would:
    // 1. Verify webhook signature
    // 2. Update order status in database
    // 3. Generate download links
    // 4. Send purchase confirmation email
    // 5. Clear user's cart

    if (paymentStatus === "succeeded") {
      return NextResponse.json({
        message: "Payment successful, order completed",
        downloadLinks: ["/downloads/sample1.zip", "/downloads/sample2.zip"],
      });
    }

    return NextResponse.json(
      {
        message: "Payment failed",
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process payment",
      },
      { status: 500 }
    );
  }
}
