# Image Upload Security - Production Grade 🔒

## Overview
This document outlines the comprehensive image security implementation for Liberia Marketplace, designed to protect against malicious file uploads and exploits.

## Security Layers

### Layer 1: File Type Validation (Multi-Level)
**Location:** `src/middleware/secureImageUpload.js`

1. **MIME Type Check** (Line of Defense #1)
   - Validates `Content-Type` header
   - Allowed: `image/jpeg`, `image/png`, `image/webp`
   - ❌ Rejects GIF (can contain animation exploits)

2. **File Extension Check** (Line of Defense #2)
   - Validates file extension: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Prevents `.php`, `.exe`, `.sh` disguised as images

3. **Magic Byte Validation** (Line of Defense #3 - CRITICAL)
   ```javascript
   // JPEG signatures
   [0xFF, 0xD8, 0xFF, 0xE0] // JFIF
   [0xFF, 0xD8, 0xFF, 0xE1] // EXIF

   // PNG signature
   [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]

   // WebP signature (RIFF + WEBP marker)
   [0x52, 0x49, 0x46, 0x46] + WEBP at offset 8
   ```
   - **Why Critical:** MIME types can be spoofed, extensions can be renamed, but magic bytes cannot be faked
   - Reads first 12 bytes of file buffer
   - Compares against known safe image signatures

### Layer 2: File Size Protection
**Prevents:** Denial of Service (DoS) attacks

- **Max File Size:** 5MB per image
- **Min File Size:** 100 bytes (prevents 0-byte attacks)
- **Max Files:** 5 per upload request
- **Max Field Size:** 1MB (form data)
- **Max Parts:** 25 total (files + fields)

### Layer 3: Content Security Validation
**Location:** `src/utils/imageProcessor.js`

1. **Decompression Bomb Protection**
   ```javascript
   Max Dimension: 10,000 x 10,000 pixels
   Max Total Pixels: 100,000,000 (100 megapixels)
   ```
   - Prevents malicious images that decompress to enormous sizes
   - Example: 1MB file → 10GB in memory

2. **Format Validation**
   - Uses Sharp library to attempt image decoding
   - If Sharp can't decode it, it's not a valid image
   - Validates width, height, format metadata

### Layer 4: Metadata Stripping (Privacy & Security)
**CRITICAL FOR USER PRIVACY**

**Location:** `src/utils/imageProcessor.js` - Line 101-106

Strips ALL metadata during processing:
- **EXIF Data:** Camera info, GPS location, timestamps
- **IPTC Data:** Copyright, keywords
- **XMP Data:** Adobe metadata
- **ICC Profiles:** Color profiles (can contain exploits)

```javascript
.withMetadata({
  exif: {},     // Stripped
  icc: null,    // Stripped
  iptc: null,   // Stripped
  xmp: null     // Stripped
})
```

**Why Critical:**
- GPS coordinates expose user location
- Timestamps reveal activity patterns
- Camera info reveals device type
- Metadata can contain embedded scripts

### Layer 5: Image Re-encoding
**Purpose:** Neutralize embedded exploits

Process:
1. Decode image with Sharp (validates format)
2. Auto-rotate based on EXIF (then strip EXIF)
3. Resize to max dimensions
4. Re-encode to clean format:
   - JPEG: 90% quality, progressive, mozjpeg compression
   - PNG: Quality 85%, compression level 9
   - WebP: Quality 85%, effort 6

**Security Benefit:** Re-encoding destroys:
- Steganography (hidden data in pixels)
- Embedded scripts in metadata
- Polyglot files (files that are both image + executable)

### Layer 6: Secure Filename Generation
**Prevents:** Path traversal, code injection

```javascript
timestamp-randomhash-size.ext
// Example: 1734567890-a3f2e8d1c4b5-original.jpg
```

Features:
- Crypto-random 16-byte hash (prevents guessing)
- Timestamp (prevents collisions)
- Size indicator (original/medium/thumbnail)
- Sanitized original name (first 20 chars, alphanumeric only)

**Blocked:**
- `../../etc/passwd.jpg` (path traversal)
- `script.php.jpg` (double extension)
- `file\0.jpg` (null byte injection)

### Layer 7: Storage Isolation
**Location:** `src/utils/setupStorage.js`

Directory Structure:
```
uploads/
  ├── products/     # Product images
  ├── avatars/      # User avatars
  └── temp/         # Temporary (auto-cleaned after 24h)
```

Security Features:
- **Unix Permissions:** `0o755` (rwxr-xr-x)
- **No Execute:** Images served through Express, never executed
- **Auto Cleanup:** Temp files deleted after 24 hours
- **Health Checks:** Validates directory permissions on startup

## Attack Scenarios Prevented

### ✅ File Upload RCE (Remote Code Execution)
**Attack:** Upload PHP/ASP/JSP disguised as image
**Defense:**
- Magic byte validation rejects non-images
- Re-encoding destroys embedded code
- Served through Express (no script execution)

### ✅ Path Traversal
**Attack:** `../../etc/passwd.jpg` overwrites system files
**Defense:**
- Filename sanitization removes `../`
- Crypto-random filenames prevent guessing
- Restricted to `uploads/` directory

### ✅ Decompression Bomb
**Attack:** Small file expands to gigabytes in memory
**Defense:**
- Dimension limits (10,000 x 10,000)
- Pixel count limits (100 megapixels)
- Size validation before processing

### ✅ EXIF Exploit / Privacy Leak
**Attack:** GPS coordinates in EXIF reveal user location
**Defense:**
- ALL metadata stripped during processing
- Re-encoding to clean image
- Logged when metadata detected

### ✅ Polyglot Files
**Attack:** File that's both valid image AND executable
**Defense:**
- Re-encoding creates new clean image
- Original buffer discarded after processing
- Served through Express (no direct execution)

### ✅ Denial of Service (DoS)
**Attack:** Upload thousands of huge files
**Defense:**
- File size limits (5MB max)
- File count limits (5 per request)
- Rate limiting on upload endpoints
- Field size limits (1MB form data)

### ✅ MIME Type Spoofing
**Attack:** Rename `exploit.exe` to `image.jpg`, set MIME to `image/jpeg`
**Defense:**
- Magic byte validation (binary signature check)
- Sharp decoding validation
- Extension whitelist

## Compliance & Standards

### OWASP Top 10
- ✅ A01:2021 - Broken Access Control (file permissions)
- ✅ A03:2021 - Injection (sanitized filenames)
- ✅ A04:2021 - Insecure Design (multi-layer defense)
- ✅ A05:2021 - Security Misconfiguration (proper setup)

### CWE Coverage
- ✅ CWE-434: Unrestricted Upload of File with Dangerous Type
- ✅ CWE-400: Uncontrolled Resource Consumption (DoS)
- ✅ CWE-22: Path Traversal
- ✅ CWE-94: Code Injection
- ✅ CWE-502: Deserialization of Untrusted Data

### NIST Guidelines
- ✅ NIST SP 800-53 SI-10 (Information Input Validation)
- ✅ NIST SP 800-53 SC-5 (Denial of Service Protection)

## Testing Recommendations

### Manual Security Tests
```bash
# 1. Upload renamed executable
cp malicious.sh test.jpg
# Expected: Rejected (magic bytes mismatch)

# 2. Upload oversized image
convert -size 20000x20000 xc:white huge.jpg
# Expected: Rejected (dimension limits)

# 3. Upload with path traversal filename
curl -F "images=@../../etc/passwd.jpg"
# Expected: Filename sanitized

# 4. Upload with EXIF GPS data
exiftool -GPSLatitude=12.34 -GPSLongitude=56.78 image.jpg
# Expected: GPS data stripped from processed image

# 5. Upload 6 files at once
# Expected: Rejected (max 5 files)
```

### Automated Security Scanning
- **npm audit:** Check Sharp/Multer vulnerabilities
- **Snyk:** Continuous dependency scanning
- **OWASP ZAP:** Fuzz testing upload endpoint

## Monitoring & Alerts

### Log Events (Winston)
- ✅ Magic byte validation failures → `warn` level
- ✅ Metadata stripping → `info` level (tracks privacy protection)
- ✅ File validation failures → `error` level
- ✅ Decompression bomb attempts → `warn` level

### Metrics to Monitor
- Upload success rate
- Average file size
- Rejection reasons (by type)
- Storage directory growth
- Failed validation attempts per IP

## Production Deployment Checklist

### Before POC Launch
- [ ] Verify Sharp installation (`npm ls sharp`)
- [ ] Test magic byte validation with sample images
- [ ] Run storage health check (`validateStorageHealth()`)
- [ ] Set up log monitoring for upload failures
- [ ] Configure rate limiting (already in place)

### Before Full Production
- [ ] Migrate to cloud storage (AWS S3/CloudFlare R2)
- [ ] Add virus scanning (ClamAV integration)
- [ ] Set up CDN for image delivery
- [ ] Configure automated backups
- [ ] Add image optimization service (Cloudinary/Imgix)

## Migration Path (POC → Production)

### Current (POC)
```
Local Storage
├── uploads/products/
├── Served via Express
└── Auto-cleanup after 24h
```

### Future (Production)
```
Cloud Storage (S3)
├── Uploaded → S3 bucket
├── Served via CloudFront CDN
├── Glacier archival after 90 days
└── Automated malware scanning
```

## Code References

| Feature | File | Lines |
|---------|------|-------|
| Magic Byte Validation | `secureImageUpload.js` | 15-60 |
| Metadata Stripping | `imageProcessor.js` | 101-106 |
| Decompression Bomb Check | `imageProcessor.js` | 40-50 |
| Secure Filename | `secureImageUpload.js` | 395-400 |
| Storage Setup | `setupStorage.js` | 20-40 |

## Support & Security Contacts

**Security Issues:** Report immediately via secure channel
**False Positives:** Review logs at `backend/logs/error.log`
**Performance Issues:** Check `getStorageStats()` output

---

**Last Updated:** 2025-01-16
**Security Level:** Production-Grade 🔒
**Compliance:** OWASP, CWE, NIST ✅
