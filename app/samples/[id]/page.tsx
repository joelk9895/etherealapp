"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import Header from "@/components/Header";

interface Sample {
  id: string;
  title: string;
  producer: {
    name: string;
  };
  category: string;
  bpm: number;
  key: string;
  price: number;
  duration: number;
  preview_url: string;
  waveform: string;
  tags: string[];
  description: string;
  created_at: string;
}

export default function SampleDetailPage() {
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart, cartItems, fetchCart } = useCart();
  const {
    toasts,
    removeToast,
    success: showSuccess,
    error: showError,
  } = useToast();
  const params = useParams();
  const router = useRouter();
  const sampleId = params.id as string;

  useEffect(() => {
    fetchSample();
    fetchCart(); // Load cart data when component mounts
  }, [sampleId, fetchCart]);

  // Helper function to get quantity of a sample in cart
  const getSampleQuantityInCart = (sampleId: string) => {
    const cartItem = cartItems.find((item) => item.sampleId === sampleId);
    return cartItem ? cartItem.quantity : 0;
  };

  const fetchSample = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/samples/${sampleId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Sample not found");
        } else {
          setError("Failed to load sample");
        }
        return;
      }

      const data = await response.json();
      setSample(data.sample);
    } catch (error) {
      console.error("Error fetching sample:", error);
      setError("Failed to load sample");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    setCurrentlyPlaying(!currentlyPlaying);
  };

  const handleAddToCart = async () => {
    if (!sample) return;

    // Check if already in cart
    const quantityInCart = getSampleQuantityInCart(sample.id);
    if (quantityInCart > 0) return;

    setAddingToCart(true);
    try {
      // Create a compatible sample object for addToCart
      const sampleForCart = {
        id: sample.id,
        title: sample.title,
        producer: sample.producer.name,
        price: sample.price,
        preview_url: sample.preview_url,
      };
      await addToCart(sampleForCart, 1);
      showSuccess(`"${sample.title}" added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError(`Failed to add "${sample.title}" to cart. Please try again.`);
    } finally {
      setAddingToCart(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="font-instrument-sans text-white mt-4">
              Loading sample...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sample) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="font-anton text-3xl text-white mb-4">
              {error || "Sample Not Found"}
            </h1>
            <p className="font-instrument-sans text-gray-400 mb-6">
              The sample you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/samples"
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-md transition-colors font-instrument-sans font-medium"
            >
              Browse All Samples
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 font-instrument-sans text-sm text-gray-400">
            <Link
              href="/samples"
              className="hover:text-white transition-colors"
            >
              Samples
            </Link>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 6l6 6-6 6" />
            </svg>
            <span className="text-white">{sample.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Waveform and Player */}
          <div>
            {/* Large Waveform */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
              <div className="h-32 bg-gray-950 border border-gray-800 rounded-md flex items-center justify-center relative mb-4">
                <div className="w-full h-20 flex items-end justify-center gap-1 px-6">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white/40 w-1"
                      style={{ height: `${20 + Math.random() * 80}%` }}
                    ></div>
                  ))}
                </div>
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 w-full h-full bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors group"
                >
                  <div className="w-16 h-16 bg-white/10 group-hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                    {currentlyPlaying ? (
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-8 h-8 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={togglePlay}
                  className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md px-4 py-2 transition-colors"
                >
                  {currentlyPlaying ? (
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
                  <span className="font-instrument-sans text-white">
                    {currentlyPlaying ? "Pause" : "Play"} Preview
                  </span>
                </button>

                <div className="font-instrument-sans text-sm text-gray-400">
                  {sample.duration}s
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="font-anton text-xl text-white mb-4">
                Technical Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-950 border border-gray-800 rounded-md p-4 text-center">
                  <div className="font-instrument-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                    BPM
                  </div>
                  <div className="font-anton text-white text-2xl">
                    {sample.bpm}
                  </div>
                </div>
                <div className="bg-gray-950 border border-gray-800 rounded-md p-4 text-center">
                  <div className="font-instrument-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Key
                  </div>
                  <div className="font-anton text-white text-2xl">
                    {sample.key}
                  </div>
                </div>
                <div className="bg-gray-950 border border-gray-800 rounded-md p-4 text-center">
                  <div className="font-instrument-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Category
                  </div>
                  <div className="font-anton text-white text-lg capitalize">
                    {sample.category}
                  </div>
                </div>
                <div className="bg-gray-950 border border-gray-800 rounded-md p-4 text-center">
                  <div className="font-instrument-sans text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Duration
                  </div>
                  <div className="font-anton text-white text-lg">
                    {sample.duration}s
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sample Info */}
          <div>
            {/* Sample Header */}
            <div className="mb-6">
              <h1 className="font-anton text-4xl text-white mb-2 leading-tight">
                {sample.title}
              </h1>
              <p className="font-instrument-sans text-lg text-gray-400 mb-4">
                by {sample.producer.name}
              </p>
              <p className="font-instrument-sans text-sm text-gray-500">
                Released {formatDate(sample.created_at)}
              </p>
            </div>

            {/* Description */}
            {sample.description && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
                <h3 className="font-anton text-xl text-white mb-3">
                  Description
                </h3>
                <p className="font-instrument-sans text-gray-300 leading-relaxed">
                  {sample.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {sample.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-anton text-xl text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {sample.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-2 rounded-md text-sm font-instrument-sans"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-anton text-3xl text-white">
                    ${sample.price.toFixed(2)}
                  </div>
                  <div className="font-instrument-sans text-sm text-gray-400">
                    Instant download
                  </div>
                </div>
              </div>

              {(() => {
                const quantityInCart = getSampleQuantityInCart(sample.id);
                const isInCart = quantityInCart > 0;
                return (
                  <>
                    {isInCart && (
                      <div className="bg-green-900/20 border border-green-700 rounded-md p-3 mb-4">
                        <div className="flex items-center justify-center gap-2 text-green-400">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          <span className="font-instrument-sans text-sm">
                            This sample is in your cart
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleAddToCart}
                      disabled={isInCart || addingToCart}
                      className={`w-full px-6 py-4 rounded-md transition-colors font-instrument-sans font-medium text-lg mb-3 flex items-center justify-center gap-3 ${
                        isInCart
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : addingToCart
                          ? "bg-yellow-600 text-black cursor-wait"
                          : "bg-yellow-500 hover:bg-yellow-400 text-black"
                      }`}
                    >
                      {isInCart ? (
                        <>
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          Added to Cart
                        </>
                      ) : addingToCart ? (
                        <>
                          <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          Adding to Cart...
                        </>
                      ) : (
                        "Add to Cart"
                      )}
                    </button>
                  </>
                );
              })()}

              <div className="text-center">
                <Link
                  href="/samples"
                  className="font-instrument-sans text-sm text-gray-400 hover:text-white transition-colors"
                >
                  ← Back to all samples
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
