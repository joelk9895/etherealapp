"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

// Import components
import {
  UploadSteps,
  ContentTypeSelection,
  SoundGroupSelection,
  SoundTypeSelection,
  FileUpload,
  DetailsForm,
  BatchImport,
} from "./components";

// Import types and constants
import {
  type FormData as UploadFormData,
  ImportedFile,
  BatchMetadata,
  User,
  UploadMode,
} from "./types";
import {
  contentTypes,
  soundGroups,
  getSoundTypes,
  getMidiSoundTypes,
  keyOptions,
  styleTags,
  moodTags,
  processingTags,
  soundDesignTags,
} from "./constants";

export default function UploadPage() {
  const router = useRouter();

  // User and auth state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Upload flow state
  const [uploadMode, setUploadMode] = useState<UploadMode>("single");
  const [currentStep, setCurrentStep] = useState(1);
  const [contentType, setContentType] = useState("");
  const [soundGroup, setSoundGroup] = useState("");
  const [soundType, setSoundType] = useState("");

  // Form data
  const [formData, setFormData] = useState<UploadFormData>({});
  const [files, setFiles] = useState<ImportedFile[]>([]);

  // Batch import state
  const [batchMetadata, setBatchMetadata] = useState<BatchMetadata[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  // Authentication check
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

  // Step navigation functions
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Content type handlers
  const handleContentTypeSelect = (type: string) => {
    setContentType(type);
    setSoundGroup("");
    setSoundType("");
    setFiles([]);
    setFormData({});
  };

  const handleSoundGroupSelect = (group: string) => {
    setSoundGroup(group);
    setSoundType("");
  };

  const handleSoundTypeSelect = (type: string) => {
    setSoundType(type);
  };

  // File handlers
  const handleFilesChange = (newFiles: ImportedFile[]) => {
    setFiles(newFiles);

    // Initialize batch metadata for new files
    if (uploadMode === "batch") {
      const newMetadata = newFiles.map((file) => ({
        name: file.name,
        bpm: "",
        key: "",
        soundType: "",
      }));
      setBatchMetadata(newMetadata);
    }
  };

  const handleBatchMetadataChange = (metadata: BatchMetadata[]) => {
    setBatchMetadata(metadata);
  };

  // Form handlers
  const handleFormDataChange = (newFormData: UploadFormData) => {
    setFormData(newFormData);
  };

  // Submit handlers
  const handleSingleUpload = async () => {
    if (files.length === 0) {
      alert("Please select a file");
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("audio", files[0].file);
      formDataToSend.append("title", formData.title || "");
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("bpm", formData.bpm?.toString() || "");
      formDataToSend.append("key", formData.key || "");
      formDataToSend.append("contentType", contentType);
      formDataToSend.append("soundGroup", soundGroup);
      formDataToSend.append("soundType", soundType);

      // Add tag arrays
      if (formData.styleTags) {
        formDataToSend.append("styleTags", JSON.stringify(formData.styleTags));
      }
      if (formData.moodTags) {
        formDataToSend.append("moodTags", JSON.stringify(formData.moodTags));
      }
      if (formData.processingTags) {
        formDataToSend.append(
          "processingTags",
          JSON.stringify(formData.processingTags)
        );
      }
      if (formData.soundDesignTags) {
        formDataToSend.append(
          "soundDesignTags",
          JSON.stringify(formData.soundDesignTags)
        );
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/samples/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Content uploaded successfully!");
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

  const handleBatchUpload = async () => {
    console.log("Batch uploading files...", {
      files,
      metadata: batchMetadata,
      tags: selectedTags,
      contentType,
      soundGroup,
      soundType,
    });
    // Implement batch upload logic here
    alert("Batch upload functionality coming soon!");
  };

  // Get current sound types based on content type and sound group
  const getCurrentSoundTypes = () => {
    if (contentType === "midi") {
      return getMidiSoundTypes();
    }

    if (soundGroup) {
      const soundTypes = getSoundTypes(contentType);
      return soundTypes[soundGroup] || [];
    }

    return [];
  };

  // Determine step configuration
  const isSampleOrMidi = [
    "sample-one-shot",
    "sample-loop",
    "sample-loop-midi",
    "midi",
  ].includes(contentType);
  const totalSteps = isSampleOrMidi ? 5 : 3;
  const stepTitles = isSampleOrMidi
    ? ["Content Type", "Sound Group", "Sound Type", "File Upload", "Details"]
    : ["Content Type", "File Upload", "Details"];

  // Show vocals only for construction kit
  const showVocalsOnly = contentType === "construction-kit";

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
            <UploadSteps
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepTitles={stepTitles}
            />

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              {/* Step 1: Content Type Selection */}
              {currentStep === 1 && (
                <ContentTypeSelection
                  contentTypes={contentTypes}
                  selectedContentType={contentType}
                  onSelect={handleContentTypeSelect}
                  onNext={nextStep}
                />
              )}

              {/* Step 2: Sound Group Selection */}
              {currentStep === 2 && isSampleOrMidi && (
                <SoundGroupSelection
                  soundGroups={soundGroups}
                  selectedSoundGroup={soundGroup}
                  onSelect={handleSoundGroupSelect}
                  onNext={nextStep}
                  onBack={previousStep}
                  showVocalsOnly={showVocalsOnly}
                />
              )}

              {/* Step 3: Sound Type Selection */}
              {currentStep === 3 && isSampleOrMidi && (
                <SoundTypeSelection
                  soundTypes={getCurrentSoundTypes()}
                  selectedSoundType={soundType}
                  onSelect={handleSoundTypeSelect}
                  onNext={nextStep}
                  onBack={previousStep}
                  contentType={contentType}
                  soundGroup={soundGroup}
                />
              )}

              {/* Step 4: File Upload */}
              {currentStep === 4 && isSampleOrMidi && (
                <FileUpload
                  files={files}
                  onFilesChange={handleFilesChange}
                  onNext={nextStep}
                  onBack={previousStep}
                  contentType={contentType}
                />
              )}

              {/* Step 5: Details Form */}
              {currentStep === 5 && isSampleOrMidi && (
                <DetailsForm
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onSubmit={handleSingleUpload}
                  onBack={previousStep}
                  contentType={contentType}
                  keyOptions={keyOptions}
                  styleTags={styleTags}
                  moodTags={moodTags}
                  processingTags={processingTags}
                  soundDesignTags={soundDesignTags}
                  isSubmitting={uploading}
                />
              )}

              {/* For non-sample/MIDI content types - simplified flow */}
              {!isSampleOrMidi && currentStep === 2 && (
                <FileUpload
                  files={files}
                  onFilesChange={handleFilesChange}
                  onNext={nextStep}
                  onBack={previousStep}
                  contentType={contentType}
                />
              )}

              {!isSampleOrMidi && currentStep === 3 && (
                <DetailsForm
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onSubmit={handleSingleUpload}
                  onBack={previousStep}
                  contentType={contentType}
                  keyOptions={keyOptions}
                  styleTags={styleTags}
                  moodTags={moodTags}
                  processingTags={processingTags}
                  soundDesignTags={soundDesignTags}
                  isSubmitting={uploading}
                />
              )}
            </div>
          </div>
        ) : (
          /* Batch Import Mode */
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <BatchImport
                files={files}
                batchMetadata={batchMetadata}
                onBatchMetadataChange={handleBatchMetadataChange}
                onSubmit={handleBatchUpload}
                onCancel={() => {
                  setFiles([]);
                  setBatchMetadata([]);
                }}
                keyOptions={keyOptions}
                soundTypes={getCurrentSoundTypes()}
                isSubmitting={uploading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
