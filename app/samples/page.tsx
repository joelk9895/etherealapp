"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import Header from "@/components/Header";

interface Sample {
  id: string;
  title: string;
  producer: string;
  category: string;
  bpm: number;
  key: string;
  price: number;
  duration: number;
  preview_url: string;
  waveform: string;
  tags: string[];
}

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    minBpm: "",
    maxBpm: "",
    key: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  });
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null); // Track which sample is being added
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const { addToCart, cartItems, fetchCart, removeItem } = useCart();
  const {
    toasts,
    removeToast,
    success: showSuccess,
    error: showError,
  } = useToast();

  useEffect(() => {
    fetchSamples();
    fetchCart(); // Load cart data when component mounts
  }, [filters, fetchCart]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
    };
  }, [audioRef]);

  // Helper function to get quantity of a sample in cart
  const getSampleQuantityInCart = (sampleId: string) => {
    const cartItem = cartItems.find((item) => item.packId === sampleId);
    return cartItem ? cartItem.quantity : 0;
  };

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/samples?${queryParams}`);
      const data = await response.json();
      setSamples(data.samples);
    } catch (error) {
      console.error("Error fetching samples:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = async (sampleId: string) => {
    const sample = samples.find((s) => s.id === sampleId);
    if (!sample) return;

    console.log("Attempting to play audio for sample:", sampleId);
    console.log("Preview URL:", sample.preview_url);

    // If the same sample is playing, pause it
    if (currentlyPlaying === sampleId) {
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
      setCurrentlyPlaying(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }

    try {
      // Create new audio element
      const audio = new Audio();

      audio.addEventListener("loadstart", () => {
        console.log("Audio load started");
      });

      audio.addEventListener("canplay", () => {
        console.log("Audio can start playing");
      });

      audio.addEventListener("ended", () => {
        console.log("Audio playback ended");
        setCurrentlyPlaying(null);
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        console.error("Audio error details:", audio.error);
        setCurrentlyPlaying(null);
        showError("Unable to play audio preview. Please try again.");
      });

      audio.addEventListener("loadeddata", () => {
        console.log("Audio data loaded successfully");
      });

      // Set the source and try to play
      audio.src = sample.preview_url;
      setAudioRef(audio);
      setCurrentlyPlaying(sampleId);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Play promise rejected:", error);
          setCurrentlyPlaying(null);
          showError(
            "Unable to play audio. Please check your browser settings."
          );
        });
      }
    } catch (error) {
      console.error("Error setting up audio:", error);
      setCurrentlyPlaying(null);
      showError("Failed to initialize audio player.");
    }
  };

  const handleCartAction = async (sampleId: string) => {
    // Find the sample for the success message and optimistic update
    const sample = samples.find((s) => s.id === sampleId);
    if (!sample) return;

    // Check if already in cart
    const quantityInCart = getSampleQuantityInCart(sampleId);
    const isInCart = quantityInCart > 0;
    
    setAddingToCart(sampleId);
    try {
      if (isInCart) {
        // Find the cart item ID to remove
        const cartItem = cartItems.find((item) => item.packId === sampleId);
        if (cartItem) {
          await removeItem(cartItem.id);
          showSuccess(`"${sample.title}" removed from cart!`);
        }
      } else {
        await addToCart(sample, 1);
        showSuccess(`"${sample.title}" added to cart!`);
      }
    } catch (error) {
      console.error("Error managing cart:", error);
      const action = isInCart ? "remove" : "add";
      showError(`Failed to ${action} "${sample.title}" ${isInCart ? "from" : "to"} cart. Please try again.`);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <Header />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 lg:sticky lg:top-8 lg:self-start">
              <h3 className="font-anton text-xl text-white mb-6">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block font-instrument-sans text-white mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search samples..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 font-instrument-sans focus:border-yellow-500 focus:outline-none transition-colors"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block font-instrument-sans text-white mb-2">
                  Category
                </label>
                <select
                  className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white font-instrument-sans"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  <option value="">All Categories</option>
                  <option value="techno">Techno</option>
                  <option value="house">House</option>
                  <option value="progressive">Progressive</option>
                  <option value="trance">Trance</option>
                  <option value="drum-bass">Drum & Bass</option>
                  <option value="dubstep">Dubstep</option>
                </select>
              </div>

              {/* BPM Range */}
              <div className="mb-6">
                <label className="block font-instrument-sans text-white mb-2">
                  BPM Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-1/2 bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 font-instrument-sans"
                    value={filters.minBpm}
                    onChange={(e) =>
                      setFilters({ ...filters, minBpm: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-1/2 bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 font-instrument-sans"
                    value={filters.maxBpm}
                    onChange={(e) =>
                      setFilters({ ...filters, maxBpm: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block font-instrument-sans text-white mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min $"
                    className="w-1/2 bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 font-instrument-sans"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max $"
                    className="w-1/2 bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 font-instrument-sans"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Key */}
              <div className="mb-6">
                <label className="block font-instrument-sans text-white mb-2">
                  Key
                </label>
                <select
                  className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white font-instrument-sans"
                  value={filters.key}
                  onChange={(e) =>
                    setFilters({ ...filters, key: e.target.value })
                  }
                >
                  <option value="">All Keys</option>
                  <option value="C">C</option>
                  <option value="C#">C#</option>
                  <option value="D">D</option>
                  <option value="D#">D#</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="F#">F#</option>
                  <option value="G">G</option>
                  <option value="G#">G#</option>
                  <option value="A">A</option>
                  <option value="A#">A#</option>
                  <option value="B">B</option>
                </select>
              </div>
            </div>
          </div>

          {/* Samples Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-anton text-3xl text-white">Browse Samples</h2>
              <div className="flex gap-2">
                <select className="bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white font-instrument-sans focus:border-yellow-500 focus:outline-none">
                  <option>Sort by: Newest</option>
                  <option>Sort by: Price Low to High</option>
                  <option>Sort by: Price High to Low</option>
                  <option>Sort by: Most Popular</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="font-instrument-sans text-white mt-4">
                  Loading samples...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {samples && samples.length > 0 ? samples.map((sample) => (
                  <Link
                    key={sample.id}
                    href={`/samples/${sample.id}`}
                    className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors block"
                  >
                    {/* Waveform Header */}
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
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePlay(sample.id);
                        }}
                        className="absolute inset-0 w-full h-full bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors group"
                      >
                        <div className="w-12 h-12 bg-white/10 group-hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                          {currentlyPlaying === sample.id ? (
                            <svg
                              className="w-5 h-5 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-white ml-0.5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h4 className="font-anton text-lg text-white mb-1 leading-tight">
                          {sample.title}
                        </h4>
                        <p className="font-instrument-sans text-sm text-gray-400">
                          by {sample.producer}
                        </p>
                      </div>

                      {/* Metadata Grid */}
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

                      {/* Tags */}
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

                      {/* Price and Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <div className="font-anton text-2xl text-white">
                          ${sample.price.toFixed(2)}
                        </div>
                        {(() => {
                          const quantityInCart = getSampleQuantityInCart(
                            sample.id
                          );
                          const isInCart = quantityInCart > 0;
                          const isLoading = addingToCart === sample.id;
                          return (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCartAction(sample.id);
                              }}
                              disabled={isLoading}
                              className={`px-6 py-2 rounded-md transition-colors font-instrument-sans font-medium text-sm flex items-center gap-2 ${
                                isInCart
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : isLoading
                                  ? "bg-yellow-600 text-black cursor-wait"
                                  : "bg-yellow-500 hover:bg-yellow-400 text-black"
                              }`}
                            >
                              {isLoading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                  {isInCart ? "Removing..." : "Adding..."}
                                </>
                              ) : isInCart ? (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M19 13H5v-2h14v2z" />
                                  </svg>
                                  Remove from Cart
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                  </svg>
                                  Add to Cart
                                </>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="font-instrument-sans text-gray-400">No samples found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
