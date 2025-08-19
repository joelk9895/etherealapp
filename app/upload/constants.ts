import { ContentType, SoundGroup, SoundType } from "./types";

export const contentTypes: ContentType[] = [
  { id: "sample-one-shot", label: "Sample One-Shot", icon: "🎵" },
  { id: "sample-loop", label: "Sample Loop", icon: "🔄" },
  { id: "sample-loop-midi", label: "Sample Loop+MIDI", icon: "🎹" },
  { id: "midi", label: "MIDI", icon: "📝" },
  { id: "preset", label: "Preset", icon: "⚙️" },
  { id: "construction-kit", label: "Construction Kit", icon: "🔧" },
];

export const soundGroups: SoundGroup[] = [
  { id: "melodic-harmonic", label: "Melodic & Harmonic Element", icon: "🎶" },
  { id: "drums-percussion", label: "Drums & Percussion", icon: "🥁" },
  { id: "atmospheric-fx", label: "Atmospheric & FX Content", icon: "🌊" },
  { id: "vocals", label: "Vocals", icon: "🎤" },
];

// MIDI sound types (for melodic MIDI files only)
export const getMidiSoundTypes = (): SoundType[] => {
  return [
    {
      id: "arp",
      label: "Arp",
      description: "Arpeggiated MIDI sequences",
      icon: "🎵",
    },
    {
      id: "bass",
      label: "Bass",
      description: "Low-frequency MIDI foundation",
      icon: "🎵",
    },
    {
      id: "bell",
      label: "Bell",
      description: "Metallic tonal MIDI",
      icon: "🔔",
    },
    {
      id: "chord",
      label: "Chord",
      description: "Harmonic MIDI progressions",
      icon: "🎹",
    },
    {
      id: "drone",
      label: "Drone",
      description: "Sustained continuous MIDI tones",
      icon: "〰️",
    },
    { id: "lead", label: "Lead", description: "Melodic lead MIDI", icon: "🎸" },
    {
      id: "pad",
      label: "Pad",
      description: "Atmospheric sustained MIDI",
      icon: "🌊",
    },
    {
      id: "piano",
      label: "Piano",
      description: "Piano MIDI patterns",
      icon: "🎹",
    },
    {
      id: "pluck",
      label: "Pluck",
      description: "Short melodic MIDI attacks",
      icon: "🪕",
    },
    {
      id: "riser",
      label: "Riser",
      description: "Building tension MIDI",
      icon: "📈",
    },
    {
      id: "stab",
      label: "Stab",
      description: "Sharp melodic MIDI accents",
      icon: "⚡",
    },
    {
      id: "sub",
      label: "Sub",
      description: "Sub-bass frequency MIDI",
      icon: "🔈",
    },
    {
      id: "sub-drop",
      label: "Sub Drop",
      description: "Low-frequency MIDI drops",
      icon: "⬇️",
    },
    {
      id: "sweep",
      label: "Sweep",
      description: "Frequency sweep MIDI effects",
      icon: "🌪️",
    },
    {
      id: "synth",
      label: "Synth",
      description: "Electronic synthesized MIDI",
      icon: "🔊",
    },
    {
      id: "tonal-fx",
      label: "Tonal Fx",
      description: "Tonal effect MIDI",
      icon: "🎭",
    },
  ];
};

