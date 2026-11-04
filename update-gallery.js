#!/usr/bin/env node

/**
 * Gallery Update Script
 * Automatically scans image directories and updates the IMAGES array in index.html
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    imagesDir: './images',
    thumbnailsDir: './thumbnails',
    indexFile: './index.html',
    imagePattern: /^image_\d+\.jpeg$/,
    thumbnailMaxDimension: 600, // Max width or height for thumbnails
    thumbnailQuality: 85, // JPEG quality (0-100)
};

// Check for dry-run mode
const isDryRun = process.argv.includes('--dry-run');

/**
 * Check if ImageMagick is installed
 */
function checkImageMagick() {
    const { execSync } = require('child_process');
    try {
        execSync('magick --version', { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Generate thumbnail for a single image using ImageMagick
 */
async function generateThumbnail(sourceFile, destFile) {
    const { execSync } = require('child_process');
    const sourcePath = path.join(CONFIG.imagesDir, sourceFile);
    const destPath = path.join(CONFIG.thumbnailsDir, destFile);

    try {
        // Use ImageMagick to resize and optimize
        // -resize: makes longest side 600px, maintains aspect ratio
        // -quality: JPEG compression quality
        // -strip: remove EXIF data for smaller file size
        const command = `magick "${sourcePath}" -resize ${CONFIG.thumbnailMaxDimension}x${CONFIG.thumbnailMaxDimension} -quality ${CONFIG.thumbnailQuality} -strip "${destPath}"`;
        
        execSync(command, { stdio: 'pipe' });
        return true;
    } catch (error) {
        console.error(`   ❌ Failed to generate thumbnail for ${sourceFile}:`, error.message);
        return false;
    }
}

/**
 * Generate missing thumbnails
 */
async function generateMissingThumbnails(missingThumbnails) {
    if (missingThumbnails.length === 0) {
        return true;
    }

    console.log('\n🎨 Generating missing thumbnails...');
    
    let successCount = 0;
    for (const filename of missingThumbnails) {
        process.stdout.write(`   Creating ${filename}... `);
        const success = await generateThumbnail(filename, filename);
        if (success) {
            console.log('✓');
            successCount++;
        } else {
            console.log('✗');
        }
    }

    console.log(`\n✓ Generated ${successCount}/${missingThumbnails.length} thumbnails`);
    return successCount === missingThumbnails.length;
}

/**
 * Scan directory for images matching the pattern
 */
function scanImages(directory) {
    if (!fs.existsSync(directory)) {
        console.error(`❌ Directory not found: ${directory}`);
        return [];
    }

    const files = fs.readdirSync(directory);
    const images = files
        .filter(file => CONFIG.imagePattern.test(file))
        .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
        });

    return images;
}

/**
 * Get image dimensions (for performance optimization)
 */
function getImageDimensions(imagePath) {
    try {
        // For now, return default dimensions
        // Could use image-size library for actual dimensions, but keeping it dependency-free
        return { width: 1920, height: 1280 };
    } catch (error) {
        console.warn(`⚠️  Could not read dimensions for ${imagePath}`);
        return { width: 1920, height: 1280 };
    }
}

/**
 * Generate the IMAGES array as a JavaScript string
 */
function generateImagesArray(imageFiles) {
    const imagesArray = imageFiles.map(filename => {
        return `            {
                src: "./thumbnails/${filename}",
                fullSrc: "./images/${filename}",
                alt: "",
                title: "",
            }`;
    });

    return `// IMAGES array with thumbnails for display and full-res for lightbox
        const IMAGES = [
${imagesArray.join(',\n')}
        ];`;
}

/**
 * Update index.html with new IMAGES array
 */
function updateIndexFile(newImagesArray) {
    const indexPath = CONFIG.indexFile;
    
    if (!fs.existsSync(indexPath)) {
        console.error(`❌ File not found: ${indexPath}`);
        process.exit(1);
    }

    let content = fs.readFileSync(indexPath, 'utf8');

    // Find and replace the IMAGES array
    // Pattern matches: const IMAGES = [ ... ];
    const imagesPattern = /\/\/ IMAGES array[^\n]*\n\s*const IMAGES = \[[\s\S]*?\n\s*\];/;
    
    if (!imagesPattern.test(content)) {
        console.error('❌ Could not find IMAGES array in index.html');
        console.error('   Make sure the file contains: const IMAGES = [...]');
        process.exit(1);
    }

    const updatedContent = content.replace(imagesPattern, newImagesArray);

    if (isDryRun) {
        console.log('\n📝 DRY RUN - No files will be modified\n');
        console.log('Would replace IMAGES array with:');
        console.log('─'.repeat(60));
        console.log(newImagesArray);
        console.log('─'.repeat(60));
    } else {
        fs.writeFileSync(indexPath, updatedContent, 'utf8');
        console.log('✅ Successfully updated index.html');
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🖼️  Gallery Update Script\n');

    // Check for ImageMagick
    const hasImageMagick = checkImageMagick();
    if (!hasImageMagick) {
        console.warn('⚠️  ImageMagick not found. Thumbnail generation will be skipped.');
        console.warn('   Install it with: brew install imagemagick\n');
    }

    // Scan for images
    console.log('📂 Scanning directories...');
    const thumbnails = scanImages(CONFIG.thumbnailsDir);
    const fullImages = scanImages(CONFIG.imagesDir);

    console.log(`   Found ${thumbnails.length} thumbnails`);
    console.log(`   Found ${fullImages.length} full-size images`);

    // Validate matching images
    if (thumbnails.length !== fullImages.length) {
        console.warn('\n⚠️  Warning: Mismatch between thumbnails and full images');
        console.warn(`   Thumbnails: ${thumbnails.length}`);
        console.warn(`   Full images: ${fullImages.length}`);
    }

    if (fullImages.length === 0) {
        console.error('\n❌ No images found matching pattern: image_N.jpeg');
        process.exit(1);
    }

    // Check for missing files
    const missingThumbnails = fullImages.filter(img => !thumbnails.includes(img));
    const missingFullImages = thumbnails.filter(img => !fullImages.includes(img));

    if (missingThumbnails.length > 0 && !hasImageMagick) {
        console.warn('\n⚠️  Missing thumbnails for:');
        missingThumbnails.forEach(img => console.warn(`   - ${img}`));
    }

    if (missingFullImages.length > 0) {
        console.warn('\n⚠️  Missing full-size images for:');
        missingFullImages.forEach(img => console.warn(`   - ${img}`));
    }

    // Generate missing thumbnails if ImageMagick is available
    if (hasImageMagick && missingThumbnails.length > 0 && !isDryRun) {
        const success = await generateMissingThumbnails(missingThumbnails);
        if (success) {
            console.log('✓ All thumbnails generated successfully');
        }
    } else if (missingThumbnails.length > 0 && isDryRun) {
        console.log(`\n💡 Would generate ${missingThumbnails.length} missing thumbnails:`);
        missingThumbnails.forEach(img => console.log(`   - ${img}`));
    }

    // Re-scan thumbnails after generation
    const finalThumbnails = scanImages(CONFIG.thumbnailsDir);
    const validImages = finalThumbnails.filter(img => fullImages.includes(img));

    if (validImages.length === 0) {
        console.error('\n❌ No valid image pairs found');
        process.exit(1);
    }

    console.log(`\n✓ ${validImages.length} valid image pairs found\n`);

    // Generate new IMAGES array
    const newImagesArray = generateImagesArray(validImages);

    // Update index.html
    updateIndexFile(newImagesArray);

    if (!isDryRun) {
        console.log(`\n✨ Done! Your gallery now has ${validImages.length} images.`);
        console.log('\nNext steps:');
        console.log('  1. Open index.html to verify changes');
        console.log('  2. Test locally by opening index.html in a browser');
        console.log('  3. Commit and push when ready:');
        console.log('     git add index.html');
        if (missingThumbnails.length > 0) {
            console.log('     git add thumbnails/');
        }
        console.log('     git commit -m "Update gallery with new images"');
        console.log('     git push');
    } else {
        console.log('\n💡 To actually update the file, run without --dry-run:');
        console.log('   node update-gallery.js');
    }
}

// Run the script
try {
    main();
} catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
}
