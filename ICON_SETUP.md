# Icon Setup Instructions for Hope AI

This document explains how to set up all the required icon files for your website to appear properly in Google search results, browser tabs, and social media shares.

## Required Image Files

You need to create the following image files and place them in the `public` folder:

### 1. Favicon (Already exists)
- **File**: `app/favicon.ico` (already exists)
- **Purpose**: Browser tab icon

### 2. Main Icon (PNG)
- **File**: `public/icon.png`
- **Sizes**: 192x192px and 512x512px (can be the same file, browsers will scale)
- **Purpose**: PWA icon, mobile home screen
- **How to create**: 
  - Use the existing `public/icon.svg` as a base
  - Convert SVG to PNG using:
    - Online: https://cloudconvert.com/svg-to-png
    - Or design software: Export at 512x512px

### 3. Apple Touch Icon
- **File**: `public/apple-icon.png`
- **Size**: 180x180px
- **Purpose**: iOS home screen icon
- **How to create**: 
  - Use the same icon.svg, export at 180x180px
  - Should have rounded corners (iOS will add them automatically)

### 4. Open Graph Image (For Google & Social Media)
- **File**: `public/og-image.png`
- **Size**: 1200x630px
- **Purpose**: Preview image when sharing on Google, Facebook, Twitter, etc.
- **How to create**:
  1. Open `public/og-image-template.html` in a browser
  2. Use browser DevTools or a screenshot tool to capture at exactly 1200x630px
  3. Or use an online service like:
     - https://www.htmlcsstoimage.com/
     - https://og-image.vercel.app/
  4. Save as `og-image.png` in the `public` folder

## Quick Setup Steps

### Option 1: Using Online Tools (Easiest)

1. **Convert SVG to PNG Icons**:
   - Go to https://cloudconvert.com/svg-to-png
   - Upload `public/icon.svg`
   - Convert to PNG at these sizes:
     - 512x512px → save as `public/icon.png`
     - 180x180px → save as `public/apple-icon.png`

2. **Create Open Graph Image**:
   - Go to https://www.htmlcsstoimage.com/
   - Upload `public/og-image-template.html`
   - Set dimensions to 1200x630px
   - Download and save as `public/og-image.png`

### Option 2: Using Design Software (Photoshop, Figma, etc.)

1. **Create Icon Files**:
   - Open `public/icon.svg` in your design software
   - Export at 512x512px as `public/icon.png`
   - Export at 180x180px as `public/apple-icon.png`

2. **Create Open Graph Image**:
   - Create a new canvas: 1200x630px
   - Use gradient background: #6366f1 to #8b5cf6
   - Add "HOPE AI" text (large, white, bold)
   - Add tagline: "Your Personal AI Therapist"
   - Add description text
   - Export as `public/og-image.png`

### Option 3: Using Command Line (For Developers)

If you have ImageMagick or similar tools installed:

```bash
# Convert SVG to PNG icons
convert public/icon.svg -resize 512x512 public/icon.png
convert public/icon.svg -resize 180x180 public/apple-icon.png

# For Open Graph image, use the HTML template with a headless browser
# Or create manually using design software
```

## Verification

After adding all files, verify they work:

1. **Test Favicon**: 
   - Open your website in a browser
   - Check if the favicon appears in the browser tab

2. **Test Icons**:
   - Open browser DevTools → Application → Manifest
   - Check if icons are loading correctly

3. **Test Open Graph**:
   - Use Facebook Debugger: https://developers.facebook.com/tools/debug/
   - Use Twitter Card Validator: https://cards-dev.twitter.com/validator
   - Use LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

4. **Test Google Search**:
   - Submit your site to Google Search Console
   - Use "URL Inspection" tool to check if Open Graph image appears

## Environment Variable

Make sure to set your domain in `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

This ensures Open Graph images use the correct absolute URL.

## Current Status

✅ `app/favicon.ico` - Exists
✅ `public/icon.svg` - Created
✅ `public/manifest.json` - Created
✅ Metadata in `app/layout.tsx` - Updated
⏳ `public/icon.png` - Needs to be created
⏳ `public/apple-icon.png` - Needs to be created
⏳ `public/og-image.png` - Needs to be created

## Notes

- All image files should be optimized for web (compressed but high quality)
- The Open Graph image is especially important for Google search results
- Icons should follow your brand colors (purple/indigo gradient based on your design)
- Test all icons on both light and dark mode if your site supports it

