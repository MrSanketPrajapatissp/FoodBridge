# 🚀 FoodBridge: Optimization & Scalability Roadmap

This document outlines the strategic plan for cost-optimization and performance scaling of the FoodBridge platform. These features are designed to keep the project "Free Forever" even as user traffic grows.

---

## 🛠️ Phase 1: Cloudinary Cost Optimization (The "Auto-Purge" Strategy)

### Goal:
To minimize Cloudinary storage and bandwidth usage by deleting images that are no longer needed.

### Logic:
When a `Donation` status changes to a terminal state, the associated media files should be deleted from the cloud.
- **Terminal States**: `PICKED_UP`, `EXPIRED`, `CANCELLED`.

### Technical Implementation Plan:
1. **Django Signals**: Implement a `post_save` signal on the `Donation` model.
2. **Detection**: Check if `instance.status` has transitioned to a terminal state.
3. **Action**: Fetch all related `DonationPhoto` objects and call `.delete()`.
4. **Result**: `django-cloudinary-storage` will automatically call the Cloudinary API to remove the remote file, freeing up your account credits immediately.

---

## 🖼️ Phase 2: Image Processing & Compression

### Goal:
To reduce the size of images before they are uploaded to Cloudinary, saving bandwidth and improving mobile load times.

### Technical Implementation Plan:
1. **Frontend Resizing**: Use a library like `browser-image-compression` in the React `Donate.jsx` page to resize images to max 1200px width before the `POST` request.
2. **Backend Transformation**: Configure Cloudinary "Upload Presets" to automatically convert images to `.webp` format (the most efficient web format).

---

## ⏲️ Phase 3: Background Cleanup Task

### Goal:
To catch any "orphan" files that might have been missed by signals.

### Technical Implementation Plan:
1. **Periodic Task**: Use `django-q` (already installed) to run a daily task.
2. **Query**: Find any `DonationPhoto` objects whose parent `Donation` is older than 30 days and not in `AVAILABLE` status.
3. **Action**: Bulk delete the records and their cloud assets.

---

> **Note to Future Developer/AI**:
> To implement these features, refer to this roadmap and the `backend/donations/models.py` file. The infrastructure for these changes is already in place.
