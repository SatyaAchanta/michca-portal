# Mich-CA Store Implementation

## Purpose
The Mich-CA Store allows signed-in users to post cricket gear listings (new/used) with public seller contact details. Public visitors can browse active listings.

## Data Model Overview
Prisma additions:
- `GearCondition`: `NEW`, `USED`
- `StoreListingStatus`: `ACTIVE`, `SOLD`
- `StoreListing`
  - owner: `userProfileId`
  - seller info: `sellerName`, `sellerPhone`
  - item info: `title`, `description`, `condition`
  - pricing: `priceUsdCents`, `isNegotiable`
  - lifecycle: `status`, `createdAt`, `updatedAt`
- `StoreListingImage`
  - relation: `listingId`
  - blob metadata: `blobUrl`, `blobPathname`
  - image metadata: `width`, `height`, `sizeBytes`, `sortOrder`

Indexes:
- `StoreListing(status, createdAt desc)` for active feed
- `StoreListing(userProfileId, updatedAt desc)` for owner dashboard
- `StoreListingImage(listingId, sortOrder)` unique ordering key

## Upload and Conversion Flow
1. Form submission includes multiple `images` files.
2. Server validates image count and file constraints.
3. Every image is converted to WebP on the server using `sharp`.
4. Converted files are uploaded to Vercel Blob via `@vercel/blob` `put()`.
5. Returned blob metadata is persisted in `StoreListingImage`.
6. On listing image replacement, old blob URLs are deleted using `del()` (best-effort cleanup).

## Environment Variables
Required:
- `BLOB_READ_WRITE_TOKEN`

This token must be present in deployment and local runtime env for blob upload/delete operations.

## Route Map
- `/store`: public page listing active store items
- `/store/new`: signed-in page to post a listing
- `/store/my-listings`: signed-in page to manage owner listings
- `/store/[id]`: listing detail page
- `/store/[id]/edit`: owner-only edit page

## Validation Rules
- Minimum 2 images required for new listing creation.
- Maximum 6 images allowed per listing.
- Accepted image types: JPEG/JPG/PNG/WebP.
- Max file size: 10MB per image.
- Required fields: title, description, condition, price, seller name, seller phone.
- Price must be a positive numeric USD amount and is stored as integer cents.

## Authorization and Ownership
- Posting/editing/marking sold requires authenticated user role `PLAYER` (or higher per existing role hierarchy).
- Edit and sold actions are owner-restricted (`listing.userProfileId` must match current profile id).
- Deleting a listing is owner-restricted and is a permanent hard delete.
- Public users can browse active listings.
- Sold listings are hidden from public feed.

## Search and Deletion UX
- Public `/store` supports title keyword filtering through query param `q` (example: `/store?q=bat`).
- Search behavior is case-insensitive and targets title only.
- `/store/my-listings` includes a delete confirmation dialog.
- Confirmed delete removes the listing row, cascades related image rows, and performs best-effort blob file cleanup.

## Responsive Layout
- Store primary actions (`Post Gear`, `My Listings`, `Post New Listing`) are full width on small screens and auto-width on `sm+`.
- `/store/my-listings` uses responsive grid:
  - mobile: 1 card per row
  - `sm`: 2 cards per row
  - desktop (`xl`): 3 cards per row
- `/store/my-listings` card media layout:
  - mobile: compact horizontal card with `88x88` thumbnail
  - `sm+`: image-first card layout
- `/store` public listing card media ratio:
  - mobile: `16:10`
  - `sm+`: `4:3`
- Listing action controls (Mark Sold/Delete) are full-width button rows for easier touch interaction on mobile.

## Maintenance Notes
- Blob cleanup on image replacement is best-effort and should be monitored in logs for failures.
- Blob cleanup on delete is also best-effort; failures should be logged/monitored.
- Future moderation/AI image policy can be integrated by adding a review status field (for example `PENDING_REVIEW`) and gating public visibility on approval.
- If listing volume grows, add pagination and full-text search for title/description.
