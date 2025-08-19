import React from "react";
import { FormData as UploadFormData, ImportedFile } from "../types";

interface DetailsFormProps {
  formData: UploadFormData;
  onFormDataChange: (formData: UploadFormData) => void;
  onSubmit: () => void;
  onBack: () => void;
  contentType: string;
  keyOptions: string[];
  styleTags: string[];
  moodTags: string[];
  processingTags: string[];
  soundDesignTags: string[];
  isSubmitting?: boolean;
}

export default function DetailsForm({
  formData,
  onFormDataChange,
  onSubmit,
  onBack,
  contentType,
  keyOptions,
  styleTags,
  moodTags,
  processingTags,
  soundDesignTags,
  isSubmitting = false,
}: DetailsFormProps) {
  const isMidi = contentType === "midi";

  const handleInputChange = (
    field: keyof UploadFormData,
    value: string | number | string[] | undefined
  ) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleTagToggle = (
    field: "styleTags" | "moodTags" | "processingTags" | "soundDesignTags",
    tag: string
  ) => {
    const currentTags = formData[field] || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    handleInputChange(field, newTags);
  };

  const renderTagSection = (
    title: string,
    field: "styleTags" | "moodTags" | "processingTags" | "soundDesignTags",
    tags: string[]
  ) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">{title}</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagToggle(field, tag)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              (formData[field] || []).includes(tag)
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Content Details</h2>
        <p className="text-gray-400">
          Add metadata and descriptions for your content
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key {isMidi ? "*" : ""}
            </label>
            <select
              value={formData.key || ""}
              onChange={(e) => handleInputChange("key", e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              required={isMidi}
            >
              <option value="">Select Key</option>
              {keyOptions.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          {/* BPM - only for non-MIDI content */}
          {!isMidi && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                BPM
              </label>
              <input
                type="number"
                value={formData.bpm || ""}
                onChange={(e) =>
                  handleInputChange(
                    "bpm",
                    parseInt(e.target.value) || undefined
                  )
                }
                min="1"
                max="300"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. 120"
              />
            </div>
          )}
        </div>

        {/* Style Tags */}
        {renderTagSection("Style Tags", "styleTags", styleTags)}

        {/* Mood Tags */}
        {renderTagSection("Mood Tags", "moodTags", moodTags)}

        {/* Processing Tags */}
        {renderTagSection("Processing Tags", "processingTags", processingTags)}

        {/* Sound Design Tags */}
        {renderTagSection(
          "Sound Design Tags",
          "soundDesignTags",
          soundDesignTags
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="Describe your content (optional)"
          />
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting || (isMidi && !formData.key)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Uploading..." : "Upload Content"}
          </button>
        </div>
      </form>
    </div>
  );
}
