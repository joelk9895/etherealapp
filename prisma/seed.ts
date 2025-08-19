import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample users
  const hashedPassword = await hashPassword("password123");

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "buyer@example.com" },
      update: {},
      create: {
        email: "buyer@example.com",
        password: hashedPassword,
        name: "Demo Buyer",
        userType: "buyer",
        location: "New York, USA",
      },
    }),
    prisma.user.upsert({
      where: { email: "digitalprophet@example.com" },
      update: {},
      create: {
        email: "digitalprophet@example.com",
        password: hashedPassword,
        name: "Digital Prophet",
        userType: "producer",
        bio: "Underground techno producer with 10+ years of experience. Known for dark, industrial sounds that move dancefloors worldwide.",
        location: "Berlin, Germany",
        verified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "rhythmmaster@example.com" },
      update: {},
      create: {
        email: "rhythmmaster@example.com",
        password: hashedPassword,
        name: "Rhythm Master",
        userType: "producer",
        bio: "House music specialist from Chicago. Creating groovy, soulful house tracks that blend classic and modern elements.",
        location: "Chicago, USA",
        verified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "sonicwave@example.com" },
      update: {},
      create: {
        email: "sonicwave@example.com",
        password: hashedPassword,
        name: "Sonic Wave",
        userType: "producer",
        bio: "Progressive and trance producer focused on emotional, uplifting melodies. Every track tells a story.",
        location: "Amsterdam, Netherlands",
        verified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "beatmachine@example.com" },
      update: {},
      create: {
        email: "beatmachine@example.com",
        password: hashedPassword,
        name: "Beat Machine",
        userType: "producer",
        bio: "Drum & bass veteran from London. Known for hard-hitting breaks and innovative sound design.",
        location: "London, UK",
        verified: true,
      },
    }),
  ]);

  console.log("✅ Users created");

  // Find producers for sample creation
  const digitalProphet = users.find((u) => u.name === "Digital Prophet");
  const rhythmMaster = users.find((u) => u.name === "Rhythm Master");
  const sonicWave = users.find((u) => u.name === "Sonic Wave");
  const beatMachine = users.find((u) => u.name === "Beat Machine");

  // Create sample tracks
  const samples = await Promise.all([
    prisma.sample.create({
      data: {
        title: "Dark Techno Loop",
        description: "A haunting techno loop perfect for underground sets",
        category: "techno",
        bpm: 128,
        key: "Am",
        price: 9.99,
        duration: 32,
        previewUrl: "/samples/preview1.mp3",
        downloadUrl: "/samples/download1.zip",
        waveformUrl: "/waveforms/1.png",
        tags: ["dark", "loop", "industrial", "underground"],
        producerId: digitalProphet!.id,
      },
    }),
    prisma.sample.create({
      data: {
        title: "Acid Bass Line",
        description: "Classic 303-style acid bass line",
        category: "techno",
        bpm: 130,
        key: "Em",
        price: 8.99,
        duration: 8,
        previewUrl: "/samples/preview2.mp3",
        downloadUrl: "/samples/download2.zip",
        waveformUrl: "/waveforms/2.png",
        tags: ["acid", "bass", "303", "classic"],
        producerId: digitalProphet!.id,
      },
    }),
    prisma.sample.create({
      data: {
        title: "House Groove",
        description: "Smooth house groove with deep bassline",
        category: "house",
        bpm: 126,
        key: "Dm",
        price: 7.99,
        duration: 16,
        previewUrl: "/samples/preview3.mp3",
        downloadUrl: "/samples/download3.zip",
        waveformUrl: "/waveforms/3.png",
        tags: ["groove", "bassline", "deep", "smooth"],
        producerId: rhythmMaster!.id,
      },
    }),
    prisma.sample.create({
      data: {
        title: "Soulful Vocal Chop",
        description: "Chopped vocal sample with soul",
        category: "house",
        bpm: 124,
        key: "G",
        price: 11.99,
        duration: 8,
        previewUrl: "/samples/preview4.mp3",
        downloadUrl: "/samples/download4.zip",
        waveformUrl: "/waveforms/4.png",
        tags: ["vocal", "soulful", "chop", "emotional"],
        producerId: rhythmMaster!.id,
      },
    }),
    prisma.sample.create({
      data: {
        title: "Progressive Lead",
        description: "Uplifting progressive lead melody",
        category: "progressive",
        bpm: 132,
        key: "F#m",
        price: 12.99,
        duration: 24,
        previewUrl: "/samples/preview5.mp3",
        downloadUrl: "/samples/download5.zip",
        waveformUrl: "/waveforms/5.png",
        tags: ["lead", "melodic", "uplifting", "progressive"],
        producerId: sonicWave!.id,
      },
    }),
    prisma.sample.create({
      data: {
        title: "Trance Pluck",
        description: "Energetic trance pluck arpeggio",
        category: "trance",
        bpm: 138,
        key: "C",
        price: 10.99,
        duration: 16,
        previewUrl: "/samples/preview6.mp3",
        downloadUrl: "/samples/download6.zip",
        waveformUrl: "/waveforms/6.png",
        tags: ["pluck", "arp", "energy", "trance"],
        producerId: sonicWave!.id,
      },
    }),
    prisma.sample.create({
      data: {
        title: "Drum Break",
        description: "Hard-hitting drum break for D&B",
        category: "drum-bass",
        bpm: 174,
        key: null,
        price: 6.99,
        duration: 4,
        previewUrl: "/samples/preview7.mp3",
        downloadUrl: "/samples/download7.zip",
        waveformUrl: "/waveforms/7.png",
        tags: ["drums", "break", "jungle", "hard"],
        producerId: beatMachine!.id,
      },
    }),
    prisma.sample.create({
      data: {
        title: "Jungle Percussion",
        description: "Complex jungle percussion loop",
        category: "drum-bass",
        bpm: 170,
        key: null,
        price: 8.99,
        duration: 8,
        previewUrl: "/samples/preview8.mp3",
        downloadUrl: "/samples/download8.zip",
        waveformUrl: "/waveforms/8.png",
        tags: ["percussion", "jungle", "complex", "loop"],
        producerId: beatMachine!.id,
      },
    }),
  ]);

  console.log("✅ Samples created");

  // Create some follows
  const buyer = users.find((u) => u.userType === "buyer");
  if (buyer) {
    await Promise.all([
      prisma.follow.create({
        data: {
          followerId: buyer.id,
          followingId: digitalProphet!.id,
        },
      }),
      prisma.follow.create({
        data: {
          followerId: buyer.id,
          followingId: sonicWave!.id,
        },
      }),
    ]);
    console.log("✅ Follows created");
  }

  console.log("🎉 Database seeded successfully!");
  console.log("");
  console.log("Demo accounts:");
  console.log("Buyer: buyer@example.com / password123");
  console.log("Producer: digitalprophet@example.com / password123");
  console.log("Producer: rhythmmaster@example.com / password123");
  console.log("Producer: sonicwave@example.com / password123");
  console.log("Producer: beatmachine@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