// Sound types for each sound group - dynamically generated based on content type
export const getSoundTypes = (
  contentType: string
): Record<string, SoundType[]> => {
  const isLoop =
    contentType === "sample-loop" || contentType === "sample-loop-midi";

  return {
    "melodic-harmonic": [
      {
        id: isLoop ? "arp-loop" : "arp",
        label: isLoop ? "Arp Loop" : "Arp",
        description: isLoop
          ? "Arpeggiated loop patterns"
          : "Arpeggiated sequences",
        icon: "🎵",
      },
      {
        id: isLoop ? "bass-loop" : "bass",
        label: isLoop ? "Bass Loop" : "Bass",
        description: isLoop
          ? "Low-frequency foundation loops"
          : "Low-frequency foundation sounds",
        icon: "🎵",
      },
      {
        id: isLoop ? "bell-loop" : "bell",
        label: isLoop ? "Bell Loop" : "Bell",
        description: isLoop ? "Metallic tonal loops" : "Metallic tonal sounds",
        icon: "🔔",
      },
      {
        id: isLoop ? "chord-loop" : "chord",
        label: isLoop ? "Chord Loop" : "Chord",
        description: isLoop
          ? "Harmonic progression loops"
          : "Harmonic progressions",
        icon: "🎹",
      },
      {
        id: isLoop ? "drone-loop" : "drone",
        label: isLoop ? "Drone Loop" : "Drone",
        description: isLoop
          ? "Sustained continuous tone loops"
          : "Sustained continuous tones",
        icon: "〰️",
      },
      {
        id: isLoop ? "lead-loop" : "lead",
        label: isLoop ? "Lead Loop" : "Lead",
        description: isLoop ? "Melodic lead loops" : "Melodic lead sounds",
        icon: "🎸",
      },
      {
        id: isLoop ? "pad-loop" : "pad",
        label: isLoop ? "Pad Loop" : "Pad",
        description: isLoop
          ? "Atmospheric sustained loops"
          : "Atmospheric sustained sounds",
        icon: "🌊",
      },
      ...(isLoop
        ? [
            {
              id: "piano-loop",
              label: "Piano Loop",
              description: "Piano loop patterns",
              icon: "🎹",
            },
          ]
        : []),
      {
        id: isLoop ? "pluck-loop" : "pluck",
        label: isLoop ? "Pluck Loop" : "Pluck",
        description: isLoop
          ? "Short melodic attack loops"
          : "Short melodic attacks",
        icon: "🪕",
      },
      {
        id: isLoop ? "stab-loop" : "stab",
        label: isLoop ? "Stab Loop" : "Stab",
        description: isLoop
          ? "Sharp melodic accent loops"
          : "Sharp melodic accents",
        icon: "⚡",
      },
      {
        id: isLoop ? "sub-loop" : "sub",
        label: isLoop ? "Sub Loop" : "Sub",
        description: isLoop
          ? "Sub-bass frequency loops"
          : "Sub-bass frequencies",
        icon: "🔈",
      },
      {
        id: isLoop ? "synth-loop" : "synth",
        label: isLoop ? "Synth Loop" : "Synth",
        description: isLoop
          ? "Electronic synthesized loops"
          : "Electronic synthesized sounds",
        icon: "🔊",
      },
    ],

    "drums-percussion": [
      {
        id: isLoop ? "clap-loop" : "clap",
        label: isLoop ? "Clap Loop" : "Clap",
        description: isLoop ? "Hand clap loops" : "Hand clap sounds",
        icon: "👏",
      },
      {
        id: isLoop ? "claves-loop" : "claves",
        label: isLoop ? "Claves Loop" : "Claves",
        description: isLoop
          ? "Wooden percussion stick loops"
          : "Wooden percussion sticks",
        icon: "🥢",
      },
      {
        id: isLoop ? "cymbal-loop" : "cymbal",
        label: isLoop ? "Cymbal Loop" : "Cymbal",
        description: isLoop ? "Metal crash loops" : "Metal crash sounds",
        icon: "🥽",
      },
      ...(isLoop
        ? [
            {
              id: "drum-loop",
              label: "Drum Loop",
              description: "Complete drum pattern loops",
              icon: "🥁",
            },
          ]
        : []),
      {
        id: isLoop ? "rolls-fills-loop" : "rolls-fills",
        label: isLoop ? "Rolls & Fills Loop" : "Rolls & Fills",
        description: isLoop
          ? "Drum roll and fill loops"
          : "Drum rolls and fill patterns",
        icon: "🌊",
      },
      {
        id: isLoop ? "fx-perc-loop" : "fx-perc",
        label: isLoop ? "Fx Perc Loop" : "Fx Perc",
        description: isLoop
          ? "Processed percussion effect loops"
          : "Processed percussion effects",
        icon: "✨",
      },
      {
        id: isLoop ? "hihat-loop" : "hihat",
        label: isLoop ? "Hihat Loop" : "Hihat",
        description: isLoop ? "Hi-hat cymbal loops" : "Hi-hat cymbal sounds",
        icon: "🎵",
      },
      {
        id: isLoop ? "kick-loop" : "kick",
        label: isLoop ? "Kick Loop" : "Kick",
        description: isLoop ? "Bass drum loops" : "Bass drum sounds",
        icon: "🥁",
      },
      {
        id: isLoop ? "perc-loop" : "perc",
        label: isLoop ? "Perc Loop" : "Perc",
        description: isLoop
          ? "General percussion loops"
          : "General percussion elements",
        icon: "🔨",
      },
      {
        id: isLoop ? "ride-loop" : "ride",
        label: isLoop ? "Ride Loop" : "Ride",
        description: isLoop ? "Ride cymbal loops" : "Ride cymbal sounds",
        icon: "🥁",
      },
      {
        id: isLoop ? "rim-loop" : "rim",
        label: isLoop ? "Rim Loop" : "Rim",
        description: isLoop ? "Rim shot loops" : "Rim shot sounds",
        icon: "⚡",
      },
      {
        id: isLoop ? "shaker-loop" : "shaker",
        label: isLoop ? "Shaker Loop" : "Shaker",
        description: isLoop ? "Shaker percussion loops" : "Shaker percussion",
        icon: "🥤",
      },
      {
        id: isLoop ? "snare-loop" : "snare",
        label: isLoop ? "Snare Loop" : "Snare",
        description: isLoop
          ? "Sharp percussive loops"
          : "Sharp percussive hits",
        icon: "🥁",
      },
      {
        id: isLoop ? "tambourine-loop" : "tambourine",
        label: isLoop ? "Tambourine Loop" : "Tambourine",
        description: isLoop ? "Tambourine jingle loops" : "Tambourine jingles",
        icon: "🪘",
      },
      {
        id: isLoop ? "tom-loop" : "tom",
        label: isLoop ? "Tom Loop" : "Tom",
        description: isLoop ? "Pitched drum loops" : "Pitched drum sounds",
        icon: "🥁",
      },
      ...(isLoop
        ? [
            {
              id: "top-loop",
              label: "Top Loop",
              description: "Top-end percussion loops",
              icon: "🔺",
            },
          ]
        : []),
    ],
    "atmospheric-fx": [
      {
        id: isLoop ? "atmosphere-loop" : "atmosphere",
        label: isLoop ? "Atmosphere Loop" : "Atmosphere",
        description: isLoop
          ? "Ambient background texture loops"
          : "Ambient background textures",
        icon: "🌌",
      },
      {
        id: isLoop ? "impact-loop" : "impact",
        label: isLoop ? "Impact Loop" : "Impact",
        description: isLoop ? "Dramatic hit loops" : "Dramatic hit sounds",
        icon: "💥",
      },
      {
        id: isLoop ? "noise-loop" : "noise",
        label: isLoop ? "Noise Loop" : "Noise",
        description: isLoop
          ? "Textural noise loops"
          : "Textural noise elements",
        icon: "📻",
      },
      {
        id: isLoop ? "riser-loop" : "riser",
        label: isLoop ? "Riser Loop" : "Riser",
        description: isLoop
          ? "Building tension loops"
          : "Building tension sounds",
        icon: "📈",
      },
      {
        id: isLoop ? "sub-drop-loop" : "sub-drop",
        label: isLoop ? "Sub Drop Loop" : "Sub Drop",
        description: isLoop
          ? "Low-frequency drop loops"
          : "Low-frequency drops",
        icon: "⬇️",
      },
      {
        id: isLoop ? "sweep-loop" : "sweep",
        label: isLoop ? "Sweep Loop" : "Sweep",
        description: isLoop
          ? "Frequency sweep effect loops"
          : "Frequency sweep effects",
        icon: "🌪️",
      },
      {
        id: isLoop ? "texture-loop" : "texture",
        label: isLoop ? "Texture Loop" : "Texture",
        description: isLoop
          ? "Ambient textural loops"
          : "Ambient textural layers",
        icon: "🎨",
      },
      {
        id: isLoop ? "tonal-fx-loop" : "tonal-fx",
        label: isLoop ? "Tonal Fx Loop" : "Tonal Fx",
        description: isLoop ? "Tonal effect loops" : "Tonal effect sounds",
        icon: "🎭",
      },
      {
        id: isLoop ? "transition-fx-loop" : "transition-fx",
        label: isLoop ? "Transition Fx Loop" : "Transition Fx",
        description: isLoop
          ? "Transition effect loops"
          : "Transition effect elements",
        icon: "🔄",
      },
    ],
    vocals: [
      {
        id: isLoop ? "spoken-loop" : "spoken",
        label: isLoop ? "Spoken Loop" : "Spoken",
        description: isLoop ? "Spoken word loops" : "Spoken word elements",
        icon: "🗣️",
      },
      {
        id: isLoop ? "vocal-atmosphere-loop" : "vocal-atmosphere",
        label: isLoop ? "Vocal Atmosphere Loop" : "Vocal Atmosphere",
        description: isLoop
          ? "Ambient vocal texture loops"
          : "Ambient vocal textures",
        icon: "🎤",
      },
      {
        id: isLoop ? "vocal-chop-loop" : "vocal-chop",
        label: isLoop ? "Vocal Chop Loop" : "Vocal Chop",
        description: isLoop ? "Chopped vocal loops" : "Chopped vocal samples",
        icon: "✂️",
      },
      {
        id: isLoop ? "vocal-drone-loop" : "vocal-drone",
        label: isLoop ? "Vocal Drone Loop" : "Vocal Drone",
        description: isLoop
          ? "Sustained vocal tone loops"
          : "Sustained vocal tones",
        icon: "〰️",
      },
      {
        id: isLoop ? "vocal-fx-loop" : "vocal-fx",
        label: isLoop ? "Vocal Fx Loop" : "Vocal Fx",
        description: isLoop
          ? "Processed vocal effect loops"
          : "Processed vocal effects",
        icon: "🎛️",
      },
      {
        id: isLoop ? "vocal-pad-loop" : "vocal-pad",
        label: isLoop ? "Vocal Pad Loop" : "Vocal Pad",
        description: isLoop ? "Layered vocal pad loops" : "Layered vocal pads",
        icon: "🌊",
      },
      {
        id: isLoop ? "vocal-phrase-loop" : "vocal-phrase",
        label: isLoop ? "Vocal Phrase Loop" : "Vocal Phrase",
        description: isLoop
          ? "Complete vocal phrase loops"
          : "Complete vocal phrases",
        icon: "🎵",
      },
      {
        id: isLoop ? "whispering-loop" : "whispering",
        label: isLoop ? "Whispering Loop" : "Whispering",
        description: isLoop
          ? "Whispered vocal loops"
          : "Whispered vocal elements",
        icon: "🤫",
      },
    ],
  };
};

