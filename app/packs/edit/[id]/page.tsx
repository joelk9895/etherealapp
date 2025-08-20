"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditPackPage() {
  const router = useRouter();
  const params = useParams();
  const packId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [packLoading, setPackLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [allPackSamples, setAllPackSamples] = useState<Sample[]>([]);
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
    previewUrl: "",
    artworkUrl: ""
  });
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch pack data and samples after authentication
  useEffect(() => {
    if (user) {
      fetchPack();
      fetchUserSamples();
    }
  }, [user, packId]);

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

  const fetchPack = async () => {
    setPackLoading(true);
    try {
      const response = await fetch(`/api/packs/${packId}`);
      if (!response.ok) {
        throw new Error("Pack not found");
      }
      const data = await response.json();
      const pack = data.pack;
      
      // Check if current user is the producer of this pack
      if (user.id !== pack.producer.id) {
        router.push("/packs");
        return;
      }

      // Set pack data
      setPackData({
        title: pack.title || "",
        description: pack.description || "",
        price: pack.price.toString() || "",
        category: pack.category || "",
        bpm: pack.bpm ? pack.bpm.toString() : "",
        key: pack.key || "",
        styleTags: pack.styleTags || [],
        moodTags: pack.moodTags || [],
        processingTags: pack.processingTags || [],
        soundDesignTags: pack.soundDesignTags || [],
        previewUrl: pack.previewUrl || "",
        artworkUrl: pack.artworkUrl || ""
      });

      // Set selected samples
      if (pack.samples && Array.isArray(pack.samples)) {
        const sampleIds = pack.samples.map((sample: any) => sample.id);
        setSelectedSamples(sampleIds);
        setAllPackSamples(pack.samples);
      }
    } catch (error) {
      console.error("Error fetching pack:", error);
      alert("Failed to load pack data");
      router.push("/packs");
    } finally {
      setPackLoading(false);
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
        // Include both unassigned samples and samples that belong to this pack
        const availableSamples = data.samples.filter((sample: Sample) => 
          !sample.packId || sample.packId === packId
        );
        setSamples(availableSamples);
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

    setUpdating(true);
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

    // Pack ID
    formData.append("packId", packId);

    // Files - only append if new files were selected
    if (previewFile) {
      formData.append("previewFile", previewFile);
    }
    
    if (artworkFile) {
      formData.append("artworkFile", artworkFile);
    }

    try {
      const response = await fetch(`/api/packs/edit/${packId}`, {
        method: "PUT",
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
          : errorData.error || "Failed to update pack";
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error updating pack:", error);
      alert("Failed to update pack");
    } finally {
      setUpdating(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading || packLoading) {
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
          <h1 className="font-anton text-4xl text-white mb-2">Edit Pack</h1>
          <p className="font-instrument-sans text-gray-400">
            Update your sample pack details and content
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
                  Preview Track (Current or New)
                </label>
                {packData.previewUrl && (
                  <div className="mb-2">
                    <audio
                      src={packData.previewUrl}
                      controls
                      className="w-full mb-2"
                    />
                    <p className="text-xs text-gray-400">Current preview track</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                />
                <p className="text-gray-400 text-sm mt-1">
                  {packData.previewUrl 
                    ? "Upload a new file only if you want to replace the current preview" 
                    : "Upload a demo track showcasing how the pack sounds"}
                </p>
              </div>

              <div>
                <label className="block font-instrument-sans text-white mb-2">
                  Pack Artwork
                </label>
                {packData.artworkUrl && (
                  <div className="mb-2">
                    <img 
                      src={packData.artworkUrl} 
                      alt="Pack artwork" 
                      className="w-32 h-32 object-cover rounded-lg mb-2"
                    />
                    <p className="text-xs text-gray-400">Current artwork</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setArtworkFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-instrument-sans focus:outline-none focus:border-yellow-500"
                />
                <p className="text-gray-400 text-sm mt-1">
                  {packData.artworkUrl 
                    ? "Upload a new file only if you want to replace the current artwork" 
                    : "Square format recommended (1000x1000px)"}
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
                {samples && samples.length > 0 ? samples.map(sample => (
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
                )) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="font-instrument-sans text-gray-400">No available samples to select.</p>
                  </div>
                )}
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
              disabled={updating || selectedSamples.length === 0}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-instrument-sans font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Updating Pack..." : "Update Pack"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
