#!/usr/bin/env node

/**
 * ONE-TIME SCRIPT: Reorder images by EXIF date taken
 * 
 * This script reads EXIF metadata from images and renumbers them chronologically.
 * It includes multiple safety features: backup creation, dry-run mode, and revert capability.
 * 
 * IMPORTANT: Only run this once to establish chronological order.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
    imagesDir: './images',
    thumbnailsDir: './thumbnails',
    backupDir: './backup-before-reorder',
    imagePattern: /\.jpeg$/i,  // Accept any .jpeg file (case insensitive)
};

// Check for flags
const isDryRun = process.argv.includes('--dry-run');
const isRevert = process.argv.includes('--revert');

/**
 * Get EXIF date from image using ImageMagick
 */
function getExifDate(imagePath) {
    try {
        const output = execSync(
            `identify -format "%[EXIF:DateTimeOriginal]" "${imagePath}"`,
            { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
        ).trim();

        if (output && output !== '') {
            // Parse EXIF date format: "2023:05:15 10:23:45"
            const dateStr = output.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
            return new Date(dateStr);
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Get file modification date as fallback
 */
function getFileDate(imagePath) {
    try {
        const stats = fs.statSync(imagePath);
        return stats.mtime;
    } catch (error) {
        return null;
    }
}

/**
 * Create backup of images and thumbnails
 */
function createBackup() {
    console.log('📦 Creating backup...');
    
    if (fs.existsSync(CONFIG.backupDir)) {
        console.log('   Backup directory already exists. Skipping backup creation.');
        console.log('   To create a fresh backup, delete the backup directory first.');
        return;
    }

    // Create backup directories
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    fs.mkdirSync(path.join(CONFIG.backupDir, 'images'), { recursive: true });
    fs.mkdirSync(path.join(CONFIG.backupDir, 'thumbnails'), { recursive: true });

    // Copy all files
    const images = fs.readdirSync(CONFIG.imagesDir);
    const thumbnails = fs.readdirSync(CONFIG.thumbnailsDir);

    images.forEach(file => {
        if (CONFIG.imagePattern.test(file)) {
            fs.copyFileSync(
                path.join(CONFIG.imagesDir, file),
                path.join(CONFIG.backupDir, 'images', file)
            );
        }
    });

    thumbnails.forEach(file => {
        if (CONFIG.imagePattern.test(file)) {
            fs.copyFileSync(
                path.join(CONFIG.thumbnailsDir, file),
                path.join(CONFIG.backupDir, 'thumbnails', file)
            );
        }
    });

    console.log(`✓ Backup created at: ${CONFIG.backupDir}`);
    console.log(`  Images backed up: ${images.filter(f => CONFIG.imagePattern.test(f)).length}`);
    console.log(`  Thumbnails backed up: ${thumbnails.filter(f => CONFIG.imagePattern.test(f)).length}\n`);
}

/**
 * Revert from backup
 */
function revertFromBackup() {
    console.log('⏮️  Reverting from backup...\n');

    if (!fs.existsSync(CONFIG.backupDir)) {
        console.error('❌ No backup found at:', CONFIG.backupDir);
        console.error('   Cannot revert without a backup.');
        process.exit(1);
    }

    const backupImages = path.join(CONFIG.backupDir, 'images');
    const backupThumbnails = path.join(CONFIG.backupDir, 'thumbnails');

    // Remove current images
    const currentImages = fs.readdirSync(CONFIG.imagesDir)
        .filter(f => CONFIG.imagePattern.test(f));
    const currentThumbnails = fs.readdirSync(CONFIG.thumbnailsDir)
        .filter(f => CONFIG.imagePattern.test(f));

    currentImages.forEach(file => {
        fs.unlinkSync(path.join(CONFIG.imagesDir, file));
    });

    currentThumbnails.forEach(file => {
        fs.unlinkSync(path.join(CONFIG.thumbnailsDir, file));
    });

    // Restore from backup
    const backedUpImages = fs.readdirSync(backupImages);
    const backedUpThumbnails = fs.readdirSync(backupThumbnails);

    backedUpImages.forEach(file => {
        fs.copyFileSync(
            path.join(backupImages, file),
            path.join(CONFIG.imagesDir, file)
        );
    });

    backedUpThumbnails.forEach(file => {
        fs.copyFileSync(
            path.join(backupThumbnails, file),
            path.join(CONFIG.thumbnailsDir, file)
        );
    });

    console.log('✅ Successfully reverted from backup');
    console.log(`   Restored ${backedUpImages.length} images`);
    console.log(`   Restored ${backedUpThumbnails.length} thumbnails\n`);
    console.log('💡 To apply the revert to your gallery, run:');
    console.log('   node update-gallery.js\n');
}

/**
 * Scan and collect image metadata
 */
function collectImageMetadata() {
    console.log('📂 Scanning images and reading dates...\n');

    const files = fs.readdirSync(CONFIG.imagesDir)
        .filter(file => CONFIG.imagePattern.test(file));

    const metadata = [];

    files.forEach(filename => {
        const imagePath = path.join(CONFIG.imagesDir, filename);
        const exifDate = getExifDate(imagePath);
        const fileDate = getFileDate(imagePath);
        const date = exifDate || fileDate;

        metadata.push({
            originalFilename: filename,
            date: date,
            hasExif: exifDate !== null,
            dateString: date ? date.toISOString() : 'No date found',
        });

        const dateSource = exifDate ? '📅 EXIF' : (fileDate ? '📁 File' : '❌ None');
        console.log(`   ${filename.padEnd(20)} ${dateSource.padEnd(10)} ${date ? date.toLocaleString() : 'No date'}`);
    });

    console.log();
    return metadata;
}

/**
 * Generate renaming plan
 */
function generateRenamingPlan(metadata) {
    // Sort by date
    const sorted = metadata.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date - b.date;
    });

    // Generate new filenames
    const plan = sorted.map((item, index) => ({
        ...item,
        newFilename: `image_${index + 1}.jpeg`,
        needsRename: item.originalFilename !== `image_${index + 1}.jpeg`,
    }));

    return plan;
}

/**
 * Display renaming plan
 */
function displayPlan(plan) {
    console.log('📋 Renaming Plan:\n');
    console.log('   OLD NAME              →  NEW NAME              DATE');
    console.log('   ' + '─'.repeat(70));

    plan.forEach(item => {
        const arrow = item.needsRename ? '→' : '=';
        const oldName = item.originalFilename.padEnd(20);
        const newName = item.newFilename.padEnd(20);
        const dateStr = item.date ? item.date.toLocaleDateString() : 'No date';
        console.log(`   ${oldName} ${arrow}  ${newName} ${dateStr}`);
    });

    console.log();
    console.log(`   Total images: ${plan.length}`);
    console.log(`   Need renaming: ${plan.filter(p => p.needsRename).length}`);
    console.log(`   Using EXIF data: ${plan.filter(p => p.hasExif).length}`);
    console.log(`   Using file date: ${plan.filter(p => !p.hasExif && p.date).length}`);
    console.log(`   No date found: ${plan.filter(p => !p.date).length}\n`);
}

/**
 * Execute renaming
 */
function executeRenaming(plan) {
    console.log('🔄 Executing renaming...\n');

    // Rename to temporary names first to avoid conflicts
    const tempPlan = plan.map(item => ({
        ...item,
        tempFilename: `temp_${Date.now()}_${item.newFilename}`,
    }));

    // Step 1: Rename all to temp names
    console.log('   Step 1/3: Renaming to temporary names...');
    tempPlan.forEach(item => {
        if (item.needsRename) {
            fs.renameSync(
                path.join(CONFIG.imagesDir, item.originalFilename),
                path.join(CONFIG.imagesDir, item.tempFilename)
            );

            const thumbnailPath = path.join(CONFIG.thumbnailsDir, item.originalFilename);
            if (fs.existsSync(thumbnailPath)) {
                fs.renameSync(
                    thumbnailPath,
                    path.join(CONFIG.thumbnailsDir, item.tempFilename)
                );
            }
        }
    });

    // Step 2: Rename from temp to final names
    console.log('   Step 2/3: Renaming to final names...');
    tempPlan.forEach(item => {
        const sourceName = item.needsRename ? item.tempFilename : item.originalFilename;
        
        fs.renameSync(
            path.join(CONFIG.imagesDir, sourceName),
            path.join(CONFIG.imagesDir, item.newFilename)
        );

        const thumbnailSource = path.join(CONFIG.thumbnailsDir, sourceName);
        if (fs.existsSync(thumbnailSource)) {
            fs.renameSync(
                thumbnailSource,
                path.join(CONFIG.thumbnailsDir, item.newFilename)
            );
        }
    });

    console.log('   Step 3/3: Verifying...');
    const finalFiles = fs.readdirSync(CONFIG.imagesDir)
        .filter(f => CONFIG.imagePattern.test(f))
        .sort();

    console.log(`\n✅ Renaming complete!`);
    console.log(`   ${finalFiles.length} images renamed chronologically\n`);
}

/**
 * Main execution
 */
async function main() {
    console.log('🗓️  Image Reordering Script (By Date Taken)\n');

    // Handle revert
    if (isRevert) {
        revertFromBackup();
        return;
    }

    // Create backup (unless dry-run)
    if (!isDryRun) {
        createBackup();
    }

    // Collect metadata
    const metadata = collectImageMetadata();

    if (metadata.length === 0) {
        console.error('❌ No images found matching pattern: image_N.jpeg');
        process.exit(1);
    }

    // Generate plan
    const plan = generateRenamingPlan(metadata);
    displayPlan(plan);

    // Execute or show dry-run message
    if (isDryRun) {
        console.log('📝 DRY RUN - No files were modified\n');
        console.log('To execute this renaming:');
        console.log('  1. Review the plan above carefully');
        console.log('  2. Run: node reorder-by-date.js');
        console.log('\nA backup will be created automatically before renaming.');
    } else {
        executeRenaming(plan);
        console.log('Next steps:');
        console.log('  1. Run: node update-gallery.js (to update index.html)');
        console.log('  2. Test locally to verify order');
        console.log('  3. If something is wrong, run: node reorder-by-date.js --revert\n');
    }
}

// Run the script
try {
    main();
} catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nIf files were partially renamed, you can revert with:');
    console.error('  node reorder-by-date.js --revert\n');
    process.exit(1);
}
