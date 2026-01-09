# Sector QR Codes & Wiki Pages

## Overview

Teachers can generate and print QR codes for each sector type in their schoolyard. When students scan these QR codes with their phone, they're taken to an educational wiki page about that sector.

## How It Works

1. **Teacher generates QR codes** → Settings tab → "Sector QR Codes" section
2. **Teacher prints/downloads** → Individual or all QR codes as styled cards
3. **Teacher places QR codes** → At physical sector locations in the schoolyard
4. **Student scans QR code** → Opens wiki page with educational content + available missions

## Files

| File | Purpose |
|------|---------|
| `frontend/src/lib/components/SectorQRGenerator.svelte` | QR code generator component |
| `frontend/src/lib/data/sectorWikiContent.ts` | Educational content for each sector type |
| `frontend/src/routes/wiki/sector/[type]/+page.svelte` | Wiki page UI |
| `frontend/src/routes/wiki/sector/[type]/+page.ts` | Data loader for missions |

## Sector Types

- TREES, FLOWERS, POND, ANIMALS, GARDEN, PLAYGROUND, COMPOST, OTHER

## Wiki Page Content

Each wiki page includes:
- Introduction and fun facts
- Suggested activities
- Care guide
- **Related missions** (if logged in) - shows available missions for that sector

## QR Code URLs

QR codes link to: `{origin}/wiki/sector/{type}`

Example: `https://groney.example.com/wiki/sector/flowers`

## Technical Notes

- QR codes generated client-side using `qrcode` npm package
- No backend required for QR generation
- Wiki pages work for both logged-in and anonymous users
- Missions section adapts to user role (student vs teacher endpoints)
