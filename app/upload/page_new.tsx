"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [contentType, setContentType] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    tags: "",
    bpm: "",
    key: "",
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

  const contentTypes = [
    { id: "sample-one-shot", label: "Sample One-Shot", icon: "🎵" },
    { id: "sample-loop", label: "Sample Loop", icon: "🔄" },
    { id: "sample-loop-midi", label: "Sample Loop+MIDI", icon: "🎹" },
    { id: "midi", label: "MIDI", icon: "📝" },
    { id: "preset", label: "Preset", icon: "⚙️" },
    { id: "construction-kit", label: "Construction Kit", icon: "🔧" },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user.userType !== "producer") {
          alert("This page is only for producers");
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "audio" | "artwork"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "audio") {
      // Validate audio file
      if (!file.type.startsWith("audio/")) {
        alert("Please select a valid audio file");
        return;
      }
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    } else {
      // Validate image file
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      setArtworkFile(file);
      setArtworkPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile) {
      alert("Please select an audio file");
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("audio", audioFile);
      if (artworkFile) {
        formDataToSend.append("artwork", artworkFile);
      }
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("tags", formData.tags);
      formDataToSend.append("bpm", formData.bpm);
      formDataToSend.append("key", formData.key);
      formDataToSend.append("contentType", contentType);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/samples/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Sample uploaded successfully!");
        router.push("/producer-dashboard");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl font-instrument-sans">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="font-anton text-4xl text-white mb-4">
            Import Content
          </h1>
          <p className="font-instrument-sans text-gray-300 text-lg">
            Share your music with the world
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              <span className="font-instrument-sans text-sm font-medium">
                1
              </span>
            </div>
            <div
              className={`w-12 h-0.5 ${
                currentStep > 1 ? "bg-yellow-500" : "bg-gray-700"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              <span className="font-instrument-sans text-sm font-medium">
                2
              </span>
            </div>
            <div
              className={`w-12 h-0.5 ${
                currentStep > 2 ? "bg-yellow-500" : "bg-gray-700"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 3
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              <span className="font-instrument-sans text-sm font-medium">
                3
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          {/* Step 1: Content Type Selection */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="font-anton text-2xl text-white mb-2">
                  What type of content do you want to import?
                </h2>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="font-instrument-sans text-yellow-500 text-sm font-medium uppercase tracking-wide">
                    Content Type
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setContentType(type.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      contentType === type.id
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-gray-700 bg-gray-800 hover:border-gray-600"
                    }`}
                  >
                    <div className="text-2xl mb-3">{type.icon}</div>
                    <h3 className="font-instrument-sans text-white font-medium mb-1">
                      {type.label}
                    </h3>
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-4 ${
                        contentType === type.id
                          ? "border-yellow-500 bg-yellow-500"
                          : "border-gray-500"
                      }`}
                    >
                      {contentType === type.id && (
                        <div className="w-full h-full rounded-full bg-yellow-500"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => contentType && setCurrentStep(2)}
                  disabled={!contentType}
                  className={`px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors ${
                    contentType
                      ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: File Upload */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="font-anton text-2xl text-white mb-2">
                  Upload Files
                </h2>
                <p className="font-instrument-sans text-gray-400">
                  Selected:{" "}
                  {contentTypes.find((t) => t.id === contentType)?.label}
                </p>
              </div>

              {/* Audio File Upload */}
              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                  Audio File *
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, "audio")}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label htmlFor="audio-upload" className="cursor-pointer">
                    <div className="text-gray-300">
                      {audioFile ? (
                        <div>
                          <p className="text-green-400 mb-2 font-instrument-sans">
                            ✓ {audioFile.name}
                          </p>
                          {audioPreview && (
                            <audio
                              controls
                              src={audioPreview}
                              className="mx-auto"
                            >
                              Your browser does not support the audio element.
                            </audio>
                          )}
                        </div>
                      ) : (
                        <div>
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
                          <p className="font-instrument-sans">
                            Click to upload audio file
                          </p>
                          <p className="font-instrument-sans text-sm text-gray-400 mt-1">
                            MP3, WAV, FLAC up to 100MB
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Artwork Upload */}
              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                  Artwork (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "artwork")}
                    className="hidden"
                    id="artwork-upload"
                  />
                  <label htmlFor="artwork-upload" className="cursor-pointer">
                    <div className="text-gray-300">
                      {artworkFile ? (
                        <div>
                          <p className="text-green-400 mb-2 font-instrument-sans">
                            ✓ {artworkFile.name}
                          </p>
                          {artworkPreview && (
                            <img
                              src={artworkPreview}
                              alt="Artwork preview"
                              className="mx-auto max-w-32 max-h-32 rounded"
                            />
                          )}
                        </div>
                      ) : (
                        <div>
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="font-instrument-sans">
                            Click to upload artwork
                          </p>
                          <p className="font-instrument-sans text-sm text-gray-400 mt-1">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 rounded-md font-instrument-sans font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => audioFile && setCurrentStep(3)}
                  disabled={!audioFile}
                  className={`px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors ${
                    audioFile
                      ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-6">
                <h2 className="font-anton text-2xl text-white mb-2">
                  Add Details
                </h2>
                <p className="font-instrument-sans text-gray-400">
                  Complete your upload with metadata
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-400 font-instrument-sans focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="Enter sample title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-400 font-instrument-sans focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    required
                    className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-3 text-white font-instrument-sans focus:outline-none focus:border-yellow-500 transition-colors"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">Select category</option>
                    <option value="techno">Techno</option>
                    <option value="house">House</option>
                    <option value="progressive">Progressive</option>
                    <option value="trance">Trance</option>
                    <option value="drum-bass">Drum & Bass</option>
                    <option value="dubstep">Dubstep</option>
                  </select>
                </div>

                <div>
                  <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                    Key
                  </label>
                  <select
                    className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-3 text-white font-instrument-sans focus:outline-none focus:border-yellow-500 transition-colors"
                    value={formData.key}
                    onChange={(e) =>
                      setFormData({ ...formData, key: e.target.value })
                    }
                  >
                    <option value="">Select key</option>
                    <option value="C">C</option>
                    <option value="C#">C#</option>
                    <option value="D">D</option>
                    <option value="D#">D#</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="F#">F#</option>
                    <option value="G">G</option>
                    <option value="G#">G#</option>
                    <option value="A">A</option>
                    <option value="A#">A#</option>
                    <option value="B">B</option>
                  </select>
                </div>

                <div>
                  <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                    BPM
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-400 font-instrument-sans focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="120"
                    value={formData.bpm}
                    onChange={(e) =>
                      setFormData({ ...formData, bpm: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-400 font-instrument-sans focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="electronic, dark, minimal (comma separated)"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-400 font-instrument-sans focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Describe your sample..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-md font-instrument-sans font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors ${
                    uploading
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-yellow-500 hover:bg-yellow-400 text-black"
                  }`}
                >
                  {uploading ? "Uploading..." : "Upload Sample"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
