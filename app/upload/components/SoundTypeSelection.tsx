import React from "react";
import { SoundType } from "../types";

interface SoundTypeSelectionProps {
  soundTypes: SoundType[];
  selectedSoundType: string;
  onSelect: (soundType: string) => void;
  onNext: () => void;
  onBack: () => void;
  contentType: string;
  soundGroup: string;
}

export default function SoundTypeSelection({
  soundTypes,
  selectedSoundType,
  onSelect,
  onNext,
  onBack,
  contentType,
  soundGroup,
}: SoundTypeSelectionProps) {
  const getTitle = () => {
    if (contentType === "midi") {
      return "MIDI Sound Type";
    }
    return "Sound Type";
  };

  const getDescription = () => {
    if (contentType === "midi") {
      return "Choose the type of MIDI content you're uploading";
    }
    return `Select the specific type of ${soundGroup.replace(
      "-",
      " & "
    )} content`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{getTitle()}</h2>
        <p className="text-gray-400">{getDescription()}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
        {soundTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
              selectedSoundType === type.id
                ? "border-blue-500 bg-blue-500/20 text-blue-300"
                : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500"
            }`}
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="text-sm font-medium mb-1">{type.label}</div>
            {type.description && (
              <div className="text-xs text-gray-500">{type.description}</div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back
        </button>

        {selectedSoundType && (
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
