"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import Header from "@/components/Header";

export default function CartPage() {
  const {
    cartItems,
    loading,
    fetchCart,
    removeItem,
    getCartTotal,
    isAuthenticated,
  } = useCart();
  const { toasts, removeToast, error: showError } = useToast();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemoveItem = async (itemId: string, itemTitle: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      showError(`Failed to remove "${itemTitle}" from cart. Please try again.`);
    }
  };

  const proceedToCheckout = async () => {
    // If user is not authenticated, show email modal first
    if (!isAuthenticated) {
      setShowEmailModal(true);
      return;
    }

    await handleCheckout();
  };

  const handleCheckout = async (customerEmail?: string) => {
    try {
      setEmailLoading(true);
      // For authenticated users, include token in headers
      const headers: any = { "Content-Type": "application/json" };
      const token = localStorage.getItem("token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const requestBody: any = { cartItems };
      if (customerEmail) {
        requestBody.customerEmail = customerEmail;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        console.error("No checkout URL received:", data);
        showError("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Error proceeding to checkout:", error);
      showError("Failed to proceed to checkout. Please try again.");
    } finally {
      setEmailLoading(false);
      setShowEmailModal(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) {
      showError("Please enter a valid email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      showError("Please enter a valid email address.");
      return;
    }

    await handleCheckout(guestEmail);
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <Header />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-anton text-4xl text-white mb-8">Shopping Cart</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="font-instrument-sans text-white mt-4">
              Loading cart...
            </p>
          </div>
        ) : cartItems.length === 0 ? (
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.7 8.3a1 1 0 001 1.2h9.4a1 1 0 001-1.2L15 13H7z"
              />
            </svg>
            <h2 className="font-anton text-2xl text-white mb-4">
              Your cart is empty
            </h2>
            <p className="font-instrument-sans text-gray-300 mb-8">
              Discover amazing music samples to add to your collection
            </p>
            <Link
              href="/samples"
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-lg font-instrument-sans font-medium transition-colors"
            >
              Browse Samples
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="font-anton text-2xl text-white mb-6">
                  Cart Items ({cartItems.length})
                </h2>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-950 border border-gray-800 rounded-lg"
                    >
                      {/* Sample preview */}
                      <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
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
                      </div>

                      {/* Item details */}
                      <div className="flex-1">
                        <h3 className="font-anton text-white">{item.title}</h3>
                        <p className="font-instrument-sans text-gray-300">
                          By {item.producer}
                        </p>
                        <p className="font-anton text-lg text-white">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveItem(item.id, item.title)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors font-instrument-sans font-medium flex items-center gap-2"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-8">
                <h2 className="font-anton text-2xl text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between font-instrument-sans text-white">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-instrument-sans text-white">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex justify-between font-anton text-xl text-white">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-lg font-instrument-sans font-semibold transition-colors"
                  disabled={emailLoading}
                >
                  {emailLoading ? "Processing..." : "Proceed to Checkout"}
                </button>

                <Link
                  href="/samples"
                  className="block w-full text-center font-instrument-sans text-gray-300 hover:text-white mt-4 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guest Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="font-anton text-2xl text-white mb-4">
              Enter Your Email
            </h2>
            <p className="font-instrument-sans text-gray-300 mb-6">
              We need your email address to send you the download links after
              payment.
            </p>

            <form onSubmit={handleEmailSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="guest-email"
                  className="block font-instrument-sans text-white mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="guest-email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="your.email@example.com"
                  required
                  disabled={emailLoading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setGuestEmail("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-instrument-sans transition-colors"
                  disabled={emailLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-instrument-sans font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={emailLoading || !guestEmail.trim()}
                >
                  {emailLoading ? "Processing..." : "Continue to Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
