// File naming utility for Ethereal Techno (ET) content
export interface FileNamingData {
  contentType: string;
  soundType: string;
  title: string;
  bpm?: number;
  key?: string;
  originalFileName: string;
  fileExtension: string;
}

export interface GeneratedFileName {
  newFileName: string;
  needsVariationCheck: boolean;
  basePattern: string;
}

/**
 * Generates ET file names according to the specification:
 *
 * Sample One-Shot: ET_[SoundType]_[Title]_[Key].ext
 * Sample Loop: ET_[BPM]_[SoundType]_Loop_[Title]_[Key].ext
 * Sample Loop+MIDI: Same name for both .wav and .mid files
 * MIDI: ET_[SoundType]_[Title]_[Key].mid
 * Preset: ET_[SoundType]_[Title].ext
 * Construction Kit: Always includes key, even for one-shots
 */
export function generateETFileName(data: FileNamingData): GeneratedFileName {
  const { contentType, soundType, title, bpm, key, fileExtension } = data;

  // Clean and format components
  const cleanTitle = cleanFileName(title);
  const cleanSoundType = cleanFileName(soundType);
  const formattedKey = key && key !== "No Key" ? key : "";

  let fileName = "";
  let basePattern = "";
  let needsVariationCheck = false;

  switch (contentType) {
    case "sample-one-shot":
      // ET_[SoundType]_One_Shot_[Title]_[Key].ext
      fileName = `ET_${cleanSoundType}_One_Shot_${cleanTitle}`;
      if (formattedKey) {
        fileName += `_${formattedKey}`;
      }
      basePattern = `ET_${cleanSoundType}_One_Shot_${cleanTitle}`;
      break;

    case "sample-loop":
      // ET_[BPM]_[SoundType]_Loop_[Title]_[Key].ext
      fileName = `ET_${bpm || "XXX"}_${cleanSoundType}_Loop_${cleanTitle}`;
      if (formattedKey) {
        fileName += `_${formattedKey}`;
      }
      basePattern = `ET_${bpm || "XXX"}_${cleanSoundType}_Loop_${cleanTitle}`;
      break;

    case "sample-loop-midi":
      // Same name for both .wav and .mid files
      // ET_[BPM]_[SoundType]_Loop_[Title]_[Key].ext
      fileName = `ET_${bpm || "XXX"}_${cleanSoundType}_Loop_${cleanTitle}`;
      if (formattedKey) {
        fileName += `_${formattedKey}`;
      }
      basePattern = `ET_${bpm || "XXX"}_${cleanSoundType}_Loop_${cleanTitle}`;
      break;

    case "midi":
      // ET_[SoundType]_[Title]_[Key].mid
      fileName = `ET_${cleanSoundType}_${cleanTitle}`;
      if (formattedKey) {
        fileName += `_${formattedKey}`;
      }
      basePattern = `ET_${cleanSoundType}_${cleanTitle}`;
      break;

    case "preset":
      // ET_[SoundType]_[Title].ext
      fileName = `ET_${cleanSoundType}_${cleanTitle}`;
      basePattern = `ET_${cleanSoundType}_${cleanTitle}`;
      break;

    case "construction-kit":
      needsVariationCheck = true;
      // Always include key for construction kits
      const constructionKey = formattedKey || "Nokey";

      // Determine the specific construction kit type
      if (soundType.includes("full")) {
        // Full Loop: ET_[BPM]_Full_Loop_[Title]_[Key].wav
        fileName = `ET_${
          bpm || "XXX"
        }_Full_Loop_${cleanTitle}_${constructionKey}`;
        basePattern = `ET_${bpm || "XXX"}_Full_Loop_${cleanTitle}`;
      } else if (soundType.includes("loop")) {
        // Sample Loop: ET_[BPM]_[SoundType]_Loop_[Title]_[Key].ext
        fileName = `ET_${
          bpm || "XXX"
        }_${cleanSoundType}_Loop_${cleanTitle}_${constructionKey}`;
        basePattern = `ET_${bpm || "XXX"}_${cleanSoundType}_Loop_${cleanTitle}`;
      } else {
        // Sample One-Shot: ET_[BPM]_[SoundType]_[Title]_[Key].ext
        fileName = `ET_${
          bpm || "XXX"
        }_${cleanSoundType}_${cleanTitle}_${constructionKey}`;
        basePattern = `ET_${bpm || "XXX"}_${cleanSoundType}_${cleanTitle}`;
      }
      break;

    default:
      // Fallback
      fileName = `ET_${cleanSoundType}_${cleanTitle}`;
      basePattern = fileName;
  }

  return {
    newFileName: `${fileName}.${fileExtension}`,
    needsVariationCheck,
    basePattern,
  };
}

