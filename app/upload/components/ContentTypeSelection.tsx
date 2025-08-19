import React from "react";
import { ContentType } from "../types";

interface ContentTypeSelectionProps {
  contentTypes: ContentType[];
  selectedContentType: string;
  onSelect: (contentType: string) => void;
  onNext: () => void;
}

export default function ContentTypeSelection({
  contentTypes,
  selectedContentType,
  onSelect,
  onNext,
}: ContentTypeSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Content Type</h2>
        <p className="text-gray-400">
          Choose the type of content you want to upload
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {contentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
              selectedContentType === type.id
                ? "border-blue-500 bg-blue-500/20 text-blue-300"
                : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500"
            }`}
          >
            <div className="text-3xl mb-2">{type.icon}</div>
            <div className="text-sm font-medium">{type.label}</div>
          </button>
        ))}
      </div>

      {selectedContentType && (
        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next Step
          </button>
        </div>
      )}
    </div>
  );
}
