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
- **58 Images Total**: image_1.jpeg through image_58.jpeg
- **Dual Format**: Thumbnails (gallery) + Full-res (lightbox)
- **Naming Convention**: Sequential numbering, consistent format

### Adding New Images
1. Add full-resolution image to `/images/` directory
2. Create optimized thumbnail in `/thumbnails/` directory
3. Update `IMAGES` array in JavaScript with new entry
4. Maintain consistent naming pattern

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
- ✅ Preserve mobile natural aspect ratio behavior
- ✅ Keep desktop CLS improvements isolated to `@media (min-width: 769px)`
- ✅ Test changes across all breakpoints (360px to 1120px+)
- ✅ Maintain the ROW_PATTERN for consistent gallery rhythm
- ✅ Preserve the fade-in effect for smooth user experience

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

### Adding Images
```javascript
// Add to IMAGES array
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