import { NextRequest, NextResponse } from "next/server";

// Mock producers data (same as in main producers route)
const mockProducers = [
  {
    id: "1",
    name: "Digital Prophet",
    bio: "Underground techno producer with 10+ years of experience. Known for dark, industrial sounds that move dancefloors worldwide. Started producing in the underground scene of Berlin and has since released on major labels like Drumcode, Minus, and CLR. His unique sound combines classic analog warmth with modern digital precision.",
    avatar: "/avatars/digital-prophet.jpg",
    genres: ["techno", "industrial", "dark"],
    samplesCount: 156,
    totalSales: 2847,
    rating: 4.8,
    location: "Berlin, Germany",
    joinedDate: "2018-03-15",
    verified: true,
    socialLinks: {
      instagram: "https://instagram.com/digitalprophet",
      soundcloud: "https://soundcloud.com/digitalprophet",
      spotify: "https://open.spotify.com/artist/digitalprophet",
    },
  },
  {
    id: "2",
    name: "Rhythm Master",
    bio: "House music specialist from Chicago. Creating groovy, soulful house tracks that blend classic and modern elements. Influenced by the original Chicago house scene and legendary producers like Frankie Knuckles and Larry Heard.",
    avatar: "/avatars/rhythm-master.jpg",
    genres: ["house", "deep house", "tech house"],
    samplesCount: 89,
    totalSales: 1654,
    rating: 4.6,
    location: "Chicago, USA",
    joinedDate: "2019-07-22",
    verified: true,
    socialLinks: {
      soundcloud: "https://soundcloud.com/rhythmmaster",
      website: "https://rhythmmaster.com",
    },
  },
  {
    id: "3",
    name: "Sonic Wave",
    bio: "Progressive and trance producer focused on emotional, uplifting melodies. Every track tells a story and takes listeners on a journey through sound. Based in Amsterdam, drawing inspiration from the city's rich electronic music culture.",
    avatar: "/avatars/sonic-wave.jpg",
    genres: ["progressive", "trance", "melodic"],
    samplesCount: 234,
    totalSales: 3921,
    rating: 4.9,
    location: "Amsterdam, Netherlands",
    joinedDate: "2017-11-08",
    verified: true,
    socialLinks: {
      instagram: "https://instagram.com/sonicwave",
      spotify: "https://open.spotify.com/artist/sonicwave",
      website: "https://sonicwave.music",
    },
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const producerId = params.id;

  const producer = mockProducers.find((p) => p.id === producerId);

  if (!producer) {
    return NextResponse.json(
      {
        error: "Producer not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    producer,
  });
}
