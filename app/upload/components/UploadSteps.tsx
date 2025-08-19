import React from "react";

interface UploadStepsProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function UploadSteps({
  currentStep,
  totalSteps,
  stepTitles,
}: UploadStepsProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold transition-all duration-300 ${
                  step < currentStep
                    ? "bg-green-500 border-green-500 text-white"
                    : step === currentStep
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-gray-600 text-gray-400"
                }`}
              >
                {step < currentStep ? "✓" : step}
              </div>
              <span className="text-xs mt-2 text-center max-w-20 leading-tight">
                {stepTitles[step - 1]}
              </span>
            </div>
            {step < totalSteps && (
              <div
                className={`w-8 h-0.5 transition-all duration-300 ${
                  step < currentStep ? "bg-green-500" : "bg-gray-600"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
