import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, userType } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Name, email, and password are required",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType: userType || "buyer",
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      userType: newUser.userType,
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          userType: newUser.userType,
          verified: newUser.verified,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Registration failed",
      },
      { status: 500 }
    );
  }
}
