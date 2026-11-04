# Xiaohan Zhang Photography Portfolio - AI/LLM Steering Guide

## Project Overview

This is a high-performance, responsive photography portfolio website for Xiaohan Zhang, a Seattle-based photographer, chef, and digital marketer. The site showcases 58 photographs in a custom-built, dynamic gallery layout optimized for both desktop and mobile viewing experiences.

## Core Architecture

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **No Frameworks**: Intentionally built without React, Vue, or other frameworks
- **No External Libraries**: Custom lightbox, layout engine, and responsive system
- **Performance-First**: Optimized for Core Web Vitals and mobile performance

### File Structure
```
/
├── index.html              # Single-page application
├── update-gallery.js       # Gallery automation script (Node.js)
├── /images/               # Full-resolution images (59 files)
├── /thumbnails/           # Optimized thumbnails for gallery display
├── CNAME                  # GitHub Pages domain configuration
└── README.md              # Project documentation
```

## Critical Design Principles

### 1. Performance Optimization
- **Image Loading Strategy**: Thumbnails for gallery, full-res for lightbox
- **Lazy Loading**: Images beyond the first 6 use `loading="lazy"`
- **Priority Loading**: First 4 images use `fetchpriority="high"`
- **Preloading**: Critical above-the-fold images are preloaded in `<head>`
- **CLS Improvements**: Desktop-only min-height and aspect-ratio constraints

### 2. Responsive Design Philosophy
- **Desktop (>768px)**: Dynamic grid layout with calculated aspect ratios
- **Mobile (≤768px)**: Single-column, natural aspect ratio preservation
- **Breakpoints**: 1024px, 768px, 480px, 360px with progressive enhancement

### 3. User Experience Priorities
- **Gallery Fade-in**: Smooth opacity transition when layout is complete
- **Hover Effects**: Scale transforms and overlay reveals on desktop
- **Lightbox**: Click any image for full-screen viewing with Escape key support
- **Navigation**: Floating back-to-top button on mobile, inline on desktop

## Core JavaScript Functions

### Gallery System
1. **`generateGallery()`**: Creates DOM structure based on ROW_PATTERN
2. **`layoutRow()`**: Calculates and applies optimal image dimensions
3. **`calculateRowLayout()`**: Mathematical layout algorithm for desktop
4. **`layoutGallery()`**: Orchestrates the entire gallery layout process

### Image Management
- **`loadImage()`**: Promise-based image loading with dimension extraction
- **Dynamic Aspect Ratios**: Each image maintains its natural proportions
- **Loading States**: Visual feedback with pulse and shimmer animations

### Interactive Features
- **`initSimpleLightbox()`**: Custom lightbox implementation
- **Keyboard Navigation**: Escape key closes lightbox
- **Responsive Handlers**: Debounced resize events for layout recalculation

## Configuration Constants

```javascript
const TARGET_HEIGHT = 400;        // Desktop row target height (px)
const GAP = 7;                   // Space between images (px)
const ROW_PATTERN = [4, 2, 3, 4, 3]; // Images per row cycle
```

## Critical CSS Classes

### Layout Classes
- `.gallery`: Main container with fade-in behavior
- `.gallery-row`: Flex container for desktop, block for mobile
- `.gallery-item`: Individual image container with hover states
- `.gallery-item.loading`: Loading state with animations

### Responsive Modifiers
- Desktop CLS improvements only apply to `@media (min-width: 769px)`
- Mobile styles override desktop at `@media (max-width: 768px)`
- Progressive breakpoints for smaller screens

## Image Asset Management

### Current Structure
- **59 Images Total**: image_1.jpeg through image_59.jpeg
- **Dual Format**: Thumbnails (gallery) + Full-res (lightbox)
- **Naming Convention**: Sequential numbering, consistent format
- **Thumbnail Specs**: 600px max dimension, 85% JPEG quality, EXIF stripped

### Gallery Update Script (Automated Workflow)

The `update-gallery.js` script automates the process of adding new images to the portfolio, including automatic thumbnail generation and code updates.

#### Requirements
- Node.js installed (check with `node --version`)
- ImageMagick installed (check with `magick --version`)
- Images follow naming pattern: `image_N.jpeg`

#### Automated Workflow

**Step 1: Add New Images**
```bash
# Add full-resolution images to /images folder with ANY filename
cp my-new-photos/*.jpeg images/

# If adding with sequential names already:
cp photo1.jpeg images/image_60.jpeg
cp photo2.jpeg images/image_61.jpeg
```

**Step 2: (Optional) Reorder by Date**
```bash
# If you want to sort chronologically by EXIF date taken:
node reorder-by-date.js --dry-run  # Preview first
node reorder-by-date.js            # Execute reordering

# This accepts ANY .jpeg filename and:
# 1. Reads EXIF DateTimeOriginal (or file date as fallback)
# 2. Sorts images chronologically (oldest → newest)
# 3. Renames to image_1.jpeg, image_2.jpeg, etc.
# 4. Creates backup automatically before changes
```

