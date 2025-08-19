import { NextRequest, NextResponse } from "next/server";

// Mock following data - in a real app, this would be stored in database
let followingData = {
  // userId -> [producerIds]
  user1: ["1", "3"],
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const producerId = params.id;

    // In a real app, you would:
    // 1. Verify user authentication from JWT token
    // 2. Get user ID from token
    // 3. Check if already following
    // 4. Add/remove from following list in database
    // 5. Send notification to producer

    const userId = "user1"; // Would come from authentication

    if (!followingData[userId]) {
      followingData[userId] = [];
    }

    const isFollowing = followingData[userId].includes(producerId);

    if (isFollowing) {
      // Unfollow
      followingData[userId] = followingData[userId].filter(
        (id) => id !== producerId
      );
      return NextResponse.json({
        message: "Unfollowed producer",
        isFollowing: false,
      });
    } else {
      // Follow
      followingData[userId].push(producerId);
      return NextResponse.json({
        message: "Following producer",
        isFollowing: true,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to follow/unfollow producer",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const producerId = params.id;
    const userId = "user1"; // Would come from authentication

    const isFollowing = followingData[userId]?.includes(producerId) || false;

    return NextResponse.json({
      isFollowing,
      followerCount: Math.floor(Math.random() * 1000) + 50, // Mock follower count
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get follow status",
      },
      { status: 500 }
    );
  }
}
