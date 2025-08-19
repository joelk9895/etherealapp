import React from "react";
import { ImportedFile, BatchMetadata } from "../types";

interface BatchImportProps {
  files: ImportedFile[];
  batchMetadata: BatchMetadata[];
  onBatchMetadataChange: (metadata: BatchMetadata[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  keyOptions: string[];
  soundTypes: Array<{
    id: string;
    label: string;
    description: string;
    icon: string;
  }>;
  isSubmitting?: boolean;
}

export default function BatchImport({
  files,
  batchMetadata,
  onBatchMetadataChange,
  onSubmit,
  onCancel,
  keyOptions,
  soundTypes,
  isSubmitting = false,
}: BatchImportProps) {
  const handleMetadataChange = (
    index: number,
    field: keyof BatchMetadata,
    value: string
  ) => {
    const newMetadata = [...batchMetadata];
    newMetadata[index] = {
      ...newMetadata[index],
      [field]: value,
    };
    onBatchMetadataChange(newMetadata);
  };

  const allFieldsComplete = batchMetadata.every(
    (metadata) =>
      metadata.name && metadata.bpm && metadata.key && metadata.soundType
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Batch Import Configuration
        </h2>
        <p className="text-gray-400">
          Configure metadata for each file individually
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {files.map((file, index) => (
          <div key={file.id} className="bg-gray-800 p-4 rounded-lg space-y-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎵</div>
              <div>
                <div className="text-white font-medium">{file.name}</div>
                <div className="text-sm text-gray-400">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={batchMetadata[index]?.name || ""}
                  onChange={(e) =>
                    handleMetadataChange(index, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Sample name"
                />
              </div>

              {/* BPM */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  BPM *
                </label>
                <input
                  type="text"
                  value={batchMetadata[index]?.bpm || ""}
                  onChange={(e) =>
                    handleMetadataChange(index, "bpm", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="120"
                />
              </div>

              {/* Key */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Key *
                </label>
                <select
                  value={batchMetadata[index]?.key || ""}
                  onChange={(e) =>
                    handleMetadataChange(index, "key", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Key</option>
                  {keyOptions.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sound Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Sound Type *
                </label>
                <select
                  value={batchMetadata[index]?.soundType || ""}
                  onChange={(e) =>
                    handleMetadataChange(index, "soundType", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Type</option>
                  {soundTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!allFieldsComplete || isSubmitting}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Uploading..." : "Upload All Files"}
        </button>
      </div>
    </div>
  );
}