**Step 3: Update Gallery**
```bash
# Preview changes without modifying files
node update-gallery.js --dry-run

# Actually run the update
node update-gallery.js
```

**What the scripts do:**
- **`reorder-by-date.js`**: One-time utility to establish chronological order
  - Accepts any `.jpeg` filename (not just `image_N.jpeg`)
  - Reads EXIF metadata for date taken
  - Renames to sequential pattern in date order
  - Creates automatic backup with revert capability
  
- **`update-gallery.js`**: Regular workflow for gallery updates
  - Scans `/images` folder for `image_N.jpeg` files
  - Auto-generates missing thumbnails (600px max, 85% quality)
  - Updates the IMAGES array in `index.html`
  - Validates all image pairs

**Step 4: Commit and Deploy**
```bash
git add index.html thumbnails/ images/
git commit -m "Add new photos from [month]"
git push
```

#### Reorder Script (One-Time Use)

**When to use:** After initially adding photos with arbitrary filenames, or when you want to re-sort existing images by date taken.

**Safety features:**
- ✅ Automatic backup creation
- ✅ Dry-run mode to preview changes
- ✅ Revert capability if something goes wrong
- ✅ Two-step renaming to prevent conflicts

**Example workflow with arbitrary filenames:**
```bash
# Drop photos with any names into /images
cp ~/Desktop/vacation.jpeg images/
cp ~/Desktop/DSC_1234.jpeg images/
cp ~/Desktop/my-photo.jpeg images/

# Preview the reordering
node reorder-by-date.js --dry-run

# Shows:
# OLD NAME              →  NEW NAME              DATE
# ──────────────────────────────────────────────────────
# vacation.jpeg        →  image_1.jpeg          5/15/2023
# DSC_1234.jpeg        →  image_2.jpeg          6/20/2023
# my-photo.jpeg        →  image_3.jpeg          7/1/2023

# Execute if order looks correct
node reorder-by-date.js

# Update gallery
node update-gallery.js
```

**Revert if needed:**
```bash
node reorder-by-date.js --revert
node update-gallery.js
```

**Date detection logic:**
1. **EXIF DateTimeOriginal** (actual photo capture time)
2. **File modification date** (fallback if EXIF missing)

**After reordering:** You typically won't need this script again. Just add new images with sequential names going forward.

#### Script Output Example
```
🖼️  Gallery Update Script

📂 Scanning directories...
   Found 59 thumbnails
   Found 60 full-size images

🎨 Generating missing thumbnails...
   Creating image_60.jpeg... ✓

✓ Generated 1/1 thumbnails
✅ Successfully updated index.html

✨ Done! Your gallery now has 60 images.
```

#### Thumbnail Generation Specs
The script generates thumbnails matching your existing specs:
- **Max dimension**: 600px (longest side, maintains aspect ratio)
- **Quality**: 85% JPEG compression
- **Optimization**: EXIF data stripped for smaller file size
- **Typical size**: 15-70 KB per thumbnail

#### Manual Workflow (Legacy)

If you need to add images manually without the script:

1. Add full-resolution image to `/images/` directory
2. Create optimized thumbnail manually:
   ```bash
   magick images/image_60.jpeg -resize 600x600 -quality 85 -strip thumbnails/image_60.jpeg
   ```
3. Update `IMAGES` array in `index.html`:
   ```javascript
   {
       src: "./thumbnails/image_60.jpeg",
       fullSrc: "./images/image_60.jpeg",
       alt: "Description for accessibility",
       title: "Optional overlay text",
   }
   ```
4. Maintain consistent naming pattern

#### Script Configuration

Edit the `CONFIG` object in `update-gallery.js` to customize:
```javascript
const CONFIG = {
    imagesDir: './images',
    thumbnailsDir: './thumbnails',
    indexFile: './index.html',
    imagePattern: /^image_\d+\.jpeg$/,
    thumbnailMaxDimension: 600,
    thumbnailQuality: 85,
};
```

#### Troubleshooting

**"No images found"**
- Verify images follow pattern: `image_N.jpeg` (not `.jpg`)
- Check they're in the `/images` folder

**"ImageMagick not found"**
- Install with: `brew install imagemagick`
- Verify with: `magick --version`

**"Could not find IMAGES array"**
- Ensure `index.html` contains: `// IMAGES array with thumbnails...`
- Script looks for this exact comment

#### Benefits of Automated Workflow

**Time Savings:**
- Before: 5-10 minutes of manual code editing per update
- After: 10 seconds running one command

**Safety Features:**
- Dry-run mode to preview changes
- Validates image pairs before updating
- Only modifies IMAGES array, nothing else
- Automatic error detection and reporting