/**
 * Generates variation filename with indexed suffix
 * ET_127_Arp_Loop_Amalgam_01_Cmin.wav
 */
export function generateVariationFileName(
  basePattern: string,
  variationIndex: number,
  key: string,
  fileExtension: string
): string {
  const paddedIndex = variationIndex.toString().padStart(2, "0");
  const formattedKey = key && key !== "No Key" ? key : "";

  let fileName = `${basePattern}_${paddedIndex}`;
  if (formattedKey) {
    fileName += `_${formattedKey}`;
  }

  return `${fileName}.${fileExtension}`;
}

/**
 * Clean filename components by removing special characters and spaces
 */
function cleanFileName(input: string): string {
  return (
    input
      .trim()
      .replace(/[^a-zA-Z0-9\s-_]/g, "") // Remove special characters except spaces, hyphens, underscores
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/_+/g, "_") // Replace multiple underscores with single
      .replace(/^_|_$/g, "") || // Remove leading/trailing underscores
    "Untitled"
  );
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex > -1
    ? fileName.substring(lastDotIndex + 1).toLowerCase()
    : "";
}

/**
 * Extract base filename without extension
 */
export function getBaseFileName(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex > -1 ? fileName.substring(0, lastDotIndex) : fileName;
}

/**
 * Check if a file needs MIDI counterpart (for Sample Loop+MIDI)
 */
export function needsMidiCounterpart(
  contentType: string,
  fileExtension: string
): boolean {
  return contentType === "sample-loop-midi" && !fileExtension.match(/^midi?$/i);
}

/**
 * Generate MIDI counterpart filename
 */
export function generateMidiCounterpart(audioFileName: string): string {
  const baseName = getBaseFileName(audioFileName);
  return `${baseName}.mid`;
}

/**
 * Validate file extension against content type
 */
export function validateFileExtension(
  contentType: string,
  fileExtension: string
): boolean {
  const audioExtensions = ["wav", "mp3", "aif", "aiff", "flac", "m4a", "ogg"];
  const midiExtensions = ["mid", "midi"];
  const presetExtensions = ["fxp", "serumpreset", "h2p"];

  switch (contentType) {
    case "sample-one-shot":
    case "sample-loop":
    case "construction-kit":
      return audioExtensions.includes(fileExtension);

    case "sample-loop-midi":
      return (
        audioExtensions.includes(fileExtension) ||
        midiExtensions.includes(fileExtension)
      );

    case "midi":
      return midiExtensions.includes(fileExtension);

    case "preset":
      return presetExtensions.includes(fileExtension);

    default:
      return true; // Allow all for unknown types
  }
}

/**
 * Get expected file extensions for content type
 */
export function getExpectedExtensions(contentType: string): string[] {
  switch (contentType) {
    case "sample-one-shot":
    case "sample-loop":
    case "construction-kit":
      return ["wav", "mp3", "aif", "aiff", "flac", "m4a", "ogg"];

    case "sample-loop-midi":
      return ["wav", "mp3", "aif", "aiff", "flac", "m4a", "ogg", "mid", "midi"];

    case "midi":
      return ["mid", "midi"];

    case "preset":
      return ["fxp", "serumpreset", "h2p"];

    default:
      return [];
  }
}
