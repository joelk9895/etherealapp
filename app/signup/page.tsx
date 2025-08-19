"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "buyer", // 'buyer' or 'producer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and redirect based on user type
        localStorage.setItem("token", data.token);
        if (formData.userType === "producer") {
          router.push("/dashboard/producer");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white">
            EtherealTechno
          </Link>
          <p className="text-gray-300 mt-2">Create your account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Account Type Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-3">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, userType: "buyer" })
                  }
                  className={`p-4 rounded-lg border text-center transition-all ${
                    formData.userType === "buyer"
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <div className="text-2xl mb-2">🎧</div>
                  <div className="text-sm font-medium">Buy Samples</div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, userType: "producer" })
                  }
                  className={`p-4 rounded-lg border text-center transition-all ${
                    formData.userType === "producer"
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <div className="text-2xl mb-2">🎵</div>
                  <div className="text-sm font-medium">Sell Samples</div>
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-white text-sm font-medium mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full bg-black/20 border border-white/30 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-white text-sm font-medium mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full bg-black/20 border border-white/30 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-white text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="w-full bg-black/20 border border-white/30 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-white text-sm font-medium mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full bg-black/20 border border-white/30 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-purple-600 bg-black/20 border-white/30 rounded focus:ring-purple-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-400 bg-transparent">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Social Signup */}
          <button
            onClick={handleGoogleSignup}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