**Quality Assurance:**
- No typos in filenames
- No forgotten thumbnails
- Consistent thumbnail specifications
- Automatic validation of naming conventions

## Performance Considerations

### Critical Optimizations
- **Above-the-fold Priority**: First 6 images load eagerly
- **Preload Strategy**: Critical images preloaded in document head
- **Layout Calculation**: Desktop-only to preserve mobile performance
- **Fade-in Timing**: Gallery hidden until layout complete to prevent CLS

### Mobile-Specific Optimizations
- **Natural Aspect Ratios**: No forced dimensions on mobile
- **Simplified Layout**: Block display, no complex calculations
- **Touch-Friendly**: Larger tap targets, no hover effects
- **Bandwidth Conscious**: Lazy loading for off-screen content

## Modification Guidelines

### DO's
- ✅ Maintain the dual-format image system (thumbnails + full-res)
- ✅ Use `update-gallery.js` script for adding new images
- ✅ Preserve mobile natural aspect ratio behavior
- ✅ Keep desktop CLS improvements isolated to `@media (min-width: 769px)`
- ✅ Test changes across all breakpoints (360px to 1120px+)
- ✅ Maintain the ROW_PATTERN for consistent gallery rhythm
- ✅ Preserve the fade-in effect for smooth user experience
- ✅ Run `--dry-run` mode before making actual changes with the script

### DON'Ts
- ❌ Don't add external JavaScript libraries without explicit approval
- ❌ Don't modify mobile image aspect ratio behavior
- ❌ Don't break the lightbox functionality (depends on `dataset.fullSrc`)
- ❌ Don't remove performance optimizations (preloading, lazy loading)
- ❌ Don't change the single-file architecture
- ❌ Don't modify the Google Analytics implementation

### High-Risk Areas
- **Layout Calculation Functions**: Complex mathematical operations
- **Mobile CSS Overrides**: Carefully balanced responsive behavior
- **Image Loading Logic**: Performance-critical async operations
- **Lightbox Implementation**: Custom event handling and DOM manipulation

## Testing Requirements

### Cross-Device Testing
- **Desktop**: Chrome, Firefox, Safari on macOS/Windows
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Breakpoints**: Test at 360px, 480px, 768px, 1024px, 1200px+

### Performance Validation
- **Core Web Vitals**: LCP, FID, CLS scores
- **Image Loading**: Verify lazy loading and priority loading
- **Layout Stability**: No unexpected shifts during load
- **Responsive Behavior**: Smooth transitions between breakpoints

### Functionality Verification
- **Gallery Layout**: Proper image arrangement and spacing
- **Lightbox**: Click-to-open, Escape-to-close, full-screen display
- **Hover Effects**: Desktop scale transforms and overlay reveals
- **Mobile Navigation**: Floating back-to-top button functionality

## Common Modification Patterns

### Adding Images (Automated)
```bash
# Add full-size images to /images folder
cp new-photo.jpeg images/image_60.jpeg

# Run script to auto-generate thumbnails and update code
node update-gallery.js

# Optionally add metadata by editing index.html
# Add alt text for accessibility and title for hover overlays
```

### Adding Images (Manual)
```javascript
// Add to IMAGES array in index.html
{
    src: "./thumbnails/image_59.jpeg",
    fullSrc: "./images/image_59.jpeg",
    alt: "Description",
    title: "Optional overlay text",
}
```

### Adjusting Layout
```javascript
// Modify ROW_PATTERN for different arrangements
const ROW_PATTERN = [3, 2, 4, 3, 2]; // Example alternative
```

### Performance Tuning
```javascript
// Adjust loading priorities
const fetchPriority = imageIndex < 6 ? "high" : "low";
const loadingAttr = imageIndex < 8 ? "eager" : "lazy";
```

## Local Development

### Testing Changes Locally

**Option 1: Simple File Open (Fastest)**
```bash
open index.html
```

**Option 2: Python Server**
```bash
python3 -m http.server 8000
# Then open: http://localhost:8000
```

**Option 3: PHP Server**
```bash
php -S localhost:8000
# Then open: http://localhost:8000
```

Since this is a static site, Option 1 works perfectly for testing changes before deploying.

## Deployment Notes

- **GitHub Pages**: Hosted on GitHub Pages with custom domain
- **CNAME Configuration**: Domain routing handled by CNAME file
- **Static Assets**: All images served from same domain
- **No Build Process**: Direct deployment of source files

## Contact Information

- **Owner**: Xiaohan Zhang
- **Email**: xiaohan.zhang14@gmail.com
- **Instagram**: @justxiaohan
- **Domain**: Configured via CNAME file

---

## Emergency Rollback

If changes break functionality:
```bash
git reset --hard [previous-commit-hash]
git push --force origin master
```

Always test thoroughly before deploying changes to this production photography portfolio.