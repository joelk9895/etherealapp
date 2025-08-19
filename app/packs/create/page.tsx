"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface Sample {
  id: string;
  title: string;
  duration: number;
  contentType: string;
  soundGroup: string;
  soundType: string;
  bpm?: number;
  key?: string;
  category: string;
  packId?: string | null;
}

const categories = [
  "Progressive House",
  "Deep House", 
  "Tech House",
  "Melodic Techno",
  "Progressive Techno",
  "Dark Techno",
  "Minimal Techno",
  "Industrial Techno"
];

const styleTags = [
  "driving", "hypnotic", "atmospheric", "melodic", "percussive", "bassline", 
  "lead", "pad", "arp", "fx", "vocal", "organic", "synthetic", "analog", "digital"
];

const moodTags = [
  "dark", "uplifting", "energetic", "chill", "mysterious", "euphoric", 
  "melancholic", "aggressive", "dreamy", "intense", "groovy", "emotional"
];

const processingTags = [
  "reverb", "delay", "distortion", "filter", "compression", "saturation",
  "chorus", "phaser", "flanger", "bitcrusher", "vinyl", "tape"
];

const soundDesignTags = [
  "layered", "textured", "punchy", "warm", "bright", "wide", "deep",
  "crisp", "smooth", "gritty", "clean", "processed", "raw"
];

export default function CreatePackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [packData, setPackData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    bpm: "",
    key: "",
    styleTags: [] as string[],
    moodTags: [] as string[],
    processingTags: [] as string[],
    soundDesignTags: [] as string[],
  });
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchUserSamples();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user.userType !== "producer") {
          router.push("/");
          return;
        }
        setUser(data.user);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSamples = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/samples/my-samples", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter samples that are not already in a pack
        const unpackedSamples = data.samples.filter((sample: Sample) => !sample.packId);
        setSamples(unpackedSamples);
      }
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  const handleSampleToggle = (sampleId: string) => {
    setSelectedSamples(prev => 
      prev.includes(sampleId) 
        ? prev.filter(id => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  const handleTagToggle = (tagType: 'styleTags' | 'moodTags' | 'processingTags' | 'soundDesignTags', tag: string) => {
    setPackData(prev => ({
      ...prev,
      [tagType]: prev[tagType].includes(tag)
        ? prev[tagType].filter(t => t !== tag)
        : [...prev[tagType], tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSamples.length === 0) {
      alert("Please select at least one sample for the pack");
      return;
    }
    if (!previewFile) {
      alert("Please upload a preview audio file");
      return;
    }

    setCreating(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Pack data
    Object.entries(packData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    });

    // Selected samples
    formData.append("selectedSamples", JSON.stringify(selectedSamples));

    // Files
    formData.append("previewFile", previewFile);
    if (artworkFile) {
      formData.append("artworkFile", artworkFile);
    }

    try {
      const response = await fetch("/api/packs/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/packs/${data.pack.id}`);
      } else {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        
        // Show a more detailed error message including any details the server provided
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || "Failed to create pack";
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error creating pack:", error);
      alert("Failed to create pack");
    } finally {
      setCreating(false);
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

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-anton text-4xl text-white mb-2">Create Pack</h1>
          <p className="font-instrument-sans text-gray-400">
            Group your samples into a sellable pack with a preview track
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Pack Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="font-anton text-2xl text-white mb-6">Pack Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-instrument-sans text-white mb-2">
                  Pack Title *
                </label>
                <input
                  type="text"
                  value={packData.title}
                  onChange={(e) => setPackData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                  placeholder="Enter pack title"
                  required
                />
              </div>

              <div>
                <label className="block font-instrument-sans text-white mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={packData.price}
                  onChange={(e) => setPackData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                  placeholder="9.99"
                  required
                />
              </div>

              <div>
                <label className="block font-instrument-sans text-white mb-2">
                  Category *
                </label>
                <select
                  value={packData.category}
                  onChange={(e) => setPackData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-instrument-sans text-white mb-2">
                  BPM
                </label>
                <input
                  type="number"
                  min="60"
                  max="200"
                  value={packData.bpm}
                  onChange={(e) => setPackData(prev => ({ ...prev, bpm: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                  placeholder="128"
                />
              </div>

              <div>
                <label className="block font-instrument-sans text-white mb-2">
                  Key
                </label>
                <input
                  type="text"
                  value={packData.key}
                  onChange={(e) => setPackData(prev => ({ ...prev, key: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                  placeholder="A minor"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block font-instrument-sans text-white mb-2">
                Description
              </label>
              <textarea
                value={packData.description}
                onChange={(e) => setPackData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                placeholder="Describe your pack..."
              />
            </div>
          </div>

          {/* Preview & Artwork Upload */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="font-anton text-2xl text-white mb-6">Media Files</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-instrument-sans text-white mb-2">
                  Preview Track * (Song made using this pack)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  Upload a demo track showcasing how the pack sounds
                </p>
              </div>

              <div>
                <label className="block font-instrument-sans text-white mb-2">
                  Pack Artwork (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setArtworkFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Square format recommended (1000x1000px)
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="font-anton text-2xl text-white mb-6">Tags</h2>
            
            <div className="space-y-6">
              {/* Style Tags */}
              <div>
                <label className="block font-instrument-sans text-white mb-3">Style Tags</label>
                <div className="flex flex-wrap gap-2">
                  {styleTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle('styleTags', tag)}
                      className={`px-3 py-1 rounded-full text-sm font-instrument-sans transition-colors ${
                        packData.styleTags.includes(tag)
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Tags */}
              <div>
                <label className="block font-instrument-sans text-white mb-3">Mood Tags</label>
                <div className="flex flex-wrap gap-2">
                  {moodTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle('moodTags', tag)}
                      className={`px-3 py-1 rounded-full text-sm font-instrument-sans transition-colors ${
                        packData.moodTags.includes(tag)
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Processing Tags */}
              <div>
                <label className="block font-instrument-sans text-white mb-3">Processing Tags</label>
                <div className="flex flex-wrap gap-2">
                  {processingTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle('processingTags', tag)}
                      className={`px-3 py-1 rounded-full text-sm font-instrument-sans transition-colors ${
                        packData.processingTags.includes(tag)
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Design Tags */}
              <div>
                <label className="block font-instrument-sans text-white mb-3">Sound Design Tags</label>
                <div className="flex flex-wrap gap-2">
                  {soundDesignTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle('soundDesignTags', tag)}
                      className={`px-3 py-1 rounded-full text-sm font-instrument-sans transition-colors ${
                        packData.soundDesignTags.includes(tag)
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sample Selection */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="font-anton text-2xl text-white mb-6">
              Select Samples ({selectedSamples.length} selected)
            </h2>
            
            {samples.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-instrument-sans text-gray-400">
                  No available samples. Upload some samples first to create a pack.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samples.map(sample => (
                  <div
                    key={sample.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSamples.includes(sample.id)
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                    onClick={() => handleSampleToggle(sample.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-instrument-sans text-white font-medium text-sm">
                        {sample.title}
                      </h3>
                      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 ${
                        selectedSamples.includes(sample.id)
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'border-gray-500'
                      }`}>
                        {selectedSamples.includes(sample.id) && (
                          <svg className="w-full h-full text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{sample.contentType}</span>
                        <span className="text-gray-400">{formatDuration(sample.duration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{sample.soundGroup}</span>
                        {sample.bpm && <span className="text-gray-400">{sample.bpm} BPM</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-instrument-sans transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || selectedSamples.length === 0 || !previewFile}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-instrument-sans font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating Pack..." : "Create Pack"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
