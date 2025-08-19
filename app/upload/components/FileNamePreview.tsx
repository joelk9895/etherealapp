import React from "react";
import {
  generateETFileName,
  getFileExtension,
  type FileNamingData,
} from "../utils/fileNaming";

interface FileNamePreviewProps {
  files: Array<{
    id: string;
    name: string;
    file: File;
  }>;
  contentType: string;
  soundType: string;
  formData: {
    title?: string;
    bpm?: number;
    key?: string;
  };
}

export default function FileNamePreview({
  files,
  contentType,
  soundType,
  formData,
}: FileNamePreviewProps) {
  if (files.length === 0 || !contentType || !soundType || !formData.title) {
    return null;
  }

  const generatePreviewNames = () => {
    return files.map((file) => {
      const fileExtension = getFileExtension(file.file.name);

      const namingData: FileNamingData = {
        contentType,
        soundType,
        title: formData.title || "Untitled",
        bpm: formData.bpm,
        key: formData.key,
        originalFileName: file.file.name,
        fileExtension,
      };

      const result = generateETFileName(namingData);

      return {
        originalName: file.file.name,
        newName: result.newFileName,
        needsVariationCheck: result.needsVariationCheck,
        id: file.id,
      };
    });
  };

  const previewNames = generatePreviewNames();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-4">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        <span className="mr-2">📝</span>
        Generated File Names Preview
      </h3>

      <div className="space-y-2">
        {previewNames.map((nameInfo) => (
          <div key={nameInfo.id} className="bg-gray-900 rounded p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <div className="text-gray-400 mb-1">
                  Original:{" "}
                  <span className="font-mono">{nameInfo.originalName}</span>
                </div>
                <div className="text-green-400">
                  New:{" "}
                  <span className="font-mono font-medium">
                    {nameInfo.newName}
                  </span>
                </div>
                {nameInfo.needsVariationCheck && (
                  <div className="text-yellow-400 text-xs mt-1">
                    ⚠️ Will check for variations and add _01, _02 suffixes if
                    needed
                  </div>
                )}
              </div>
              <div className="ml-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Special handling for Sample Loop+MIDI */}
      {contentType === "sample-loop-midi" && (
        <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded">
          <div className="text-blue-300 text-sm">
            <span className="mr-2">ℹ️</span>
            <strong>Sample Loop+MIDI:</strong> Both audio and MIDI files will
            use the same base name. MIDI files will automatically be generated
            with .mid extension.
          </div>
        </div>
      )}

      {/* Construction Kit special notice */}
      {contentType === "construction-kit" && (
        <div className="mt-3 p-3 bg-purple-900/30 border border-purple-700 rounded">
          <div className="text-purple-300 text-sm">
            <span className="mr-2">🔧</span>
            <strong>Construction Kit:</strong> Files will be automatically
            organized and variations (_01, _02, etc.) will be added if multiple
            files of the same role are detected.
          </div>
        </div>
      )}

      {/* Missing BPM warning for loops */}
      {(contentType === "sample-loop" ||
        contentType === "sample-loop-midi" ||
        contentType === "construction-kit") &&
        !formData.bpm && (
          <div className="mt-3 p-3 bg-orange-900/30 border border-orange-700 rounded">
            <div className="text-orange-300 text-sm">
              <span className="mr-2">⚠️</span>
              <strong>Missing BPM:</strong> BPM is required for loop files.
              &quot;XXX&quot; will be used as placeholder until BPM is provided.
            </div>
          </div>
        )}

      {/* Missing Key warning for MIDI */}
      {contentType === "midi" && !formData.key && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded">
          <div className="text-red-300 text-sm">
            <span className="mr-2">❌</span>
            <strong>Missing Key:</strong> Key is required for MIDI files.
          </div>
        </div>
      )}
    </div>
  );
}
