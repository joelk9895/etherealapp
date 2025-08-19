import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Premium Sample Packs
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {" "}
              for Producers
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover curated sample packs with preview tracks from top techno 
            and house producers worldwide. Get complete collections instead of 
            individual samples.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/packs"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Browse Packs
            </Link>
            <Link
              href="/upload"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Sell Your Packs
            </Link>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Popular Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              "Techno",
              "House",
              "Progressive",
              "Trance",
              "Drum & Bass",
              "Dubstep",
              "Ambient",
              "Breaks",
            ].map((category) => (
              <Link
                key={category}
                href={`/samples?category=${category.toLowerCase()}`}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 text-center hover:bg-white/20 transition-all"
              >
                <h4 className="text-xl font-semibold text-white mb-2">
                  {category}
                </h4>
                <p className="text-gray-300">
                  Explore {category.toLowerCase()} samples
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Samples Preview */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Featured Samples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4"></div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Dark Techno Loop {i}
                </h4>
                <p className="text-gray-300 mb-4">By Producer {i}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-white">
                    ${(Math.random() * 10 + 5).toFixed(2)}
                  </span>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
