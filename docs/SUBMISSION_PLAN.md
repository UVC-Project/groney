# 🏗️ Submission Feature - Architecture & Implementation

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (SvelteKit)                        │
│  /login, /register, /map, /teacher, /shop, /missions/[id]/submit   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Express :3000)                    │
│   Proxies requests to microservices, forwards auth headers          │
└─────────────────────────────────────────────────────────────────────┘
          │           │           │           │           │
          ▼           ▼           ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │  Auth   │ │ Mission │ │Submission│ │  Shop   │ │ Supply  │
    │ :3001   │ │ :3003   │ │  :3004  │ │ :3005   │ │ :3007   │
    └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
          │           │           │           │           │
          └───────────┴───────────┴───────────┴───────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     PostgreSQL + Redis        │
                    └───────────────────────────────┘
                                    │
                    ┌───────────────────────────────┐
                    │   MinIO (S3-compatible) :9000 │  ✅ NOW USED
                    └───────────────────────────────┘
```

## Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| API Gateway | 3000 | Routes requests, forwards auth headers |
| Auth Service | 3001 | Login, register, JWT tokens, password reset |
| Mascot Engine | 3002 | Mascot stats, decay loop, level-ups |
| Mission Service | 3003 | Sectors, missions, student routes |
| Submission Service | 3004 | Teacher submission review + Student photo uploads |
| Shop Service | 3005 | Shop items, purchases |
| Calculation Service | 3006 | CO2 impact calculations |
| Supply Service | 3007 | Supply requests (gardening tools) |
| MinIO | 9000/9001 | S3-compatible object storage |

## Student Mission Flow (COMPLETE ✅)

```
1. Student views /map → sees sectors with missions
2. Student clicks mission → modal shows details
3. Student clicks "Accept Mission" 
   → POST /api/student/missions/:id/accept
   → Creates Submission with status=PENDING, photoUrl=null
4. Student redirected to /missions/:id/submit
   → UI for photo selection ✅
   → Uploads photo to MinIO via submission-service ✅
   → POST /api/student/submissions/:id/upload ✅
5. Teacher sees submission in /teacher (Submissions tab)
   → Shows actual uploaded photos from MinIO ✅
6. Teacher approves/rejects
   → Rewards applied to mascot ✅
```

## Implementation Status ✅

### Backend (submission-service)
- ✅ Upload endpoint (`POST /api/student/submissions/:id/upload`)
- ✅ Multer configured (memory storage, 5MB limit, image types)
- ✅ MinIO/S3 client initialized (`src/lib/s3.ts`)
- ✅ Bucket creation on startup

### Frontend
- ✅ `handleSubmit()` connected to API
- ✅ FormData construction with photo
- ✅ Error/success handling
- ✅ Loading states
- ✅ File validation (size, type)

### API Gateway
- ✅ Proxy route for student submission uploads

## Files Changed/Created

| File | Change |
|------|--------|
| `backend/services/submission-service/src/lib/s3.ts` | NEW - S3/MinIO client |
| `backend/services/submission-service/src/routes/student.routes.ts` | NEW - Upload endpoint |
| `backend/services/submission-service/src/start.ts` | Added student routes + S3 init |
| `backend/services/api-gateway/src/routes/studentRoutes.ts` | Added submission proxy |
| `frontend/src/routes/missions/[missionId]/submit/+page.svelte` | Connected upload |
| `frontend/src/routes/missions/[missionId]/submit/+page.ts` | Fetch submission data |
| `docker-compose.yml` | Added S3 env vars |

## API Endpoints

### Student Endpoints (submission-service)

#### Upload Photo
```
POST /api/student/submissions/:submissionId/upload
Content-Type: multipart/form-data

Body:
- photo: File (required) - JPEG, PNG, GIF, WebP, max 5MB

Response:
{
  "message": "Photo uploaded successfully!",
  "submission": {
    "id": "...",
    "photoUrl": "http://localhost:9000/groney-submissions/...",
    "status": "PENDING"
  }
}
```

#### Get Submission
```
GET /api/student/submissions/:submissionId

Response:
{
  "id": "...",
  "missionId": "...",
  "mission": { ... },
  "photoUrl": "...",
  "status": "pending",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Teacher Endpoints (submission-service)

#### List Pending Submissions
```
GET /api/teacher/submissions?classId=...

Response: Array of submissions with mission and student info
```

#### Review Submission
```
POST /api/teacher/submissions/:id/review
Body: { "status": "completed" | "rejected" }

On approve:
- Updates submission status
- Awards XP, coins, stat boosts to mascot
- Creates activity feed entry
- Detects level-ups
```

## MinIO Configuration

```yaml
# docker-compose.yml
minio:
  image: minio/minio:latest
  ports:
    - "9000:9000"   # API
    - "9001:9001"   # Console (admin UI)
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin

submission-service:
  environment:
    S3_ACCESS_KEY: minioadmin
    S3_SECRET_KEY: minioadmin
    S3_ENDPOINT: http://minio:9000
    S3_PUBLIC_URL: http://localhost:9000
```

## Testing

1. Start services: `docker-compose up -d`
2. Login as student
3. Go to /map, accept a mission
4. Upload a photo on the submit page
5. Login as teacher
6. Go to /teacher, Submissions tab
7. Approve or reject the submission

## Data Models

### Submission Model
```prisma
model Submission {
  id          String           @id @default(cuid())
  missionId   String
  userId      String
  classId     String
  photoUrl    String?          // ← Populated after upload
  qrScanned   Boolean          @default(false)
  status      SubmissionStatus @default(PENDING)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}
```

### Status Flows

**Mission:**
```
AVAILABLE → IN_PROGRESS (accepted) → COMPLETED/AVAILABLE (after review)
```

**Submission:**
```
PENDING (created) → COMPLETED (approved) / REJECTED (rejected)
```
