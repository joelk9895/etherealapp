import React from "react";
import { SoundGroup } from "../types";

interface SoundGroupSelectionProps {
  soundGroups: SoundGroup[];
  selectedSoundGroup: string;
  onSelect: (soundGroup: string) => void;
  onNext: () => void;
  onBack: () => void;
  showVocalsOnly?: boolean;
}

export default function SoundGroupSelection({
  soundGroups,
  selectedSoundGroup,
  onSelect,
  onNext,
  onBack,
  showVocalsOnly = false,
}: SoundGroupSelectionProps) {
  const displayGroups = showVocalsOnly
    ? soundGroups.filter((group) => group.id === "vocals")
    : soundGroups;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Sound Group</h2>
        <p className="text-gray-400">
          Select the category that best describes your content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => onSelect(group.id)}
            className={`p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
              selectedSoundGroup === group.id
                ? "border-blue-500 bg-blue-500/20 text-blue-300"
                : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500"
            }`}
          >
            <div className="text-3xl mb-2">{group.icon}</div>
            <div className="text-lg font-medium">{group.label}</div>
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

        {selectedSoundGroup && (
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
