"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useCart } from "@/hooks/useCart";

interface Pack {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  producer: string;
  previewUrl: string;
  artworkUrl?: string;
  totalSamples: number;
  bpm?: number;
  key?: string;
  styleTags: string[];
  moodTags: string[];
  plays: number;
  sales: number;
  createdAt: string;
}

const categories = [
  "all",
  "Progressive House",
  "Deep House", 
  "Tech House",
  "Melodic Techno",
  "Progressive Techno",
  "Dark Techno",
  "Minimal Techno",
  "Industrial Techno"
];

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; userType: string } | null>(null);

    const { addToCart, cartItems, fetchCart, removeItem } = useCart();

  useEffect(() => {
    fetchPacks();
    checkAuth();
    fetchCart(); // Load cart data when component mounts
  }, [currentPage, selectedCategory, searchQuery, sortBy, fetchCart]);
  
  // Refresh cart data periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCart();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [fetchCart]);

  // Check if user is authenticated and get user info
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

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy,
        sortOrder: "desc"
      });

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/packs?${params}`);
      const data = await response.json();

      setPacks(data.packs);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching packs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPreview = (packId: string, previewUrl: string) => {
    if (playingPreview === packId) {
      // Stop current preview
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
      setPlayingPreview(null);
    } else {
      // Stop any current preview
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }

      // Play new preview
      const audio = new Audio(previewUrl);
      audio.play();
      setAudioRef(audio);
      setPlayingPreview(packId);

      audio.onended = () => {
        setPlayingPreview(null);
      };
    }
  };

  // Check if a pack is in the cart
  const isPackInCart = (packId: string) => {
    return cartItems.some(item => item.packId === packId);
  };

  const handleCartAction = async (pack: Pack) => {
    const inCart = isPackInCart(pack.id);
    
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
          producer: pack.producer,
          price: pack.price,
          quantity: 1,
          preview_url: pack.previewUrl
        });
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      alert("Failed to update cart");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPacks();
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-anton text-4xl text-white mb-4">Sample Packs</h1>
          <p className="font-instrument-sans text-gray-400">
            Discover curated sample packs from top producers
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search packs, producers..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-instrument-sans font-semibold rounded-r-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
            >
              <option value="createdAt">Latest</option>
              <option value="plays">Most Played</option>
              <option value="sales">Best Selling</option>
              <option value="price">Price: Low to High</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full font-instrument-sans text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category === "all" ? "All Categories" : category}
              </button>
            ))}
          </div>
        </div>

        {/* Create Pack Button (for producers only) */}
        {user?.userType === "producer" && (
          <div className="mb-8">
            <Link
              href="/packs/create"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-instrument-sans font-semibold transition-colors"
            >
              + Create Pack
            </Link>
          </div>
        )}

        {/* Packs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse">
                <div className="aspect-square bg-gray-800 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-800 rounded mb-2"></div>
                <div className="h-3 bg-gray-800 rounded mb-2 w-2/3"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-600 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3"/>
              </svg>
            </div>
            <h3 className="font-anton text-2xl text-white mb-2">No packs found</h3>
            <p className="font-instrument-sans text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {packs.map(pack => (
              <div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors relative group cursor-pointer">
                {/* Clickable Area for Entire Card */}
                <Link href={`/packs/${pack.id}`} className="absolute inset-0 z-10" aria-label={`View details for ${pack.title}`}></Link>
                
                {/* Pack Artwork */}
                <div className="aspect-square bg-gray-800 rounded-lg mb-4 relative overflow-hidden">
                  {pack.artworkUrl ? (
                    <img 
                      src={pack.artworkUrl} 
                      alt={pack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Play Button - z-20 to stay above the Link */}
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation when clicking play
                      e.stopPropagation(); // Stop event from bubbling up
                      handlePlayPreview(pack.id, pack.previewUrl);
                    }}
                    className="absolute inset-0 z-20 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {playingPreview === pack.id ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.5 3.5A1.5 1.5 0 017 2h6a1.5 1.5 0 011.5 1.5v13a1.5 1.5 0 01-1.5 1.5H7A1.5 1.5 0 015.5 16.5v-13z"/>
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Pack Info */}
                <div className="space-y-2">
                  <h3 className="font-instrument-sans font-semibold text-white text-sm line-clamp-2">
                    {pack.title}
                  </h3>
                  
                  <p className="font-instrument-sans text-gray-400 text-xs">
                    by {pack.producer}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{pack.totalSamples} samples</span>
                    <span>{pack.category}</span>
                  </div>

                  {pack.bpm && (
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{pack.bpm} BPM</span>
                      {pack.key && <span>{pack.key}</span>}
                    </div>
                  )}

                  {/* Tags */}
                  {pack.styleTags && pack.styleTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pack.styleTags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price and Actions - z-20 to stay above the Link */}
                  <div className="flex items-center justify-between pt-2 relative z-20">
                    <span className="font-instrument-sans font-bold text-yellow-500">
                      ${pack.price.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation when clicking button
                        e.stopPropagation(); // Stop event from bubbling up
                        handleCartAction(pack);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                        cartItems.some(item => item.packId === pack.id) 
                          ? 'bg-red-500 hover:bg-red-400 text-white' 
                          : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                      }`}
                    >
                      {cartItems.some(item => item.packId === pack.id) ? 'Remove' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
