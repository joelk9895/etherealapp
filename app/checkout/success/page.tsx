"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

interface PurchasedSample {
  sampleId: string;
  sampleTitle: string;
  producer: string;
  downloadUrl: string;
}

export default function CheckoutSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [purchasedSamples, setPurchasedSamples] = useState<PurchasedSample[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!sessionId || !orderId) {
      setError("Missing session or order information");
      setLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [sessionId, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(
        `/api/orders/${orderId}?session_id=${sessionId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrderData(data.order);
      setPurchasedSamples(data.purchasedSamples || []);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const sendDownloadLinks = async () => {
    if (!email || !orderId) return;

    setSendingEmail(true);
    try {
      const response = await fetch("/api/send-download-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmailSent(true);
        console.log("Download links response:", data);
        // In production, this would confirm email was sent
      } else {
        throw new Error("Failed to prepare download links");
      }
    } catch (error) {
      console.error("Error sending download links:", error);
      alert("Failed to prepare download links. Please contact support.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="font-instrument-sans text-white">
              Processing your order...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-8">
            <h1 className="font-anton text-3xl text-red-400 mb-4">
              Payment Error
            </h1>
            <p className="font-instrument-sans text-gray-300 mb-8">{error}</p>
            <Link
              href="/cart"
              className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors"
            >
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-anton text-4xl text-white mb-4">
            Payment Successful!
          </h1>
          <p className="font-instrument-sans text-gray-300 text-lg">
            Thank you for your purchase. Your samples are ready for download.
          </p>
        </div>

        {/* Order Summary */}
        {orderData && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="font-anton text-2xl text-white mb-4">
              Order Summary
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-instrument-sans text-gray-400">
                  Order ID:
                </span>
                <span className="font-instrument-sans text-white ml-2">
                  {orderData.id}
                </span>
              </div>
              <div>
                <span className="font-instrument-sans text-gray-400">
                  Total:
                </span>
                <span className="font-instrument-sans text-white ml-2">
                  ${orderData.total.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="font-instrument-sans text-gray-400">
                  Date:
                </span>
                <span className="font-instrument-sans text-white ml-2">
                  {new Date(orderData.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-instrument-sans text-gray-400">
                  Status:
                </span>
                <span className="font-instrument-sans text-green-400 ml-2">
                  {orderData.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Downloaded Samples */}
        {purchasedSamples.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="font-anton text-2xl text-white mb-6">
              Your Downloads
            </h2>
            <div className="space-y-4">
              {purchasedSamples.map((sample) => (
                <div
                  key={sample.sampleId}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div>
                    <h3 className="font-instrument-sans font-semibold text-white">
                      {sample.sampleTitle}
                    </h3>
                    <p className="font-instrument-sans text-gray-400 text-sm">
                      by {sample.producer}
                    </p>
                  </div>
                  <a
                    href={sample.downloadUrl}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-md font-instrument-sans font-medium transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Collection for Guest Users */}
        {orderData && !orderData.userId && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 mb-8">
            <h2 className="font-anton text-2xl text-white mb-4">
              {emailSent
                ? "Download Links Prepared!"
                : "Get Your Download Links"}
            </h2>
            {!emailSent ? (
              <>
                <p className="font-instrument-sans text-gray-300 mb-4">
                  Enter your email address to access your purchased samples:
                </p>
                <div className="flex gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={sendDownloadLinks}
                    disabled={!email || sendingEmail}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md font-instrument-sans font-medium transition-colors"
                  >
                    {sendingEmail ? "Preparing..." : "Get Links"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="font-instrument-sans text-green-400 mb-4">
                  Your download links have been prepared for:{" "}
                  <strong>{email}</strong>
                </p>
                <p className="font-instrument-sans text-gray-300 text-sm">
                  In a production environment, these would be sent to your
                  email.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Account Creation CTA for Guest Users */}
        {orderData && !orderData.userId && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8 text-center">
            <h2 className="font-anton text-2xl text-white mb-4">
              Save Your Purchases
            </h2>
            <p className="font-instrument-sans text-gray-300 mb-6">
              Create an account to automatically save all your purchases and
              access them anytime.
            </p>
            <Link
              href="/register"
              className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors"
            >
              Create Account
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="text-center space-x-4">
          <Link
            href="/dashboard"
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors"
          >
            View My Library
          </Link>
          <Link
            href="/samples"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors"
          >
            Browse More Samples
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="font-instrument-sans text-gray-400 text-sm mb-2">
            Your downloads are available for 1 year and can be downloaded up to
            10 times.
          </p>
          <p className="font-instrument-sans text-gray-400 text-sm">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@etherealtechno.com"
              className="text-yellow-500 hover:text-yellow-400"
            >
              support@etherealtechno.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
