# Pack-Based Sample Selling System

This document outlines the complete implementation of the pack-based selling system for Ethereal Techno.

## Overview

The system has been completely transformed from selling individual samples to selling **sample packs**. Here's what changed:

### Key Changes

1. **Samples are now grouped into packs** - Individual samples cannot be purchased separately
2. **Packs are the sellable units** - Users buy entire packs, not individual samples
3. **Each pack has a preview track** - A demo song created using the pack's samples
4. **Pack creation workflow** - Producers can group their uploaded samples into packs

## Database Schema Changes

### New Pack Model
```prisma
model Pack {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String?
  category    String
  price       Float
  
  // Pack preview (song made with the pack)
  previewUrl     String?
  previewKey     String? // S3 key for the preview audio
  
  // Pack metadata
  bpm            Int?
  key            String?
  totalSamples   Int     @default(0)
  totalDuration  Float   @default(0)
  
  // Pack artwork
  artworkUrl String?
  artworkKey String? // S3 key for artwork
  
  // Tags
  styleTags        String[] @default([])
  moodTags         String[] @default([])
  processingTags   String[] @default([])
  soundDesignTags  String[] @default([])
  
  plays       Int      @default(0)
  sales       Int      @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  producerId String @db.ObjectId
  producer   User   @relation(fields: [producerId], references: [id])
  samples    Sample[] // Samples in this pack
  
  // Cart and purchase relations
  cartItems        CartItem[]
  orderItems       OrderItem[]
  guestCarts       GuestCart[]
  purchasedSamples PurchasedSample[]
}
```

### Updated Sample Model
```prisma
model Sample {
  // ... existing fields ...
  
  // Pack relation - samples belong to packs
  packId String? @db.ObjectId
  pack   Pack?   @relation(fields: [packId], references: [id])
  
  // Removed individual selling capabilities:
  // - No direct cart relations
  // - No individual pricing
  // - Only sold as part of packs
}
```

### Updated Cart/Purchase Models
All cart and purchase models now reference `packId` instead of `sampleId`:
- `CartItem.packId`
- `GuestCart.packId` 
- `OrderItem.packId`
- `PurchasedSample.packId`

## New Features

### 1. Pack Creation (`/packs/create`)
- **For producers only**
- Select multiple uploaded samples to group into a pack
- Upload preview track (demo song using the pack)
- Upload optional pack artwork
- Set pack metadata (title, description, price, BPM, key)
- Tag the pack with style, mood, processing, and sound design tags
- Only samples not already in a pack can be selected

### 2. Pack Browsing (`/packs`)
- Browse all available packs
- Filter by category
- Search by pack name, description, or producer
- Sort by latest, most played, best selling, price, alphabetical
- Each pack shows:
  - Artwork or default music icon
  - Pack title and producer
  - Number of samples included
  - Category and BPM/key if available
  - Style tags preview
  - Price and "Add to Cart" button
  - Play/pause preview functionality

### 3. Pack Detail Page (`/packs/[id]`)
- **Large artwork display** with play/pause overlay
- **Preview player** - plays the demo track made with the pack
- **Complete pack information**:
  - Title, producer, category
  - BPM, key, total duration
  - All tag categories with color coding
  - Description
- **Purchase section** with price and "Add to Cart"
- **Producer information** with link to producer page
- **Complete sample list** showing all samples included:
  - Sample titles with numbering
  - Content type, sound group, duration
  - Individual BPM/key for each sample
  - Sample-specific tags

### 4. Updated Cart System
- Cart now handles packs instead of individual samples
- Shows pack title, producer, preview URL
- Updated cart APIs (`/api/cart`, `/api/guest-cart`)
- Checkout process updated for packs

### 5. Updated Navigation
- Main browse link now goes to `/packs` instead of `/samples`
- Producer navigation includes "Create Pack" link
- Homepage updated to promote pack browsing

## API Endpoints

### Pack Management
- `GET /api/packs` - List packs with filtering and pagination
- `POST /api/packs/create` - Create new pack (producers only)
- `GET /api/packs/[id]` - Get pack details with samples
- `GET /api/samples/my-samples` - Get producer's unpacked samples

### Updated Cart APIs
- `POST /api/cart` - Add pack to cart (requires `packId`)
- `POST /api/guest-cart` - Add pack to guest cart (requires `packId`)
- Cart responses now include pack information

### Updated Checkout
- `POST /api/checkout` - Create Stripe session for packs
- Validates packs exist and uses pack pricing
- Stripe metadata includes `packId` instead of `sampleId`

## File Structure

```
app/
├── packs/
│   ├── page.tsx                 # Pack browsing page
│   ├── create/
│   │   └── page.tsx            # Pack creation form
│   └── [id]/
│       └── page.tsx            # Pack detail page
├── api/
│   ├── packs/
│   │   ├── route.ts            # List packs
│   │   ├── create/
│   │   │   └── route.ts        # Create pack
│   │   └── [id]/
│   │       └── route.ts        # Get pack details
│   ├── samples/
│   │   └── my-samples/
│   │       └── route.ts        # Get producer samples
│   ├── cart/
│   │   └── route.ts            # Updated for packs
│   ├── guest-cart/
│   │   └── route.ts            # Updated for packs
│   └── checkout/
│       └── route.ts            # Updated for packs
```

## User Workflows

### Producer Workflow
1. **Upload individual samples** (`/upload`) - unchanged
2. **Create packs** (`/packs/create`):
   - Select uploaded samples (not already in packs)
   - Add pack metadata (title, description, price, category)
   - Upload preview track (demo song using the pack)
   - Optionally upload pack artwork
   - Tag the pack appropriately
   - Submit to create the pack
3. **Manage packs** - view pack performance, edit details

### Buyer Workflow
1. **Browse packs** (`/packs`):
   - Filter by category or search
   - Preview packs by playing demo tracks
   - Add interesting packs to cart
2. **View pack details** (`/packs/[id]`):
   - See complete pack information
   - View all included samples
   - Play preview track
   - Add to cart or buy directly
3. **Purchase process**:
   - Review cart with selected packs
   - Provide email if guest checkout
   - Complete payment via Stripe
   - Receive download links for all samples in purchased packs

## Benefits of Pack System

### For Producers
- **Higher revenue** - sell collections instead of individual samples
- **Better branding** - showcase musical style through complete packs
- **Preview tracks** - demonstrate how samples work together
- **Reduced complexity** - manage fewer products with higher value

### For Buyers
- **Complete collections** - get everything needed for a track
- **Better value** - pay once for multiple related samples
- **Preview experience** - hear how samples sound in context
- **Cohesive style** - samples in a pack work well together

### For Platform
- **Higher average order value** - packs cost more than individual samples
- **Better user experience** - easier browsing and discovery
- **Reduced complexity** - fewer products to manage
- **Improved conversion** - preview tracks help buyers make decisions

## Migration Notes

- **Existing samples** remain in database but are not directly sellable
- **Cart data was cleared** during migration to avoid conflicts
- **New pack creation** required for all future sales
- **APIs updated** to use `packId` instead of `sampleId`
- **UI completely updated** to focus on packs instead of samples

This pack-based system provides a more professional and user-friendly experience for both producers and buyers while increasing the platform's revenue potential.
