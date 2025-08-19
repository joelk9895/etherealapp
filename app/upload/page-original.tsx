"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
}

interface ImportedFile {
  id: string;
  name: string;
  duration: number;
  waveform: number[];
  file: File;
}

export default function UploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"single" | "batch">("single");
  const [currentStep, setCurrentStep] = useState(1);
  const [contentType, setContentType] = useState("");
  const [soundGroup, setSoundGroup] = useState("");
  const [soundType, setSoundType] = useState("");

  // Batch import state
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [batchMetadata, setBatchMetadata] = useState({
    name: "Ambient",
    bpm: "120",
    key: "C#min",
    soundType: "Pad",
  });

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

  const soundGroups = [
    { id: "melodic-harmonic", label: "Melodic & Harmonic Element", icon: "🎶" },
    { id: "drums-percussion", label: "Drums & Percussion", icon: "🥁" },
    { id: "atmospheric-fx", label: "Atmospheric & FX Content", icon: "🌊" },
    { id: "vocals", label: "Vocals", icon: "🎤" },
  ];

  // MIDI sound types (for melodic MIDI files only)
  const getMidiSoundTypes = (): Array<{ id: string; label: string; description: string; icon: string }> => {
    return [
      { id: "arp", label: "Arp", description: "Arpeggiated MIDI sequences", icon: "🎵" },
      { id: "bass", label: "Bass", description: "Low-frequency MIDI foundation", icon: "🎵" },
      { id: "bell", label: "Bell", description: "Metallic tonal MIDI", icon: "🔔" },
      { id: "chord", label: "Chord", description: "Harmonic MIDI progressions", icon: "🎹" },
      { id: "drone", label: "Drone", description: "Sustained continuous MIDI tones", icon: "〰️" },
      { id: "lead", label: "Lead", description: "Melodic lead MIDI", icon: "🎸" },
      { id: "pad", label: "Pad", description: "Atmospheric sustained MIDI", icon: "🌊" },
      { id: "piano", label: "Piano", description: "Piano MIDI patterns", icon: "🎹" },
      { id: "pluck", label: "Pluck", description: "Short melodic MIDI attacks", icon: "🪕" },
      { id: "riser", label: "Riser", description: "Building tension MIDI", icon: "📈" },
      { id: "stab", label: "Stab", description: "Sharp melodic MIDI accents", icon: "⚡" },
      { id: "sub", label: "Sub", description: "Sub-bass frequency MIDI", icon: "🔈" },
      { id: "sub-drop", label: "Sub Drop", description: "Low-frequency MIDI drops", icon: "⬇️" },
      { id: "sweep", label: "Sweep", description: "Frequency sweep MIDI effects", icon: "🌪️" },
      { id: "synth", label: "Synth", description: "Electronic synthesized MIDI", icon: "🔊" },
      { id: "tonal-fx", label: "Tonal Fx", description: "Tonal effect MIDI", icon: "🎭" },
    ];
  };

  // Sound types for each sound group - dynamically generated based on content type
  const getSoundTypes = (contentType: string): Record<string, Array<{ id: string; label: string; description: string; icon: string }>> => {
    const isLoop = contentType === "sample-loop" || contentType === "sample-loop-midi";
    
    return {
      "melodic-harmonic": [
        {
          id: isLoop ? "arp-loop" : "arp",
          label: isLoop ? "Arp Loop" : "Arp",
          description: isLoop ? "Arpeggiated loop patterns" : "Arpeggiated sequences",
          icon: "🎵",
        },
        {
          id: isLoop ? "bass-loop" : "bass",
          label: isLoop ? "Bass Loop" : "Bass",
          description: isLoop ? "Low-frequency foundation loops" : "Low-frequency foundation sounds",
          icon: "🎵",
        },
        {
          id: isLoop ? "bell-loop" : "bell",
          label: isLoop ? "Bell Loop" : "Bell",
          description: isLoop ? "Metallic tonal loops" : "Metallic tonal sounds",
          icon: "🔔",
        },
        {
          id: isLoop ? "chord-loop" : "chord",
          label: isLoop ? "Chord Loop" : "Chord",
          description: isLoop ? "Harmonic progression loops" : "Harmonic progressions",
          icon: "🎹",
        },
        {
          id: isLoop ? "drone-loop" : "drone",
          label: isLoop ? "Drone Loop" : "Drone",
          description: isLoop ? "Sustained continuous tone loops" : "Sustained continuous tones",
          icon: "〰️",
        },
        {
          id: isLoop ? "lead-loop" : "lead",
          label: isLoop ? "Lead Loop" : "Lead",
          description: isLoop ? "Melodic lead loops" : "Melodic lead sounds",
          icon: "🎸",
        },
        {
          id: isLoop ? "pad-loop" : "pad",
          label: isLoop ? "Pad Loop" : "Pad",
          description: isLoop ? "Atmospheric sustained loops" : "Atmospheric sustained sounds",
          icon: "🌊",
        },
        ...(isLoop ? [{
          id: "piano-loop",
          label: "Piano Loop",
          description: "Piano loop patterns",
          icon: "🎹",
        }] : []),
        {
          id: isLoop ? "pluck-loop" : "pluck",
          label: isLoop ? "Pluck Loop" : "Pluck",
          description: isLoop ? "Short melodic attack loops" : "Short melodic attacks",
          icon: "🪕",
        },
        {
          id: isLoop ? "stab-loop" : "stab",
          label: isLoop ? "Stab Loop" : "Stab",
          description: isLoop ? "Sharp melodic accent loops" : "Sharp melodic accents",
          icon: "⚡",
        },
        {
          id: isLoop ? "sub-loop" : "sub",
          label: isLoop ? "Sub Loop" : "Sub",
          description: isLoop ? "Sub-bass frequency loops" : "Sub-bass frequencies",
          icon: "🔈",
        },
        {
          id: isLoop ? "synth-loop" : "synth",
          label: isLoop ? "Synth Loop" : "Synth",
          description: isLoop ? "Electronic synthesized loops" : "Electronic synthesized sounds",
          icon: "🔊",
        },
      ],
    
      "drums-percussion": [
        {
          id: isLoop ? "clap-loop" : "clap",
          label: isLoop ? "Clap Loop" : "Clap",
          description: isLoop ? "Hand clap loops" : "Hand clap sounds",
          icon: "👏",
        },
        {
          id: isLoop ? "claves-loop" : "claves",
          label: isLoop ? "Claves Loop" : "Claves",
          description: isLoop ? "Wooden percussion stick loops" : "Wooden percussion sticks",
          icon: "🥢",
        },
        {
          id: isLoop ? "cymbal-loop" : "cymbal",
          label: isLoop ? "Cymbal Loop" : "Cymbal",
          description: isLoop ? "Metal crash loops" : "Metal crash sounds",
          icon: "🥽",
        },
        ...(isLoop ? [{
          id: "drum-loop",
          label: "Drum Loop",
          description: "Complete drum pattern loops",
          icon: "🥁",
        }] : []),
        {
          id: isLoop ? "rolls-fills-loop" : "rolls-fills",
          label: isLoop ? "Rolls & Fills Loop" : "Rolls & Fills",
          description: isLoop ? "Drum roll and fill loops" : "Drum rolls and fill patterns",
          icon: "🌊",
        },
        {
          id: isLoop ? "fx-perc-loop" : "fx-perc",
          label: isLoop ? "Fx Perc Loop" : "Fx Perc",
          description: isLoop ? "Processed percussion effect loops" : "Processed percussion effects",
          icon: "✨",
        },
        {
          id: isLoop ? "hihat-loop" : "hihat",
          label: isLoop ? "Hihat Loop" : "Hihat",
          description: isLoop ? "Hi-hat cymbal loops" : "Hi-hat cymbal sounds",
          icon: "🎵",
        },
        {
          id: isLoop ? "kick-loop" : "kick",
          label: isLoop ? "Kick Loop" : "Kick",
          description: isLoop ? "Bass drum loops" : "Bass drum sounds",
          icon: "🥁",
        },
        {
          id: isLoop ? "perc-loop" : "perc",
          label: isLoop ? "Perc Loop" : "Perc",
          description: isLoop ? "General percussion loops" : "General percussion elements",
          icon: "🔨",
        },
        {
          id: isLoop ? "ride-loop" : "ride",
          label: isLoop ? "Ride Loop" : "Ride",
          description: isLoop ? "Ride cymbal loops" : "Ride cymbal sounds",
          icon: "🥁",
        },
        {
          id: isLoop ? "rim-loop" : "rim",
          label: isLoop ? "Rim Loop" : "Rim",
          description: isLoop ? "Rim shot loops" : "Rim shot sounds",
          icon: "⚡",
        },
        {
          id: isLoop ? "shaker-loop" : "shaker",
          label: isLoop ? "Shaker Loop" : "Shaker",
          description: isLoop ? "Shaker percussion loops" : "Shaker percussion",
          icon: "🥤",
        },
        {
          id: isLoop ? "snare-loop" : "snare",
          label: isLoop ? "Snare Loop" : "Snare",
          description: isLoop ? "Sharp percussive loops" : "Sharp percussive hits",
          icon: "🥁",
        },
        {
          id: isLoop ? "tambourine-loop" : "tambourine",
          label: isLoop ? "Tambourine Loop" : "Tambourine",
          description: isLoop ? "Tambourine jingle loops" : "Tambourine jingles",
          icon: "🪘",
        },
        {
          id: isLoop ? "tom-loop" : "tom",
          label: isLoop ? "Tom Loop" : "Tom",
          description: isLoop ? "Pitched drum loops" : "Pitched drum sounds",
          icon: "🥁",
        },
        ...(isLoop ? [{
          id: "top-loop",
          label: "Top Loop",
          description: "Top-end percussion loops",
          icon: "🔺",
        }] : []),
      ],
      "atmospheric-fx": [
        {
          id: isLoop ? "atmosphere-loop" : "atmosphere",
          label: isLoop ? "Atmosphere Loop" : "Atmosphere",
          description: isLoop ? "Ambient background texture loops" : "Ambient background textures",
          icon: "🌌",
        },
        {
          id: isLoop ? "impact-loop" : "impact",
          label: isLoop ? "Impact Loop" : "Impact",
          description: isLoop ? "Dramatic hit loops" : "Dramatic hit sounds",
          icon: "💥",
        },
        {
          id: isLoop ? "noise-loop" : "noise",
          label: isLoop ? "Noise Loop" : "Noise",
          description: isLoop ? "Textural noise loops" : "Textural noise elements",
          icon: "📻",
        },
        {
          id: isLoop ? "riser-loop" : "riser",
          label: isLoop ? "Riser Loop" : "Riser",
          description: isLoop ? "Building tension loops" : "Building tension sounds",
          icon: "📈",
        },
        {
          id: isLoop ? "sub-drop-loop" : "sub-drop",
          label: isLoop ? "Sub Drop Loop" : "Sub Drop",
          description: isLoop ? "Low-frequency drop loops" : "Low-frequency drops",
          icon: "⬇️",
        },
        {
          id: isLoop ? "sweep-loop" : "sweep",
          label: isLoop ? "Sweep Loop" : "Sweep",
          description: isLoop ? "Frequency sweep effect loops" : "Frequency sweep effects",
          icon: "🌪️",
        },
        {
          id: isLoop ? "texture-loop" : "texture",
          label: isLoop ? "Texture Loop" : "Texture",
          description: isLoop ? "Ambient textural loops" : "Ambient textural layers",
          icon: "🎨",
        },
        {
          id: isLoop ? "tonal-fx-loop" : "tonal-fx",
          label: isLoop ? "Tonal Fx Loop" : "Tonal Fx",
          description: isLoop ? "Tonal effect loops" : "Tonal effect sounds",
          icon: "🎭",
        },
        {
          id: isLoop ? "transition-fx-loop" : "transition-fx",
          label: isLoop ? "Transition Fx Loop" : "Transition Fx",
          description: isLoop ? "Transition effect loops" : "Transition effect elements",
          icon: "🔄",
        },
      ],
      vocals: [
        {
          id: isLoop ? "spoken-loop" : "spoken",
          label: isLoop ? "Spoken Loop" : "Spoken",
          description: isLoop ? "Spoken word loops" : "Spoken word elements",
          icon: "🗣️",
        },
        {
          id: isLoop ? "vocal-atmosphere-loop" : "vocal-atmosphere",
          label: isLoop ? "Vocal Atmosphere Loop" : "Vocal Atmosphere",
          description: isLoop ? "Ambient vocal texture loops" : "Ambient vocal textures",
          icon: "🎤",
        },
        {
          id: isLoop ? "vocal-chop-loop" : "vocal-chop",
          label: isLoop ? "Vocal Chop Loop" : "Vocal Chop",
          description: isLoop ? "Chopped vocal loops" : "Chopped vocal samples",
          icon: "✂️",
        },
        {
          id: isLoop ? "vocal-drone-loop" : "vocal-drone",
          label: isLoop ? "Vocal Drone Loop" : "Vocal Drone",
          description: isLoop ? "Sustained vocal tone loops" : "Sustained vocal tones",
          icon: "〰️",
        },
        {
          id: isLoop ? "vocal-fx-loop" : "vocal-fx",
          label: isLoop ? "Vocal Fx Loop" : "Vocal Fx",
          description: isLoop ? "Processed vocal effect loops" : "Processed vocal effects",
          icon: "🎛️",
        },
        {
          id: isLoop ? "vocal-pad-loop" : "vocal-pad",
          label: isLoop ? "Vocal Pad Loop" : "Vocal Pad",
          description: isLoop ? "Layered vocal pad loops" : "Layered vocal pads",
          icon: "🌊",
        },
        {
          id: isLoop ? "vocal-phrase-loop" : "vocal-phrase",
          label: isLoop ? "Vocal Phrase Loop" : "Vocal Phrase",
          description: isLoop ? "Complete vocal phrase loops" : "Complete vocal phrases",
          icon: "🎵",
        },
        {
          id: isLoop ? "whispering-loop" : "whispering",
          label: isLoop ? "Whispering Loop" : "Whispering",
          description: isLoop ? "Whispered vocal loops" : "Whispered vocal elements",
          icon: "🤫",
        },
      ],
    };
  };

  // =============================================================================
  // TAGGING SYSTEM
  // =============================================================================
  // 🟪 STYLE - Multiple choices can be selected
  // 🟩 MOOD (emotional tone) - Multiple choices can be selected  
  // 🟨 KEY - 12 minor + 12 major + 1 no key = 25 total
  // ⬛ BPM - Integer values only, visible only for sample loops (not one-shots)
  // 🟥 PROCESSING - Multiple choices can be selected
  // 🟫 SOUND DESIGN METHOD - Multiple choices can be selected
  // =============================================================================

  // Style tags - multiple choices can be selected
  const styleTags = [
    "Cinematic",
    "Dark",
    "Deep",
    "Ethereal",
    "Groovy",
    "Hypnotic",
    "Industrial",
    "Melodic",
    "Noir",
    "Organic",
    "Orchestral",
    "Raw",
    "Ritualistic",
    "Spacey",
    "Tribal",
    "Uplifting",
    "Vintage",
  ];

  // Mood tags (emotional tone) - multiple choices can be selected
  const moodTags = [
    "Cold",
    "Detached",
    "Dreamy",
    "Emotional",
    "Epic",
    "Euphoric",
    "Hopeful",
    "Introspective",
    "Melancholic",
    "Mysterious",
    "Nostalgic",
    "Romantic",
    "Spiritual",
    "Tense",
    "Warm",
  ];

  // Key options - 12 minor + 12 major + 1 no key = 25 total
  const keyOptions = [
    "Amin", "A#min", "Bmin", "Cmin", "C#min", "Dmin", 
    "D#min", "Emin", "Fmin", "F#min", "Gmin", "G#min",
    "Amaj", "A#maj", "Bmaj", "Cmaj", "C#maj", "Dmaj",
    "D#maj", "Emaj", "Fmaj", "F#maj", "Gmaj", "G#maj",
    "No Key"
  ];

  // Processing tags - multiple choices can be selected
  const processingTags = [
    "Bitcrushed",
    "Compressed",
    "Delay",
    "Distorted",
    "Dry",
    "Filtered",
    "Glitched",
    "Granular",
    "Layered",
    "Modulated",
    "Resampled",
    "Reverse",
    "Reverb",
    "Saturated",
    "Sidechained",
    "Stretched",
    "Tape",
  ];

  // Sound design method tags - multiple choices can be selected
  const soundDesignTags = [
    "Additive",
    "Analog",
    "Digital",
    "Field Recording",
    "Fm Synthesis",
    "Granular",
    "Hybrid",
    "Modular",
    "Physical Modeling",
    "Resampled",
    "Rompler",
    "Sample-Based",
    "Spectral",
    "Subtractive",
    "Vocoded",
    "Wavetable",
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

  // Batch import helper functions
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const togglePlay = (fileId: string) => {
    setCurrentlyPlaying(currentlyPlaying === fileId ? null : fileId);
  };

  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const audioFiles = files.filter((file) => file.type.startsWith("audio/"));

    const newImportedFiles: ImportedFile[] = audioFiles.map((file, index) => ({
      id: `batch-${Date.now()}-${index}`,
      name: file.name,
      duration: 1.5, // This would be calculated from the actual file
      waveform: Array.from({ length: 100 }, () => Math.random() * 100),
      file,
    }));

    setImportedFiles((prev) => [...prev, ...newImportedFiles]);
  };

  const removeImportedFile = (fileId: string) => {
    setImportedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleBatchImport = async () => {
    console.log("Batch importing files...", {
      files: importedFiles,
      metadata: batchMetadata,
      tags: selectedTags,
      contentType,
      soundGroup,
      soundType,
    });
    // Handle batch import logic here
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "audio" | "artwork"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "audio") {
      // Validate audio/MIDI file based on content type
      if (contentType === "midi") {
        if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
          alert("Please select a valid MIDI file");
          return;
        }
      } else {
        if (!file.type.startsWith("audio/")) {
          alert("Please select a valid audio file");
          return;
        }
      }
      setAudioFile(file);
      if (contentType !== "midi") {
        setAudioPreview(URL.createObjectURL(file));
      }
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
      if (soundGroup) {
        formDataToSend.append("soundGroup", soundGroup);
      }
      if (soundType) {
        formDataToSend.append("soundType", soundType);
      }

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="font-anton text-4xl text-white mb-4">
            Upload Content
          </h1>
          <p className="font-instrument-sans text-gray-300 text-lg">
            Share your music with the world
          </p>
        </div>

        {/* Upload Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-2 flex gap-2">
            <button
              onClick={() => setUploadMode("single")}
              className={`px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors ${
                uploadMode === "single"
                  ? "bg-yellow-500 text-black"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Single Upload
            </button>
            <button
              onClick={() => setUploadMode("batch")}
              className={`px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors ${
                uploadMode === "batch"
                  ? "bg-yellow-500 text-black"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Batch Import
            </button>
          </div>
        </div>

        {uploadMode === "single" ? (
          <div className="max-w-4xl mx-auto">
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
                {/* Show steps 3, 4, and 5 for all sample types and MIDI */}
                {(contentType === "sample-one-shot" || contentType === "sample-loop" || contentType === "sample-loop-midi" || contentType === "midi") && (
                  <>
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
                    <div
                      className={`w-12 h-0.5 ${
                        currentStep > 3 ? "bg-yellow-500" : "bg-gray-700"
                      }`}
                    ></div>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep >= 4
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      <span className="font-instrument-sans text-sm font-medium">
                        4
                      </span>
                    </div>
                    <div
                      className={`w-12 h-0.5 ${
                        currentStep > 4 ? "bg-yellow-500" : "bg-gray-700"
                      }`}
                    ></div>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep >= 5
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      <span className="font-instrument-sans text-sm font-medium">
                        5
                      </span>
                    </div>
                  </>
                )}
                {/* For other content types, show only 3 steps */}
                {!(contentType === "sample-one-shot" || contentType === "sample-loop" || contentType === "sample-loop-midi" || contentType === "midi") && (
                  <>
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
                  </>
                )}
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
                      onClick={() => {
                        if (contentType) {
                          // If any sample type is selected, go to Sound Group step (2)
                          if (contentType === "sample-one-shot" || contentType === "sample-loop" || contentType === "sample-loop-midi") {
                            setCurrentStep(2);
                          } else if (contentType === "midi") {
                            // For MIDI, skip Sound Group and go directly to Sound Type step (3)
                            setCurrentStep(3);
                          } else {
                            setCurrentStep(2); // For other content types, still go to step 2 for now
                          }
                        }
                      }}
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

              {/* Step 2: Sound Group Selection (for all sample types) */}
              {currentStep === 2 && (contentType === "sample-one-shot" || contentType === "sample-loop" || contentType === "sample-loop-midi") && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-anton text-2xl text-white mb-2">
                      Select Sound Group
                    </h2>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="font-instrument-sans text-blue-500 text-sm font-medium uppercase tracking-wide">
                        Sound Group
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {soundGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => setSoundGroup(group.id)}
                        className={`p-6 rounded-lg border-2 transition-all text-left ${
                          soundGroup === group.id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-700 bg-gray-800 hover:border-gray-600"
                        }`}
                      >
                        <div className="text-2xl mb-3">{group.icon}</div>
                        <h3 className="font-instrument-sans text-white font-medium mb-1">
                          {group.label}
                        </h3>
                        <div
                          className={`w-4 h-4 rounded-full border-2 mt-4 ${
                            soundGroup === group.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-500"
                          }`}
                        >
                          {soundGroup === group.id && (
                            <div className="w-full h-full rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 rounded-md font-instrument-sans font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => soundGroup && setCurrentStep(3)}
                      disabled={!soundGroup}
                      className={`px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors ${
                        soundGroup
                          ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Sound Types (for all sample types and MIDI) */}
              {currentStep === 3 && (contentType === "sample-one-shot" || contentType === "sample-loop" || contentType === "sample-loop-midi" || contentType === "midi") && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="font-anton text-2xl text-white mb-2">
                      Select Sound Type
                    </h2>
                    <p className="font-instrument-sans text-gray-400">
                      {contentType === "midi" 
                        ? "Choose the specific type of melodic MIDI file"
                        : `Choose the specific type of ${soundGroups.find((g) => g.id === soundGroup)?.label.toLowerCase()} sound`
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contentType === "midi" ? (
                      // Show MIDI sound types
                      getMidiSoundTypes().map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSoundType(type.id);
                            // For MIDI, automatically set soundGroup to melodic-harmonic
                            setSoundGroup("melodic-harmonic");
                          }}
                          className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                            soundType === type.id
                              ? "border-yellow-500 bg-yellow-500/10"
                              : "border-gray-700 hover:border-gray-600"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-3">{type.icon}</div>
                            <h3 className="font-anton text-lg text-white mb-2">
                              {type.label}
                            </h3>
                            <p className="font-instrument-sans text-gray-400 text-sm">
                              {type.description}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      // Show sample sound types
                      soundGroup &&
                      getSoundTypes(contentType)[soundGroup as keyof ReturnType<typeof getSoundTypes>]?.map((type: { id: string; label: string; description: string; icon: string }) => (
                        <button
                          key={type.id}
                          onClick={() => setSoundType(type.id)}
                          className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                            soundType === type.id
                              ? "border-yellow-500 bg-yellow-500/10"
                              : "border-gray-700 hover:border-gray-600"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-3">{type.icon}</div>
                            <h3 className="font-anton text-lg text-white mb-2">
                              {type.label}
                            </h3>
                            <p className="font-instrument-sans text-gray-400 text-sm">
                              {type.description}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => {
                        if (contentType === "midi") {
                          setCurrentStep(1); // Go back to Content Type step for MIDI
                        } else {
                          setCurrentStep(2); // Go back to Sound Group step for samples
                        }
                      }}
                      className="px-6 py-3 rounded-md font-instrument-sans font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => soundType && setCurrentStep(4)}
                      disabled={!soundType}
                      className={`px-6 py-3 rounded-md font-instrument-sans font-medium transition-colors ${
                        soundType
                          ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: File Upload (for all sample types and MIDI) */}
              {currentStep === 4 && (contentType === "sample-one-shot" || contentType === "sample-loop" || contentType === "sample-loop-midi" || contentType === "midi") && (
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

                  {/* Audio/MIDI File Upload */}
                  <div>
                    <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                      {contentType === "midi" ? "MIDI File *" : "Audio File *"}
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
                      <input
                        type="file"
                        accept={contentType === "midi" ? ".mid,.midi" : "audio/*"}
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
                              {audioPreview && contentType !== "midi" && (
                                <audio
                                  controls
                                  src={audioPreview}
                                  className="mx-auto"
                                >
                                  Your browser does not support the audio
                                  element.
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
                                {contentType === "midi" ? "Click to upload MIDI file" : "Click to upload audio file"}
                              </p>
                              <p className="font-instrument-sans text-sm text-gray-400 mt-1">
                                {contentType === "midi" ? "MID, MIDI up to 10MB" : "MP3, WAV, FLAC up to 100MB"}
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
                      <label
                        htmlFor="artwork-upload"
                        className="cursor-pointer"
                      >
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
                      onClick={() => {
                        // For all sample types, go back to Sound Types step (step 3)
                        // For MIDI, also go back to Sound Types step (step 3)
                        if (contentType === "sample-one-shot" || contentType === "sample-loop" || contentType === "sample-loop-midi" || contentType === "midi") {
                          setCurrentStep(3); // Go back to Sound Types step
                        } else {
                          setCurrentStep(1); // Go back to Content Type step for other types
                        }
                      }}
                      className="px-6 py-3 rounded-md font-instrument-sans font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (audioFile) {
                          // For all sample types and MIDI, go to Details step (step 5)
                          if (contentType === "sample-one-shot" || contentType === "sample-loop" || contentType === "sample-loop-midi" || contentType === "midi") {
                            setCurrentStep(5); // Go to Details step (step 5 for all sample types and MIDI)
                          } else {
                            setCurrentStep(3); // Go to Details step (step 3 for other types)
                          }
                        }
                      }}
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

              {/* Step 5: Details (for all sample types and MIDI) */}
              {currentStep === 5 && (contentType === "sample-one-shot" || contentType === "sample-loop" || contentType === "sample-loop-midi" || contentType === "midi") && (
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
                        Key {contentType === "midi" ? "*" : ""}
                      </label>
                      <select
                        required={contentType === "midi"}
                        className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-3 text-white font-instrument-sans focus:outline-none focus:border-yellow-500 transition-colors"
                        value={formData.key}
                        onChange={(e) =>
                          setFormData({ ...formData, key: e.target.value })
                        }
                      >
                        <option value="">Select key</option>
                        {keyOptions.map((key) => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* BPM field - only show for sample loops, not sample one-shots */}
                    {(contentType === "sample-loop" || contentType === "sample-loop-midi") && (
                      <div>
                        <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                          BPM *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="300"
                          step="1"
                          required
                          className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-3 text-white placeholder-gray-400 font-instrument-sans focus:outline-none focus:border-yellow-500 transition-colors"
                          placeholder="120"
                          value={formData.bpm}
                          onChange={(e) =>
                            setFormData({ ...formData, bpm: e.target.value })
                          }
                        />
                      </div>
                    )}

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
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        // For all sample types and MIDI, go back to File Upload step (step 4)
                        if (contentType === "sample-one-shot" || contentType === "sample-loop" || contentType === "sample-loop-midi" || contentType === "midi") {
                          setCurrentStep(4); // Go back to File Upload step (step 4 for all sample types and MIDI)
                        } else {
                          setCurrentStep(2); // Go back to File Upload step (step 2 for other types)
                        }
                      }}
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
        ) : (
          // Batch Import Mode
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
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id)}
                      className={`px-4 py-2 rounded-md font-instrument-sans text-sm transition-colors ${
                        contentType === type.id
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Drop Area */}
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center mb-6 hover:border-gray-600 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleBatchFileUpload}
                  className="hidden"
                  id="batch-file-upload"
                />
                <label htmlFor="batch-file-upload" className="cursor-pointer">
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
                    Select multiple audio files
                  </p>
                </label>
              </div>

              {/* Batch Metadata Settings */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    value={batchMetadata.name}
                    onChange={(e) =>
                      setBatchMetadata((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white font-instrument-sans focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                    BPM
                  </label>
                  <input
                    type="text"
                    value={batchMetadata.bpm}
                    onChange={(e) =>
                      setBatchMetadata((prev) => ({
                        ...prev,
                        bpm: e.target.value,
                      }))
                    }
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
                    value={batchMetadata.key}
                    onChange={(e) =>
                      setBatchMetadata((prev) => ({
                        ...prev,
                        key: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-white font-instrument-sans focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="">Select key</option>
                    {keyOptions.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-instrument-sans text-white text-sm font-medium mb-2">
                    Sound Type
                  </label>
                  <select
                    value={batchMetadata.soundType}
                    onChange={(e) =>
                      setBatchMetadata((prev) => ({
                        ...prev,
                        soundType: e.target.value,
                      }))
                    }
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

                {/* Sound Design Method Tags */}
                <div>
                  <label className="block font-instrument-sans text-white text-sm font-medium mb-3">
                    Sound Design Method
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
                onClick={handleBatchImport}
                disabled={importedFiles.length === 0}
                className={`w-full mt-6 font-instrument-sans font-medium py-3 rounded-md transition-colors ${
                  importedFiles.length > 0
                    ? "bg-teal-600 hover:bg-teal-500 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                Import & Tag ({importedFiles.length} files)
              </button>
            </div>

            {/* Right Panel - Imported Content */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="font-anton text-2xl text-white mb-6">
                Imported Content
              </h2>

              {importedFiles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                  <p className="font-instrument-sans text-gray-400">
                    No files imported yet
                  </p>
                  <p className="font-instrument-sans text-gray-500 text-sm mt-2">
                    Upload audio files to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {importedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-gray-950 border border-gray-800 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-instrument-sans text-white text-sm truncate mr-2">
                          {file.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeImportedFile(file.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
