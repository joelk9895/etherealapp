"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditSamplePage() {
  const params = useParams();
  const sampleId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    bpm: "",
    key: "",
    price: "",
    tags: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const categories = [
    "Techno",
    "House",
    "Trance",
    "Ambient",
    "Drum & Bass",
    "Dubstep",
    "Progressive",
    "Minimal",
    "Deep House",
    "Tech House",
  ];

  const keys = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  useEffect(() => {
    checkAuth();
    fetchSample();
  }, [sampleId]);

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
          alert("Only producers can edit samples");
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

  const fetchSample = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/samples/${sampleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const sampleData = data.sample;

        // Check if user owns this sample
        if (sampleData.producerId !== user?.id) {
          alert("You can only edit your own samples");
          window.location.href = "/producer-dashboard";
          return;
        }

        setFormData({
          title: sampleData.title,
          description: sampleData.description || "",
          category: sampleData.category,
          bpm: sampleData.bpm?.toString() || "",
          key: sampleData.key || "",
          price: sampleData.price?.toString() || "",
          tags: sampleData.tags?.join(", ") || "",
        });
      } else {
        alert("Sample not found");
        window.location.href = "/producer-dashboard";
      }
    } catch (error) {
      console.error("Error fetching sample:", error);
      alert("Failed to load sample");
      window.location.href = "/producer-dashboard";
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const updateData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        category: formData.category,
        bpm: formData.bpm ? parseInt(formData.bpm) : null,
        key: formData.key || null,
        price: parseFloat(formData.price),
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : [],
      };

      const response = await fetch(`/api/samples/${sampleId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Sample updated successfully!");
        window.location.href = "/producer-dashboard";
      } else {
        alert(data.error || "Failed to update sample");
      }
    } catch (error) {
      console.error("Error updating sample:", error);
      alert("Failed to update sample");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              EtherealTechno
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/samples"
                className="text-gray-300 hover:text-white transition"
              >
                Browse Samples
              </Link>
              <Link
                href="/producer-dashboard"
                className="text-gray-300 hover:text-white transition"
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className="text-gray-300 hover:text-white transition"
              >
                Upload
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Edit Sample</h1>
          <p className="text-gray-300 text-lg">
            Update your sample information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Sample Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Enter sample title"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-800">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">BPM</label>
                <input
                  type="number"
                  value={formData.bpm}
                  onChange={(e) =>
                    setFormData({ ...formData, bpm: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="120"
                  min="60"
                  max="200"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Key</label>
                <select
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select key</option>
                  {keys.map((key) => (
                    <option key={key} value={key} className="bg-gray-800">
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Price (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="9.99"
                  min="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="dark, atmospheric, minimal"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-white mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                placeholder="Describe your sample..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Link
              href="/producer-dashboard"
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-12 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                "Update Sample"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
