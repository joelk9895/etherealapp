export interface ContentType {
  id: string;
  label: string;
  icon: string;
}

export interface SoundGroup {
  id: string;
  label: string;
  icon: string;
}

export interface SoundType {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface FormData {
  description?: string;
  category?: string;
  price?: string;
  tags?: string;
  bpm?: number;
  key?: string;
  styleTags?: string[];
  moodTags?: string[];
  processingTags?: string[];
  soundDesignTags?: string[];
}

export interface ImportedFile {
  id: string;
  name: string;
  duration: number;
  waveform: number[];
  file: File;
  url: string;
}

export interface BatchMetadata {
  name: string;
  bpm: string;
  key: string;
  soundType: string;
}

export interface User {
  id: string;
  userType: string;
  // Add other user properties as needed
}

export type UploadMode = "single" | "batch";
