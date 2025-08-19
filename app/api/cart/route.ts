import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";

async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload?.userId || null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      // For demo purposes, return empty cart if not authenticated
      return NextResponse.json({
        items: [],
        total: 0,
      });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
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
    const transformedItems = cartItems.map((item) => ({
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

    return NextResponse.json({
      items: transformedItems,
      total,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
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
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

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

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_packId: {
          userId,
          packId,
        },
      },
    });

    if (existingCartItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          userId,
          packId,
          quantity,
        },
      });
    }

    // Get updated cart count
    const cartCount = await prisma.cartItem.count({
      where: { userId },
    });

    return NextResponse.json({
      message: "Item added to cart",
      cartTotal: cartCount,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
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
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId, quantity } = body;

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId,
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
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({
      message: "Cart item updated",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
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
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId } = body;

    // Verify cart item belongs to user and delete
    const deletedItem = await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        userId,
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
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      {
        error: "Failed to remove cart item",
      },
      { status: 500 }
    );
  }
}
