import React, { useCallback } from "react";
import { ImportedFile } from "../types";

interface FileUploadProps {
  files: ImportedFile[];
  onFilesChange: (files: ImportedFile[]) => void;
  onNext: () => void;
  onBack: () => void;
  contentType: string;
  maxFiles?: number;
}

export default function FileUpload({
  files,
  onFilesChange,
  onNext,
  onBack,
  contentType,
  maxFiles = 10,
}: FileUploadProps) {
  const isMidi = contentType === "midi";

  const acceptedFileTypes = isMidi
    ? ".mid,.midi"
    : ".wav,.mp3,.aif,.aiff,.flac,.m4a,.ogg";

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelection(droppedFiles);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        handleFileSelection(selectedFiles);
      }
    },
    []
  );

  const handleFileSelection = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter((file) => {
      if (isMidi) {
        return (
          file.name.toLowerCase().endsWith(".mid") ||
          file.name.toLowerCase().endsWith(".midi")
        );
      } else {
        const audioExtensions = [
          ".wav",
          ".mp3",
          ".aif",
          ".aiff",
          ".flac",
          ".m4a",
          ".ogg",
        ];
        return audioExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        );
      }
    });

    if (validFiles.length === 0) {
      alert(`Please select valid ${isMidi ? "MIDI" : "audio"} files.`);
      return;
    }

    const remainingSlots = maxFiles - files.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newFiles: ImportedFile[] = filesToAdd.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      url: URL.createObjectURL(file),
      duration: 0, // Will be calculated later
      waveform: [], // Will be generated later
    }));

    onFilesChange([...files, ...newFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Upload {isMidi ? "MIDI" : "Audio"} Files
        </h2>
        <p className="text-gray-400">
          Select your {isMidi ? "MIDI" : "audio"} files to upload (max{" "}
          {maxFiles} files)
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-gray-500 transition-colors cursor-pointer"
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <div className="text-4xl mb-4">📁</div>
        <p className="text-lg text-gray-300 mb-2">
          Drop your {isMidi ? "MIDI" : "audio"} files here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Supported formats:{" "}
          {isMidi
            ? "MIDI (.mid, .midi)"
            : "WAV, MP3, AIF, AIFF, FLAC, M4A, OGG"}
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedFileTypes}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">
            Selected Files ({files.length}/{maxFiles})
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{isMidi ? "🎵" : "🎵"}</div>
                  <div>
                    <div className="text-white font-medium">{file.name}</div>
                    <div className="text-sm text-gray-400">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back
        </button>

        {files.length > 0 && (
          <button
            onClick={onNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next Step
          </button>
        )}
      </div>
    </div>
  );
}
