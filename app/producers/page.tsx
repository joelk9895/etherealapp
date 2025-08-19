"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Producer {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  genres: string[];
  samplesCount: number;
  totalSales: number;
  rating: number;
  location: string;
  joinedDate: string;
  verified: boolean;
}

export default function ProducersPage() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  useEffect(() => {
    fetchProducers();
  }, [searchTerm, selectedGenre]);

  const fetchProducers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (selectedGenre) queryParams.append("genre", selectedGenre);

      const response = await fetch(`/api/producers?${queryParams}`);
      const data = await response.json();
      setProducers(data.producers);
    } catch (error) {
      console.error("Error fetching producers:", error);
    } finally {
      setLoading(false);
    }
  };

  const followProducer = async (producerId: string) => {
    try {
      const response = await fetch(`/api/producers/${producerId}/follow`, {
        method: "POST",
      });

      if (response.ok) {
        // Update UI to show following state
        alert("Following producer!");
      }
    } catch (error) {
      console.error("Error following producer:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              EtherealTechno
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/samples"
                className="text-white hover:text-purple-300 transition-colors"
              >
                Browse Samples
              </Link>
              <Link href="/producers" className="text-purple-300 font-semibold">
                Producers
              </Link>
              <Link
                href="/cart"
                className="text-white hover:text-purple-300 transition-colors"
              >
                Cart
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-white hover:text-purple-300 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6">
            Discover Producers
          </h1>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search producers..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-64">
              <select
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 text-white"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                <option value="techno">Techno</option>
                <option value="house">House</option>
                <option value="progressive">Progressive</option>
                <option value="trance">Trance</option>
                <option value="drum-bass">Drum & Bass</option>
                <option value="dubstep">Dubstep</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Loading producers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {producers.map((producer) => (
              <div
                key={producer.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6"
              >
                {/* Producer Avatar and Basic Info */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {producer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-white">
                      {producer.name}
                    </h3>
                    {producer.verified && (
                      <span className="text-blue-400">✓</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">{producer.location}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {producer.samplesCount}
                    </div>
                    <div className="text-gray-400 text-sm">Samples</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {producer.totalSales}
                    </div>
                    <div className="text-gray-400 text-sm">Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {producer.rating.toFixed(1)}
                    </div>
                    <div className="text-gray-400 text-sm">Rating</div>
                  </div>
                </div>

                {/* Genres */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {producer.genres.map((genre) => (
                      <span
                        key={genre}
                        className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded-sm text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-300 text-sm mb-6 line-clamp-3">
                  {producer.bio}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/producers/${producer.id}`}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors text-center"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => followProducer(producer.id)}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Producers Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8">
            Featured Producers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mx-auto mb-4"></div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Top Producer {i}
                </h4>
                <p className="text-gray-400 text-sm mb-4">500+ samples</p>
                <Link
                  href={`/producers/${i}`}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  View Profile →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action for Producers */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md border border-white/10 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Are you a producer?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join our marketplace and start selling your music samples to DJs
              and producers worldwide. Get discovered, build your fanbase, and
              monetize your creativity.
            </p>
            <Link
              href="/upload"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
