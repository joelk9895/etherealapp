"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";

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
  socialLinks: {
    instagram?: string;
    soundcloud?: string;
    spotify?: string;
    website?: string;
  };
}

interface Sample {
  id: string;
  title: string;
  category: string;
  bpm: number;
  key: string;
  price: number;
  duration: number;
  preview_url: string;
  tags: string[];
}

export default function ProducerProfilePage() {
  const params = useParams();
  const producerId = params.id as string;

  const [producer, setProducer] = useState<Producer | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("samples");
  const [addingToCart, setAddingToCart] = useState<string | null>(null); // Track which sample is being added
  const { addToCart, cartItems, fetchCart } = useCart();
  const {
    toasts,
    removeToast,
    success: showSuccess,
    error: showError,
  } = useToast();

  useEffect(() => {
    if (producerId) {
      fetchProducerData();
      fetchCart(); // Load cart data when component mounts
    }
  }, [producerId, fetchCart]);

  // Helper function to get quantity of a sample in cart
  const getSampleQuantityInCart = (sampleId: string) => {
    const cartItem = cartItems.find((item) => item.sampleId === sampleId);
    return cartItem ? cartItem.quantity : 0;
  };

  const fetchProducerData = async () => {
    setLoading(true);
    try {
      const [producerResponse, samplesResponse] = await Promise.all([
        fetch(`/api/producers/${producerId}`),
        fetch(`/api/producers/${producerId}/samples`),
      ]);

      const producerData = await producerResponse.json();
      const samplesData = await samplesResponse.json();

      setProducer(producerData.producer);
      setSamples(samplesData.samples);
    } catch (error) {
      console.error("Error fetching producer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const followProducer = async () => {
    try {
      const response = await fetch(`/api/producers/${producerId}/follow`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Following producer!");
      }
    } catch (error) {
      console.error("Error following producer:", error);
    }
  };

  const handleAddToCart = async (sampleId: string) => {
    // Check if already in cart
    const quantityInCart = getSampleQuantityInCart(sampleId);
    if (quantityInCart > 0) return;

    // Find the sample for optimistic update
    const sample = samples.find((s) => s.id === sampleId);
    if (!sample) return;

    setAddingToCart(sampleId);
    try {
      await addToCart(sample, 1);
      showSuccess(`"${sample.title}" added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!producer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Producer not found
          </h1>
          <Link
            href="/producers"
            className="text-purple-400 hover:text-purple-300"
          >
            Back to Producers
          </Link>
        </div>
      </div>
    );
  }

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
              <Link
                href="/producers"
                className="text-white hover:text-purple-300 transition-colors"
              >
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
        {/* Producer Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-white">
                  {producer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
              <button
                onClick={followProducer}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Follow
              </button>
            </div>

            {/* Producer Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold text-white">
                  {producer.name}
                </h1>
                {producer.verified && (
                  <span className="text-blue-400 text-2xl">✓</span>
                )}
              </div>

              <p className="text-gray-300 mb-4">{producer.location}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {producer.samplesCount}
                  </div>
                  <div className="text-gray-400">Samples</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {producer.totalSales}
                  </div>
                  <div className="text-gray-400">Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {producer.rating.toFixed(1)}
                  </div>
                  <div className="text-gray-400">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {new Date(producer.joinedDate).getFullYear()}
                  </div>
                  <div className="text-gray-400">Joined</div>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {producer.genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                {producer.socialLinks.instagram && (
                  <a
                    href={producer.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-pink-300"
                  >
                    📷
                  </a>
                )}
                {producer.socialLinks.soundcloud && (
                  <a
                    href={producer.socialLinks.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300"
                  >
                    🎵
                  </a>
                )}
                {producer.socialLinks.spotify && (
                  <a
                    href={producer.socialLinks.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300"
                  >
                    🎧
                  </a>
                )}
                {producer.socialLinks.website && (
                  <a
                    href={producer.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    🌐
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("samples")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "samples"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:text-white"
              }`}
            >
              Samples ({samples.length})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "about"
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:text-white"
              }`}
            >
              About
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "samples" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {samples && samples.length > 0 ? samples.map((sample) => (
              <Link
                key={sample.id}
                href={`/samples/${sample.id}`}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors block"
              >
                {/* Waveform placeholder */}
                <div className="h-24 bg-gray-950 border-b border-gray-800 flex items-center justify-center relative">
                  <div className="w-full h-12 flex items-end justify-center gap-0.5 px-6">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white/40 w-1"
                        style={{ height: `${20 + Math.random() * 80}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-anton text-lg text-white mb-1 leading-tight">
                    {sample.title}
                  </h4>

                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div className="bg-gray-950 border border-gray-800 rounded-md py-2">
                      <div className="font-instrument-sans text-xs text-gray-400 uppercase tracking-wide">
                        BPM
                      </div>
                      <div className="font-anton text-white text-sm">
                        {sample.bpm}
                      </div>
                    </div>
                    <div className="bg-gray-950 border border-gray-800 rounded-md py-2">
                      <div className="font-instrument-sans text-xs text-gray-400 uppercase tracking-wide">
                        Key
                      </div>
                      <div className="font-anton text-white text-sm">
                        {sample.key}
                      </div>
                    </div>
                    <div className="bg-gray-950 border border-gray-800 rounded-md py-2">
                      <div className="font-instrument-sans text-xs text-gray-400 uppercase tracking-wide">
                        Time
                      </div>
                      <div className="font-anton text-white text-sm">
                        {sample.duration}s
                      </div>
                    </div>
                  </div>

                  {sample.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {sample.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-instrument-sans"
                        >
                          {tag}
                        </span>
                      ))}
                      {sample.tags.length > 3 && (
                        <span className="text-gray-500 text-xs font-instrument-sans px-2 py-1">
                          +{sample.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="font-anton text-2xl text-white">
                      ${sample.price.toFixed(2)}
                    </div>
                    {(() => {
                      const quantityInCart = getSampleQuantityInCart(sample.id);
                      const isInCart = quantityInCart > 0;
                      const isLoading = addingToCart === sample.id;
                      return (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isInCart && !isLoading) {
                              handleAddToCart(sample.id);
                            }
                          }}
                          disabled={isInCart || isLoading}
                          className={`px-6 py-2 rounded-md transition-colors font-instrument-sans font-medium text-sm flex items-center gap-2 ${
                            isInCart
                              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                              : isLoading
                              ? "bg-yellow-600 text-black cursor-wait"
                              : "bg-yellow-500 hover:bg-yellow-400 text-black"
                          }`}
                        >
                          {isInCart ? (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                              Added
                            </>
                          ) : isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                              Adding...
                            </>
                          ) : (
                            "Add to Cart"
                          )}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-3 text-center py-12">
                <p className="font-instrument-sans text-gray-400">This producer hasn't uploaded any samples yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              About {producer.name}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {producer.bio}
            </p>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
