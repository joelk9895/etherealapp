"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useCart } from "@/hooks/useCart";

interface Sample {
  id: string;
  title: string;
  duration: number;
  contentType: string;
  soundGroup: string;
  soundType: string;
  bpm?: number;
  key?: string;
  styleTags: string[];
  moodTags: string[];
  processingTags: string[];
  soundDesignTags: string[];
}

interface Pack {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  producer: {
    id: string;
    name: string;
    bio?: string;
    avatar?: string;
  };
  previewUrl: string;
  artworkUrl?: string;
  totalSamples: number;
  totalDuration: number;
  bpm?: number;
  key?: string;
  styleTags: string[];
  moodTags: string[];
  processingTags: string[];
  soundDesignTags: string[];
  plays: number;
  sales: number;
  createdAt: string;
  samples: Sample[];
  sampleCount: number;
}

export default function PackDetailPage() {
  const params = useParams();
  const packId = params.id as string;
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [user, setUser] = useState<{ id: string; userType: string } | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const { addToCart, removeItem, cartItems, fetchCart } = useCart();

  useEffect(() => {
    checkAuth();
  }, [packId]);
  
  // Separate useEffect for fetching pack after user state is available
  useEffect(() => {
    fetchPack();
    fetchCart(); // Load cart data when component mounts
  }, [packId, user, fetchCart]);
  
  // Refresh cart data periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCart();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [fetchCart]);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    }
  };

  const fetchPack = async () => {
    try {
      const response = await fetch(`/api/packs/${packId}`);
      if (!response.ok) {
        throw new Error("Pack not found");
      }
      const data = await response.json();
      setPack(data.pack);
      
      // Check if current user is the producer of this pack
      if (user && data.pack.producer && user.id === data.pack.producer.id) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      console.error("Error fetching pack:", error);
      setError("Failed to load pack");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPreview = () => {
    if (!pack?.previewUrl) return;

    if (playingPreview) {
      // Stop current preview
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
      setPlayingPreview(false);
    } else {
      // Play preview
      const audio = new Audio(pack.previewUrl);
      audio.play();
      setAudioRef(audio);
      setPlayingPreview(true);

      audio.onended = () => {
        setPlayingPreview(false);
      };
    }
  };

  // Check if the current pack is in the cart
  const isPackInCart = () => {
    return cartItems.some(item => item.packId === pack?.id);
  };

  const handleCartAction = async () => {
    if (!pack) return;

    const inCart = isPackInCart();
    
    try {
      if (inCart) {
        // If in cart, find the cart item and remove it
        const cartItem = cartItems.find(item => item.packId === pack.id);
        if (cartItem) {
          await removeItem(cartItem.id);
          // Wait for the state to be updated
          setTimeout(() => {
            alert("Pack removed from cart!");
          }, 100);
        }
      } else {
        // If not in cart, add it
        await addToCart({
          id: pack.id,
          packId: pack.id,
          title: pack.title,
          producer: pack.producer.name,
          price: pack.price,
          quantity: 1,
          preview_url: pack.previewUrl
        });
        alert("Pack added to cart!");
      }
    } catch (error) {
      console.error("Error managing cart:", error);
      alert(`Failed to ${inCart ? "remove pack from" : "add pack to"} cart`);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="font-anton text-3xl text-white mb-4">Pack Not Found</h1>
          <p className="font-instrument-sans text-gray-400 mb-8">
            The pack you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/packs"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-lg font-instrument-sans font-semibold transition-colors"
          >
            Browse All Packs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pack Artwork and Player */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Artwork */}
              <div className="aspect-square bg-gray-800 rounded-lg mb-6 relative overflow-hidden">
                {pack.artworkUrl ? (
                  <img 
                    src={pack.artworkUrl} 
                    alt={pack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3"/>
                    </svg>
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <button
                  onClick={handlePlayPreview}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  {playingPreview ? (
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.5 3.5A1.5 1.5 0 017 2h6a1.5 1.5 0 011.5 1.5v13a1.5 1.5 0 01-1.5 1.5H7A1.5 1.5 0 015.5 16.5v-13z"/>
                    </svg>
                  ) : (
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Purchase Section */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-anton text-3xl text-yellow-500">
                    ${pack.price.toFixed(2)}
                  </span>
                  <div className="text-right text-sm text-gray-400">
                    <div>{pack.totalSamples} samples</div>
                    <div>{pack.plays} plays</div>
                  </div>
                </div>

                {isOwner ? (
                  <Link
                    href={`/packs/edit/${packId}`}
                    className="w-full block bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-instrument-sans font-semibold text-lg transition-colors mb-4 text-center"
                  >
                    Edit Pack
                  </Link>
                ) : (
                  <button
                    onClick={handleCartAction}
                    className={`w-full py-3 rounded-lg font-instrument-sans font-semibold text-lg transition-colors mb-4 flex items-center justify-center gap-2 ${
                      isPackInCart()
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-yellow-500 hover:bg-yellow-400 text-black"
                    }`}
                  >
                    {isPackInCart() ? (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 13H5v-2h14v2z" />
                        </svg>
                        Remove from Cart
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handlePlayPreview}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-instrument-sans transition-colors flex items-center justify-center gap-2"
                >
                  {playingPreview ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.5 3.5A1.5 1.5 0 017 2h6a1.5 1.5 0 011.5 1.5v13a1.5 1.5 0 01-1.5 1.5H7A1.5 1.5 0 015.5 16.5v-13z"/>
                      </svg>
                      Stop Preview
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                      </svg>
                      Play Preview
                    </>
                  )}
                </button>

                {/* Producer Info */}
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="font-instrument-sans font-semibold text-white mb-2">Producer</h3>
                  <Link 
                    href={`/producers/${pack.producer.id}`}
                    className="flex items-center gap-3 hover:bg-gray-800 rounded-lg p-2 transition-colors"
                  >
                    {pack.producer.avatar ? (
                      <img 
                        src={pack.producer.avatar} 
                        alt={pack.producer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {pack.producer.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-instrument-sans font-medium text-white">
                        {pack.producer.name}
                      </div>
                      {pack.producer.bio && (
                        <div className="font-instrument-sans text-xs text-gray-400 line-clamp-1">
                          {pack.producer.bio}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Pack Details */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-anton text-4xl text-white mb-2">{pack.title}</h1>
              <p className="font-instrument-sans text-gray-400 text-lg mb-4">
                by {pack.producer.name}
              </p>
              
              {/* Pack Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                <span className="bg-gray-800 px-3 py-1 rounded">{pack.category}</span>
                {pack.bpm && <span className="bg-gray-800 px-3 py-1 rounded">{pack.bpm} BPM</span>}
                {pack.key && <span className="bg-gray-800 px-3 py-1 rounded">{pack.key}</span>}
                <span className="bg-gray-800 px-3 py-1 rounded">{formatDuration(pack.totalDuration)}</span>
              </div>

              {pack.description && (
                <p className="font-instrument-sans text-gray-300 leading-relaxed">
                  {pack.description}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="mb-8 space-y-4">
              {pack.styleTags && pack.styleTags.length > 0 && (
                <div>
                  <h3 className="font-instrument-sans font-semibold text-white mb-2">Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {pack.styleTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pack.moodTags && pack.moodTags.length > 0 && (
                <div>
                  <h3 className="font-instrument-sans font-semibold text-white mb-2">Mood</h3>
                  <div className="flex flex-wrap gap-2">
                    {pack.moodTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pack.processingTags && pack.processingTags.length > 0 && (
                <div>
                  <h3 className="font-instrument-sans font-semibold text-white mb-2">Processing</h3>
                  <div className="flex flex-wrap gap-2">
                    {pack.processingTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pack.soundDesignTags && pack.soundDesignTags.length > 0 && (
                <div>
                  <h3 className="font-instrument-sans font-semibold text-white mb-2">Sound Design</h3>
                  <div className="flex flex-wrap gap-2">
                    {pack.soundDesignTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sample List */}
            <div>
              <h2 className="font-anton text-2xl text-white mb-6">
                Included Samples ({pack.samples?.length || 0})
              </h2>
              
              <div className="space-y-3">
                {pack.samples && pack.samples.length > 0 ? pack.samples.map((sample, index) => (
                  <div key={sample.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-gray-400 font-mono text-sm w-6">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                          <h3 className="font-instrument-sans font-medium text-white">
                            {sample.title}
                          </h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 ml-9">
                          <span>{sample.contentType}</span>
                          <span>{sample.soundGroup}</span>
                          <span>{formatDuration(sample.duration)}</span>
                          {sample.bpm && <span>{sample.bpm} BPM</span>}
                          {sample.key && <span>{sample.key}</span>}
                        </div>

                        {/* Sample Tags */}
                        {((sample.styleTags && sample.styleTags.length > 0) || (sample.moodTags && sample.moodTags.length > 0)) && (
                          <div className="flex flex-wrap gap-1 mt-2 ml-9">
                            {sample.styleTags && sample.styleTags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                            {sample.moodTags && sample.moodTags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="font-instrument-sans text-gray-400">No samples available in this pack.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
