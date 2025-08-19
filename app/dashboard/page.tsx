"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

interface PurchasedSample {
  sampleId: string;
  sampleTitle: string;
  producer: string;
  purchaseDate: string;
  downloadUrl: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: string;
}

export default function DashboardPage() {
  const [purchasedSamples, setPurchasedSamples] = useState<PurchasedSample[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [claimingPurchases, setClaimingPurchases] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
    fetchPurchasedSamples();
    claimGuestPurchases();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchPurchasedSamples = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/user/purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPurchasedSamples(data.purchases);
      }
    } catch (error) {
      console.error("Error fetching purchased samples:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimGuestPurchases = async () => {
    try {
      setClaimingPurchases(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/claim-purchases", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.claimedCount > 0) {
          alert(
            `Successfully claimed ${data.claimedCount} previously purchased samples!`
          );
          fetchPurchasedSamples(); // Refresh the list
        }
      }
    } catch (error) {
      console.error("Error claiming guest purchases:", error);
    } finally {
      setClaimingPurchases(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRemainingDownloads = (sample: PurchasedSample) => {
    return sample.maxDownloads - sample.downloadCount;
  };

  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt);
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

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* User Info */}
        {user && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h1 className="font-anton text-3xl text-white mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="font-instrument-sans text-gray-300">
              Email: {user.email} • Account Type: {user.userType}
            </p>
          </div>
        )}

        {/* Claiming Status */}
        {claimingPurchases && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-8">
            <p className="font-instrument-sans text-gray-200">
              Checking for previous purchases made with your email...
            </p>
          </div>
        )}

        {/* Purchased Samples */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="font-anton text-2xl text-white mb-6">
            Your Purchased Samples ({purchasedSamples.length})
          </h2>

          {purchasedSamples.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-instrument-sans text-gray-400 text-lg mb-4">
                You haven't purchased any samples yet.
              </p>
              <Link
                href="/samples"
                className="inline-block px-6 py-3 bg-white text-black font-instrument-sans font-medium rounded-lg hover:bg-gray-100 transition"
              >
                Browse Samples
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {purchasedSamples.map((sample, index) => (
                <div
                  key={index}
                  className="bg-gray-950 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-anton text-white text-lg">
                      {sample.sampleTitle}
                    </h3>
                    <p className="font-instrument-sans text-gray-400">
                      by {sample.producer}
                    </p>
                    <p className="font-instrument-sans text-gray-500 text-sm">
                      Purchased: {formatDate(sample.purchaseDate)}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="font-instrument-sans text-sm text-gray-400">
                        Downloads: {sample.downloadCount}/{sample.maxDownloads}
                      </span>
                      <span className="font-instrument-sans text-sm text-gray-400">
                        Expires: {formatDate(sample.expiresAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isExpired(sample.expiresAt) ? (
                      <span className="px-4 py-2 bg-red-900 text-red-300 font-instrument-sans rounded-lg text-sm">
                        Expired
                      </span>
                    ) : getRemainingDownloads(sample) <= 0 ? (
                      <span className="px-4 py-2 bg-yellow-900 text-yellow-300 font-instrument-sans rounded-lg text-sm">
                        No Downloads Left
                      </span>
                    ) : (
                      <a
                        href={sample.downloadUrl}
                        className="px-6 py-2 bg-white text-black font-instrument-sans font-medium rounded-lg hover:bg-gray-100 transition"
                      >
                        Download ({getRemainingDownloads(sample)} left)
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Link
            href="/samples"
            className="bg-white text-black rounded-lg p-6 text-center hover:bg-gray-100 transition"
          >
            <h3 className="font-anton text-black text-xl mb-2">
              Browse More Samples
            </h3>
            <p className="font-instrument-sans text-gray-700">
              Discover new beats and sounds
            </p>
          </Link>

          <Link
            href="/producers"
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center hover:bg-gray-800 transition"
          >
            <h3 className="font-anton text-white text-xl mb-2">
              Follow Producers
            </h3>
            <p className="font-instrument-sans text-gray-300">
              Stay updated with your favorite artists
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
