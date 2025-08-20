"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

interface Sample {
  id: string;
  title: string;
  category: string;
  price: number;
  plays: number;
  sales: number;
  createdAt: string;
  previewUrl: string;
  artworkUrl?: string;
}

interface Stats {
  totalSamples: number;
  totalSales: number;
  totalEarnings: number;
  totalPlays: number;
  followers: number;
}

export default function ProducerDashboardPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user.userType !== "producer") {
          alert("This page is only for producers");
          window.location.href = "/";
          return;
        }
        setUser(data.user);
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      window.location.href = "/login";
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [samplesResponse, statsResponse] = await Promise.all([
        fetch("/api/producer/samples", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/producer/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (samplesResponse.ok) {
        const samplesData = await samplesResponse.json();
        setSamples(samplesData.samples);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (sampleId: string) => {
    setCurrentlyPlaying(currentlyPlaying === sampleId ? null : sampleId);
  };

  const deleteSample = async (sampleId: string) => {
    if (!confirm("Are you sure you want to delete this sample?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/samples/${sampleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSamples(samples.filter((s) => s.id !== sampleId));
        alert("Sample deleted successfully");
      } else {
        alert("Failed to delete sample");
      }
    } catch (error) {
      console.error("Error deleting sample:", error);
      alert("Failed to delete sample");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white font-instrument-sans text-xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-anton text-4xl text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="font-instrument-sans text-gray-300 text-lg">
            Manage your samples and track your performance
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-center">
                <div className="font-anton text-3xl text-white mb-2">
                  {stats.totalSamples}
                </div>
                <div className="font-instrument-sans text-gray-300">
                  Total Samples
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-center">
                <div className="font-anton text-3xl text-white mb-2">
                  {stats.totalSales}
                </div>
                <div className="font-instrument-sans text-gray-300">
                  Total Sales
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-center">
                <div className="font-anton text-3xl text-white mb-2">
                  ${stats.totalEarnings.toFixed(2)}
                </div>
                <div className="font-instrument-sans text-gray-300">
                  Total Earnings
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-center">
                <div className="font-anton text-3xl text-white mb-2">
                  {stats.totalPlays}
                </div>
                <div className="font-instrument-sans text-gray-300">
                  Total Plays
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-center">
                <div className="font-anton text-3xl text-white mb-2">
                  {stats.followers}
                </div>
                <div className="font-instrument-sans text-gray-300">
                  Followers
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/upload"
            className="bg-white text-black rounded-lg p-6 text-center hover:bg-gray-100 transition"
          >
            <svg
              className="w-12 h-12 text-black mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <h3 className="font-anton text-black text-xl mb-2">
              Upload New Sample
            </h3>
            <p className="font-instrument-sans text-gray-700">
              Share your latest creation
            </p>
          </Link>

          <Link
            href={`/producers/${user?.id}`}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center hover:bg-gray-800 transition"
          >
            <svg
              className="w-12 h-12 text-white mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="font-anton text-white text-xl mb-2">
              View Public Profile
            </h3>
            <p className="font-instrument-sans text-gray-300">
              See how others see you
            </p>
          </Link>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <svg
              className="w-12 h-12 text-white mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="font-anton text-white text-xl mb-2">Analytics</h3>
            <p className="font-instrument-sans text-gray-300">Coming soon</p>
          </div>
        </div>

        {/* Your Samples */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-anton text-2xl text-white">
              Your Samples ({samples.length})
            </h2>
            <Link
              href="/upload"
              className="px-6 py-2 bg-white text-black font-instrument-sans font-medium rounded-lg hover:bg-gray-100 transition"
            >
              Upload New
            </Link>
          </div>

          {samples.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-24 h-24 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <p className="font-instrument-sans text-gray-400 text-lg mb-4">
                You haven&apos;t uploaded any samples yet
              </p>
              <Link
                href="/upload"
                className="inline-block px-8 py-3 bg-white text-black font-instrument-sans font-medium rounded-lg hover:bg-gray-100 transition"
              >
                Upload Your First Sample
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {samples && samples.length > 0 ? samples.map((sample) => (
                <div
                  key={sample.id}
                  className="bg-gray-950 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
                      {sample.artworkUrl ? (
                        <img
                          src={sample.artworkUrl}
                          alt={sample.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg
                          className="w-8 h-8 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-anton text-white text-lg">
                        {sample.title}
                      </h3>
                      <p className="font-instrument-sans text-gray-400">
                        {sample.category} • ${sample.price}
                      </p>
                      <div className="flex items-center gap-4 mt-1 font-instrument-sans text-sm text-gray-500">
                        <span>{sample.plays} plays</span>
                        <span>{sample.sales} sales</span>
                        <span>
                          Uploaded{" "}
                          {new Date(sample.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePlay(sample.id)}
                      className="p-2 bg-white text-black rounded-lg hover:bg-gray-100 transition"
                    >
                      {currentlyPlaying === sample.id ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15"
                          />
                        </svg>
                      )}
                    </button>

                    <Link
                      href={`/edit-sample/${sample.id}`}
                      className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>

                    <button
                      onClick={() => deleteSample(sample.id)}
                      className="p-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="font-instrument-sans text-gray-400">No samples found in your account.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
