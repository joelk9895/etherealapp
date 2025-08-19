# ET File Naming System Implementation

## Overview

Successfully implemented the Ethereal Techno (ET) automatic file naming system that generates standardized file names based on content type, metadata, and user input.

## Implementation Features

### 🎯 **Complete File Naming Coverage**

✅ **Sample One-Shot**: `ET_[SoundType]_One_Shot_[Title]_[Key].ext`  
✅ **Sample Loop**: `ET_[BPM]_[SoundType]_Loop_[Title]_[Key].ext`  
✅ **Sample Loop+MIDI**: Same base name for both .wav and .mid files  
✅ **MIDI**: `ET_[SoundType]_[Title]_[Key].mid`  
✅ **Preset**: `ET_[SoundType]_[Title].ext`  
✅ **Construction Kit**: Always includes key, with variation handling

### 🔧 **Smart Features**

- **Real-time preview** of generated file names
- **Variation detection** for Construction Kits (\_01, \_02, etc.)
- **Input validation** and cleaning (removes special characters)
- **Missing data warnings** (BPM for loops, Key for MIDI)
- **File extension validation** by content type

## Example File Names Generated

### Sample One-Shot

```
Input: "Bass Square" (Gmin)
Output: ET_Bass_One_Shot_Square_Gmin.wav

Input: "Kick 808db" (no key)
Output: ET_Kick_One_Shot_808db.wav
```

### Sample Loop

```
Input: "Bass Chatter" (130 BPM, Fmaj)
Output: ET_130_Bass_Loop_Chatter_Fmaj.wav

Input: "Kick Abyss" (127 BPM, no key)
Output: ET_127_Kick_Loop_Abyss.wav
```

### Sample Loop+MIDI

```
Input: "Arp Amalgam" (122 BPM, Cmin)
Output: ET_122_Arp_Loop_Amalgam_Cmin.wav
        ET_122_Arp_Loop_Amalgam_Cmin.mid
```

### MIDI

```
Input: "Pluck Malta" (Cmin)
Output: ET_Pluck_Malta_Cmin.mid
```

### Preset

```
Input: "Bass Dark And Subby" (Serum)
Output: ET_Bass_Dark_And_Subby.fxp
```

### Construction Kit

```
Input: "Full Loop Amalgam" (127 BPM, Cmin)
Output: ET_127_Full_Loop_Amalgam_Cmin.wav

With variations:
First: ET_127_Arp_Loop_Amalgam_01_Cmin.wav
Second: ET_127_Arp_Loop_Amalgam_02_Cmin.wav
```

## File Structure

```
app/upload/
├── utils/
│   └── fileNaming.ts          # Core naming logic
├── components/
│   ├── FileNamePreview.tsx    # Real-time preview component
│   ├── DetailsForm.tsx        # Updated with preview integration
│   └── ...
└── page.tsx                   # Updated with ET naming integration
```

## Key Functions

### `generateETFileName(data: FileNamingData)`

Main function that generates ET file names based on content type and metadata.

### `generateVariationFileName(basePattern, index, key, extension)`

Handles variation naming for Construction Kits with \_01, \_02 suffixes.

### `validateFileExtension(contentType, extension)`

Validates file extensions against expected types for each content category.

### `cleanFileName(input)`

Sanitizes input strings by removing special characters and formatting for file names.

## UI Integration

### Real-Time Preview

- Shows generated file names as user types
- Updates immediately when metadata changes
- Warns about missing required fields (BPM, Key)
- Displays variation handling notifications

### Validation Warnings

- **Missing BPM**: For loop files requiring BPM
- **Missing Key**: For MIDI files requiring key
- **File Extension**: Invalid extensions for content type
- **Variation Check**: For Construction Kit duplicate detection

## Backend Integration

The upload function now sends additional data to the backend:

- `originalFileName`: User's original file name
- `generatedFileName`: ET-generated file name
- `needsVariationCheck`: Boolean for duplicate detection
- `basePattern`: Base pattern for variation matching

## Usage Example

```typescript
// Example usage in upload workflow
const namingData: FileNamingData = {
  contentType: "sample-loop",
  soundType: "bass",
  title: "Deep Foundation",
  bpm: 128,
  key: "Amin",
  originalFileName: "user_bass_file.wav",
  fileExtension: "wav",
};

const result = generateETFileName(namingData);
// Result: "ET_128_Bass_Loop_Deep_Foundation_Amin.wav"
```

## Benefits

1. **Consistency**: All ET files follow standardized naming conventions
2. **Organization**: Easy to identify content type, BPM, key, and sound type
3. **Automation**: No manual file renaming required
4. **Validation**: Prevents naming conflicts and ensures required metadata
5. **User Experience**: Real-time preview helps users understand the system
6. **Scalability**: Easy to extend for new content types or naming rules

## Next Steps

1. **Backend Implementation**: Update upload API to handle variation detection
2. **Duplicate Management**: Implement server-side logic for \_01, \_02 suffixes
3. **Database Schema**: Store both original and generated file names
4. **File Organization**: Organize uploaded files by content type and metadata
5. **Search Enhancement**: Use structured naming for better content discovery

The ET file naming system is now fully integrated into the upload workflow and provides a professional, automated approach to content organization.
