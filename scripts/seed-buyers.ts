import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedBuyers() {
  try {
    // Create buyer accounts
    const hashedPassword = await bcrypt.hash("password123", 10);

    const buyers = [
      {
        email: "djmike@example.com",
        password: hashedPassword,
        name: "DJ Mike",
        userType: "buyer" as const,
        bio: "Professional DJ specializing in underground techno and house music. Always looking for fresh sounds.",
        location: "New York, USA",
      },
      {
        email: "sarah.beats@example.com",
        password: hashedPassword,
        name: "Sarah Beats",
        userType: "buyer" as const,
        bio: "Music producer and DJ with a passion for progressive house and melodic techno.",
        location: "Los Angeles, USA",
      },
      {
        email: "alexsound@example.com",
        password: hashedPassword,
        name: "Alex Sound",
        userType: "buyer" as const,
        bio: "Radio host and music enthusiast. Love discovering new electronic music and supporting upcoming artists.",
        location: "Toronto, Canada",
      },
      {
        email: "technovibes@example.com",
        password: hashedPassword,
        name: "Techno Vibes",
        userType: "buyer" as const,
        bio: "Event organizer and music curator for underground techno events.",
        location: "Berlin, Germany",
      },
      {
        email: "musiclover@example.com",
        password: hashedPassword,
        name: "Music Lover",
        userType: "buyer" as const,
        bio: "Music enthusiast and collector of high-quality electronic music samples.",
        location: "London, UK",
      },
    ];

    for (const buyerData of buyers) {
      // Check if buyer already exists
      const existingBuyer = await prisma.user.findUnique({
        where: { email: buyerData.email },
      });

      if (!existingBuyer) {
        const buyer = await prisma.user.create({
          data: buyerData,
        });
        console.log(`Created buyer: ${buyer.name} (${buyer.email})`);
      } else {
        console.log(
          `Buyer already exists: ${buyerData.name} (${buyerData.email})`
        );
      }
    }

    console.log("Buyer seeding completed!");
    console.log("\nYou can now log in with any of these buyer accounts:");
    console.log("- djmike@example.com / password123");
    console.log("- sarah.beats@example.com / password123");
    console.log("- alexsound@example.com / password123");
    console.log("- technovibes@example.com / password123");
    console.log("- musiclover@example.com / password123");
  } catch (error) {
    console.error("Error seeding buyers:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBuyers();