// Key options - 12 minor + 12 major + 1 no key = 25 total
export const keyOptions = [
  "Amin",
  "A#min",
  "Bmin",
  "Cmin",
  "C#min",
  "Dmin",
  "D#min",
  "Emin",
  "Fmin",
  "F#min",
  "Gmin",
  "G#min",
  "Amaj",
  "A#maj",
  "Bmaj",
  "Cmaj",
  "C#maj",
  "Dmaj",
  "D#maj",
  "Emaj",
  "Fmaj",
  "F#maj",
  "Gmaj",
  "G#maj",
  "No Key",
];

// Style tags - multiple choices can be selected
export const styleTags = [
  "Cinematic",
  "Dark",
  "Deep",
  "Ethereal",
  "Groovy",
  "Hypnotic",
  "Industrial",
  "Melodic",
  "Noir",
  "Organic",
  "Orchestral",
  "Raw",
  "Ritualistic",
  "Spacey",
  "Tribal",
  "Uplifting",
  "Vintage",
];

// Mood tags (emotional tone) - multiple choices can be selected
export const moodTags = [
  "Cold",
  "Detached",
  "Dreamy",
  "Emotional",
  "Epic",
  "Euphoric",
  "Hopeful",
  "Introspective",
  "Melancholic",
  "Mysterious",
  "Nostalgic",
  "Romantic",
  "Spiritual",
  "Tense",
  "Warm",
];

// Processing tags - multiple choices can be selected
export const processingTags = [
  "Bitcrushed",
  "Compressed",
  "Delay",
  "Distorted",
  "Dry",
  "Filtered",
  "Glitched",
  "Granular",
  "Layered",
  "Modulated",
  "Resampled",
  "Reverse",
  "Reverb",
  "Saturated",
  "Sidechained",
  "Stretched",
  "Tape",
];

// Sound design method tags - multiple choices can be selected
export const soundDesignTags = [
  "Additive",
  "Analog",
  "Digital",
  "Field Recording",
  "Fm Synthesis",
  "Granular",
  "Hybrid",
  "Modular",
  "Physical Modeling",
  "Resampled",
  "Rompler",
  "Sample-Based",
  "Spectral",
  "Subtractive",
  "Vocoded",
  "Wavetable",
];
