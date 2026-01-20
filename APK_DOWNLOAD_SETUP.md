# APK Download Setup Guide

This guide explains how to set up the Android app download link on the website.

## Steps to Upload APK and Get Download Link

### 1. Build Your Flutter APK

From your Flutter project directory, build the release APK:

```bash
flutter build apk --release
```

The APK will be generated at:
```
build/app/outputs/flutter-apk/app-release.apk
```

### 2. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 3. Authenticate with Vercel

```bash
vercel login
```

### 4. Upload APK to Vercel Blob

```bash
vercel blob upload build/app/outputs/flutter-apk/app-release.apk
```

Or if the APK is in a different location:

```bash
vercel blob upload path/to/your/app-release.apk
```

### 5. Copy the Blob URL

After uploading, Vercel CLI will return a URL like:
```
https://<team/project>.vercel-storage.com/app-release.apk
```

### 6. Set Environment Variable

Add the following to your `.env.local` file (or set it in Vercel dashboard):

```env
NEXT_PUBLIC_APK_DOWNLOAD_URL=https://<your-blob-url>.vercel-storage.com/app-release.apk
```

### 7. Deploy/Refresh Your Website

- If using Vercel: The environment variable will be picked up on the next deployment
- If running locally: Restart your development server after adding the env variable

## Where the Download Link Appears

Once the environment variable is set, the download button will automatically appear in:

1. **Header** - Desktop view (top right, next to theme toggle)
2. **Header Mobile Menu** - Mobile view (in the hamburger menu)
3. **Features Page** - Prominent download section with card design
4. **About Page** - Download section above contact information

## Updating the APK

When you have a new version:

1. Build the new APK with a unique name (e.g., `app-release-v2.apk`)
2. Upload to Vercel Blob
3. Update the `NEXT_PUBLIC_APK_DOWNLOAD_URL` environment variable
4. Redeploy/restart

Alternatively, you can delete the old blob and upload with the same name, but using versioned names is recommended to avoid caching issues.

## Troubleshooting

- **Button not showing**: Make sure `NEXT_PUBLIC_APK_DOWNLOAD_URL` is set and starts with `NEXT_PUBLIC_`
- **Download not working**: Check that the blob URL is publicly accessible
- **Cached APK**: Use a new filename or add version parameters to the URL

# APK Download Button Setup

### 1. Where is the Download Button?
- The APK download button is rendered via the `MobileDownloadButton` component in your `Header` (desktop and mobile) UI.
- On desktop, it's the Android button ("Download App") in the header bar. On mobile, it's in the mobile nav.

### 2. How to Set the Download URL
- You control the download link via an environment variable:
  - `NEXT_PUBLIC_APK_DOWNLOAD_URL`
- **This must be set before `mobile-download-button.tsx` will render.**

---

## To Add Your URL

### A. Create an `.env.local` file in your project root, if not already present.

```
NEXT_PUBLIC_APK_DOWNLOAD_URL=<YOUR_VERCEL_BLOB_URL>
```
**Example:**
```
NEXT_PUBLIC_APK_DOWNLOAD_URL=https://vercel-blob-url-to-your-apk-file.apk
```

---

### B. Restart your dev/build process:
- Changes to `.env.local` require a restart (`npm run dev` or `vercel deploy`/`next build`).

---

### C. Final Checklist:
- Button will only appear if the variable is set and not empty.
- On desktop, it's to the right in the header bar (`Download App`).
- On mobile, it's in the mobile navigation menu at the bottom.
- The button is styled and acts exactly like the rest of your site's components.

---
**That’s it!**

---

## Troubleshooting
- If the button doesn't show, double check spelling and make sure your `NEXT_PUBLIC_APK_DOWNLOAD_URL` is present in `.env.local` and correctly points to your APK.
- You can also hardcode the URL in `components/mobile-download-button.tsx` for a quick test (not recommended for production).





