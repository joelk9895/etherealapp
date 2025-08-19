"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface ImportedFile {
  id: string;
  name: string;
  duration: number;
  waveform: number[];
}

export default function ImportPage() {
  const router = useRouter();
  const [contentType, setContentType] = useState("sample-one-shot");
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([
    {
      id: "1",
      name: "11_Bass_One_Shot_Square_010s",
      duration: 1.5,
      waveform: Array.from({ length: 100 }, () => Math.random() * 100),
    },
    {
      id: "2",
      name: "11_Bass_One_Shot_Square_010s",
      duration: 1.5,
      waveform: Array.from({ length: 100 }, () => Math.random() * 100),
    },
    {
      id: "3",
      name: "11_Bass_One_Shot_Square_010s",
      duration: 1.5,
      waveform: Array.from({ length: 100 }, () => Math.random() * 100),
    },
    {
      id: "4",
      name: "11_Bass_One_Shot_Square_010s",
      duration: 1.5,
      waveform: Array.from({ length: 100 }, () => Math.random() * 100),
    },
  ]);

  const [currentName, setCurrentName] = useState("Ambient");
  const [bpm, setBpm] = useState("120");
  const [key, setKey] = useState("C# min");
  const [soundType, setSoundType] = useState("Pad");

  // Style tags
  const styleTags = [
    "Cinematic",
    "Dark",
    "Deep",
    "Ethereal",
    "Groovy",
    "Hypnotic",
    "Organic",
    "Raw",
    "Organic",
    "Orchestral",
    "Raw",
    "Ritualistic",
    "System",
    "Tribal",
    "Uplifting",
    "Vintage",
  ];

  // Mood tags
  const moodTags = [
    "Cold",
    "Depressed",
    "Dreamy",
    "Emotional",
    "Epic",
    "Euphoric",
    "Hopeful",
    "Introspective",
    "Uplifting",
    "Mysterious",
    "Nostalgic",
    "Romantic",
    "Spiritual",
    "Tense",
    "Warm",
  ];

  // Processing tags
  const processingTags = [
    "Unmastered",
    "Compressed",
    "Delay",
    "Distorted",
    "Dry",
    "Filtered",
    "Gritty",
    "Impact",
    "Modulated",
    "Percussion",
    "Reverb",
    "Reverb",
    "Synthesizer",
    "Scratched",
    "Tape",
  ];

  // Sound design tags
  const soundDesignTags = [
    "Ambient",
    "Analog",
    "Digital",
    "Field Recording",
    "FM Synthesis",
    "Granular",
    "Hybrid",
    "Modular",
    "Physical Modeling",
    "Percussion",
    "Sampler",
    "Sampler Mado",
    "Spectral",
    "Vocationist",
    "Wavetable",
  ];

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

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
        }
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/login");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const togglePlay = (fileId: string) => {
    setCurrentlyPlaying(currentlyPlaying === fileId ? null : fileId);
  };

  const handleImport = () => {
    console.log("Importing files...");
    // Handle import logic here
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Import Content */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="font-anton text-2xl text-white mb-6">
              Import Content
            </h2>

            {/* Content Type Selector */}
            <div className="mb-6">
              <label className="block font-instrument-sans text-white text-sm font-medium mb-3">
                Content Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setContentType("sample-one-shot")}
                  className={`px-4 py-2 rounded-md font-instrument-sans text-sm transition-colors ${
                    contentType === "sample-one-shot"
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Sample One-Shot
                </button>
                <button
                  onClick={() => setContentType("sample-loop")}
                  className={`px-4 py-2 rounded-md font-instrument-sans text-sm transition-colors ${
                    contentType === "sample-loop"
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Sample Loop
                </button>
                <button
                  onClick={() => setContentType("sample-construction")}
                  className={`px-4 py-2 rounded-md font-instrument-sans text-sm transition-colors ${
                    contentType === "sample-construction"
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Sample/Construction Kit
                </button>
                <button
                  onClick={() => setContentType("midi")}
                  className={`px-4 py-2 rounded-md font-instrument-sans text-sm transition-colors ${
                    contentType === "midi"
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  MIDI
                </button>
                <button
                  onClick={() => setContentType("preset")}
                  className={`px-4 py-2 rounded-md font-instrument-sans text-sm transition-colors ${
                    contentType === "preset"
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Preset
                </button>
                <button
                  onClick={() => setContentType("construction-kit")}
                  className={`px-4 py-2 rounded-md font-instrument-sans text-sm transition-colors ${
                    contentType === "construction-kit"
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Construction Kit
                </button>
              </div>
            </div>

            {/* File Drop Area */}
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center mb-6 hover:border-gray-600 transition-colors">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto mb-4"
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
              </div>
              <p className="font-instrument-sans text-white mb-1">
                Drag and drop files or browse
              </p>
              <p className="font-instrument-sans text-gray-400 text-sm">
                Play Loop
              </p>
            </div>

            {/* Current Settings */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                  Current Name
                </label>
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white font-instrument-sans focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                  BPM
                </label>
                <input
                  type="text"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white font-instrument-sans focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                  Key
                </label>
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white font-instrument-sans focus:border-yellow-500 focus:outline-none"
                >
                  <option value="C# min">C# min</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                  Sound Type
                </label>
                <select
                  value={soundType}
                  onChange={(e) => setSoundType(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white font-instrument-sans focus:border-yellow-500 focus:outline-none"
                >
                  <option value="Pad">Pad</option>
                  <option value="Bass">Bass</option>
                  <option value="Lead">Lead</option>
                  <option value="Chord">Chord</option>
                  <option value="Drone">Drone</option>
                  <option value="Stab">Stab</option>
                </select>
              </div>
            </div>

            {/* Tags Sections */}
            <div className="space-y-6">
              {/* Style Tags */}
              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-3">
                  Style
                </label>
                <div className="flex flex-wrap gap-2">
                  {styleTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-md text-xs font-instrument-sans transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Tags */}
              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-3">
                  Mood
                </label>
                <div className="flex flex-wrap gap-2">
                  {moodTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-md text-xs font-instrument-sans transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Processing Tags */}
              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-3">
                  Processing
                </label>
                <div className="flex flex-wrap gap-2">
                  {processingTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-md text-xs font-instrument-sans transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Design Tags */}
              <div>
                <label className="block font-instrument-sans text-white text-sm font-medium mb-3">
                  Sound Design
                </label>
                <div className="flex flex-wrap gap-2">
                  {soundDesignTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-md text-xs font-instrument-sans transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Copyright Notice */}
            <div className="mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 rounded" />
                <span className="font-instrument-sans text-gray-400 text-sm">
                  I confirm this content is original and does not contain any
                  copyrighted material
                </span>
              </label>
            </div>

            {/* Import Button */}
            <button
              onClick={handleImport}
              className="w-full mt-6 bg-teal-600 hover:bg-teal-500 text-white font-instrument-sans font-medium py-3 rounded-md transition-colors"
            >
              Import & Tag
            </button>
          </div>

          {/* Right Panel - Imported Content */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="font-anton text-2xl text-white mb-6">
              Imported Content
            </h2>

            <div className="space-y-4">
              {importedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-gray-950 border border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-instrument-sans text-white text-sm">
                      {file.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-instrument-sans text-gray-400 text-xs">
                        Play Loop
                      </span>
                      <button className="text-gray-400 hover:text-white">
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
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-white">
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
                      </button>
                    </div>
                  </div>

                  {/* Waveform */}
                  <div className="relative h-16 bg-gray-900 rounded-md mb-3 overflow-hidden">
                    <div className="absolute inset-0 flex items-end justify-center gap-0.5 px-2">
                      {file.waveform.map((height, i) => (
                        <div
                          key={i}
                          className="bg-teal-400 w-1"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => togglePlay(file.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-white/10 group-hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        {currentlyPlaying === file.id ? (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-white ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-instrument-sans text-gray-400">
                      {file.name}
                    </span>
                    <span className="font-instrument-sans text-gray-400">
                      Play Loop
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
