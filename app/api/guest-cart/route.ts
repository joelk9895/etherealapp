import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// Helper function to get or create session ID
function getSessionId(request: NextRequest): string {
  const sessionId = request.cookies.get("guest-session")?.value;
  if (sessionId) {
    return sessionId;
  }
  return uuidv4();
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);

    const guestCartItems = await prisma.guestCart.findMany({
      where: { sessionId },
      include: {
        pack: {
          include: {
            producer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Transform data to match frontend expectations
    const transformedItems = guestCartItems.map((item) => ({
      id: item.id,
      packId: item.packId,
      title: item.pack.title,
      producer: item.pack.producer.name,
      price: item.pack.price,
      quantity: item.quantity,
      preview_url: item.pack.previewUrl,
    }));

    const total = transformedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const response = NextResponse.json({
      items: transformedItems,
      total,
    });

    // Set session cookie if new
    if (!request.cookies.get("guest-session")?.value) {
      response.cookies.set("guest-session", sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("Error fetching guest cart:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch cart",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    const body = await request.json();
    const { packId, quantity = 1 } = body;

    // Verify pack exists
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
    });

    if (!pack) {
      return NextResponse.json(
        {
          error: "Pack not found",
        },
        { status: 404 }
      );
    }

    // Check if item already exists in guest cart
    const existingCartItem = await prisma.guestCart.findFirst({
      where: {
        sessionId,
        packId,
      },
    });

    if (existingCartItem) {
      // Update quantity
      await prisma.guestCart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      // Create new cart item
      await prisma.guestCart.create({
        data: {
          sessionId,
          packId,
          quantity,
        },
      });
    }

    // Get updated cart count
    const cartCount = await prisma.guestCart.count({
      where: { sessionId },
    });

    const response = NextResponse.json({
      message: "Item added to cart",
      cartTotal: cartCount,
    });

    // Set session cookie
    response.cookies.set("guest-session", sessionId, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error adding to guest cart:", error);
    return NextResponse.json(
      {
        error: "Failed to add item to cart",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    const body = await request.json();
    const { itemId, quantity } = body;

    // Verify cart item belongs to session
    const cartItem = await prisma.guestCart.findFirst({
      where: {
        id: itemId,
        sessionId,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          error: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // Update quantity
    const updatedItem = await prisma.guestCart.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({
      message: "Cart item updated",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating guest cart item:", error);
    return NextResponse.json(
      {
        error: "Failed to update cart item",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    const body = await request.json();
    const { itemId } = body;

    // Verify cart item belongs to session and delete
    const deletedItem = await prisma.guestCart.deleteMany({
      where: {
        id: itemId,
        sessionId,
      },
    });

    if (deletedItem.count === 0) {
      return NextResponse.json(
        {
          error: "Cart item not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing guest cart item:", error);
    return NextResponse.json(
      {
        error: "Failed to remove cart item",
      },
      { status: 500 }
    );
  }
}
