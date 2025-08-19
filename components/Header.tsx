"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const { cartItems, fetchCart, getItemCount } = useCart();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="bg-gray-950 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-anton text-2xl tracking-wide text-white"
          >
            ETHEREAL TECHNO
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/packs"
              className="font-instrument-sans text-sm text-white hover:text-gray-300 transition-colors"
            >
              Browse Packs
            </Link>
            <Link
              href="/producers"
              className="font-instrument-sans text-sm text-white hover:text-gray-300 transition-colors"
            >
              Producers
            </Link>

            {/* Producer-specific navigation */}
            {user?.userType === "producer" && (
              <>
                <Link
                  href="/producer-dashboard"
                  className="font-instrument-sans text-sm text-white hover:text-gray-300 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/upload"
                  className="font-instrument-sans text-sm text-white hover:text-gray-300 transition-colors"
                >
                  Upload Samples
                </Link>
                <Link
                  href="/packs/create"
                  className="font-instrument-sans text-sm text-white hover:text-gray-300 transition-colors"
                >
                  Create Pack
                </Link>
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.7 8.3a1 1 0 001 1.2h9.4a1 1 0 001-1.2L15 13H7z"
                />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-instrument-sans font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="font-instrument-sans text-sm text-gray-400">
                Loading...
              </div>
            ) : user ? (
              <div className="relative">
                {/* Account Dropdown */}
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
                >
                  <span className="font-instrument-sans text-sm">Account</span>
                  <svg
                    className={`w-3 h-3 transform transition-transform ${
                      isAccountMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-black border border-gray-800 shadow-xl z-[1000]">
                    <div className="p-6 border-b border-gray-800">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <span className="font-anton text-black text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-instrument-sans font-medium text-white text-base">
                            {user.name}
                          </p>
                          <p className="font-instrument-sans text-gray-400 text-sm">
                            {user.email}
                          </p>
                          {user.userType === "producer" && (
                            <span className="inline-block mt-2 px-3 py-1 bg-white text-black font-instrument-sans text-xs font-medium">
                              PRODUCER
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      {user.userType === "buyer" && (
                        <Link
                          href="/dashboard"
                          className="block px-6 py-3 font-instrument-sans text-sm text-white hover:bg-gray-900 transition-colors"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          My Purchases
                        </Link>
                      )}
                      {user.userType === "producer" && (
                        <>
                          <Link
                            href="/producer-dashboard"
                            className="block px-6 py-3 font-instrument-sans text-sm text-white hover:bg-gray-900 transition-colors"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href={`/producers/${user.id}`}
                            className="block px-6 py-3 font-instrument-sans text-sm text-white hover:bg-gray-900 transition-colors"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            Public Profile
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-800 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            handleLogout();
                          }}
                          className="block w-full text-left px-6 py-3 font-instrument-sans text-sm text-white hover:bg-gray-900 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="font-instrument-sans text-sm text-white hover:text-gray-300 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-black px-4 py-2 font-instrument-sans text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isAccountMenuOpen && (
        <div
          className="fixed inset-0 z-[999]"
          onClick={() => setIsAccountMenuOpen(false)}
        />
      )}
    </header>
  );
}
