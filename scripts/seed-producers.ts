import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedProducers() {
  try {
    // Create producer accounts
    const hashedPassword = await bcrypt.hash("password123", 10);

    const producers = [
      {
        email: "darkwave@example.com",
        password: hashedPassword,
        name: "DarkWave",
        userType: "producer" as const,
        bio: "Crafting dark techno soundscapes since 2015. Known for industrial beats and atmospheric textures.",
        location: "Berlin, Germany",
      },
      {
        email: "synthmaster@example.com",
        password: hashedPassword,
        name: "SynthMaster",
        userType: "producer" as const,
        bio: "Progressive house and melodic techno producer. Creating emotional journeys through sound.",
        location: "London, UK",
      },
      {
        email: "bassguru@example.com",
        password: hashedPassword,
        name: "BassGuru",
        userType: "producer" as const,
        bio: "Deep house and minimal techno specialist. All about the groove and the bass.",
        location: "Amsterdam, Netherlands",
      },
    ];

    for (const producerData of producers) {
      // Check if producer already exists
      const existingProducer = await prisma.user.findUnique({
        where: { email: producerData.email },
      });

      if (!existingProducer) {
        const producer = await prisma.user.create({
          data: producerData,
        });
        console.log(`Created producer: ${producer.name} (${producer.email})`);
      } else {
        console.log(
          `Producer already exists: ${producerData.name} (${producerData.email})`
        );
      }
    }

    console.log("Producer seeding completed!");
    console.log("\nYou can now log in with:");
    console.log("- darkwave@example.com / password123");
    console.log("- synthmaster@example.com / password123");
    console.log("- bassguru@example.com / password123");
  } catch (error) {
    console.error("Error seeding producers:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducers();
