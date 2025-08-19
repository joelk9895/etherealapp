import { NextRequest, NextResponse } from "next/server";

// Mock samples data organized by producer
const samplesByProducer = {
  "1": [
    // Digital Prophet
    {
      id: "1",
      title: "Dark Techno Loop",
      category: "techno",
      bpm: 128,
      key: "Am",
      price: 9.99,
      duration: 32,
      preview_url: "/samples/preview1.mp3",
      tags: ["dark", "loop", "industrial"],
    },
    {
      id: "4",
      title: "Acid Bass",
      category: "techno",
      bpm: 130,
      key: "Em",
      price: 8.99,
      duration: 8,
      preview_url: "/samples/preview4.mp3",
      tags: ["acid", "bass", "303"],
    },
    {
      id: "7",
      title: "Industrial Percussion",
      category: "techno",
      bpm: 126,
      key: "N/A",
      price: 7.99,
      duration: 16,
      preview_url: "/samples/preview7.mp3",
      tags: ["percussion", "industrial", "mechanical"],
    },
  ],
  "2": [
    // Rhythm Master
    {
      id: "2",
      title: "House Groove",
      category: "house",
      bpm: 126,
      key: "Dm",
      price: 7.99,
      duration: 16,
      preview_url: "/samples/preview2.mp3",
      tags: ["groove", "bassline", "deep"],
    },
    {
      id: "8",
      title: "Soulful Vocal Chop",
      category: "house",
      bpm: 124,
      key: "G",
      price: 11.99,
      duration: 8,
      preview_url: "/samples/preview8.mp3",
      tags: ["vocal", "soulful", "chop"],
    },
  ],
  "3": [
    // Sonic Wave
    {
      id: "3",
      title: "Progressive Lead",
      category: "progressive",
      bpm: 132,
      key: "F#m",
      price: 12.99,
      duration: 24,
      preview_url: "/samples/preview3.mp3",
      tags: ["lead", "melodic", "uplifting"],
    },
    {
      id: "5",
      title: "Trance Pluck",
      category: "trance",
      bpm: 138,
      key: "C",
      price: 10.99,
      duration: 16,
      preview_url: "/samples/preview5.mp3",
      tags: ["pluck", "arp", "energy"],
    },
    {
      id: "9",
      title: "Emotional Pad",
      category: "progressive",
      bpm: 128,
      key: "Am",
      price: 9.99,
      duration: 32,
      preview_url: "/samples/preview9.mp3",
      tags: ["pad", "emotional", "atmospheric"],
    },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const producerId = params.id;

  const samples =
    samplesByProducer[producerId as keyof typeof samplesByProducer] || [];

  return NextResponse.json({
    samples,
    total: samples.length,
  });
}
