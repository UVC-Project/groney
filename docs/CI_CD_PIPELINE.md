# CI/CD Pipeline Documentation

**Version:** 1.0  
**Last Updated:** January 16, 2026  
**Platform:** GitHub Actions

---

## 1. Requirements Compliance Matrix

| Requirement | Description | Implementation | Status |
|-------------|-------------|----------------|--------|
| **1.1** | Suitable development pipeline | GitHub Actions CI/CD | ✅ |
| **1.2** | Build automatically triggered on push | `on: push` trigger | ✅ |
| **2.1** | Unit tests automatically executed | `test` job with Vitest | ✅ |
| **2.2** | Linter adjusted to team standards | ESLint with complexity rules | ✅ |
| **2.3** | Static code analysis (code smells, complexity, coverage) | `code-analysis` job + coverage | ✅ |
| **2.1** | Developers informed when build fails | `notify-failure` job + GitHub Summary | ✅ |
| **2.2** | Pipeline produces working software | `build` job with artifacts | ✅ |
| **2.3** | UML sequence diagram | See Section 2 below | ✅ |
| **2.4** | Containerization with Docker | `docker-build` job | ✅ |
| **3.1** | Environmental parameters managed separately | `.env` files + GitHub Secrets | ✅ |

---

## 2. Pipeline Overview

The Groeny platform uses GitHub Actions for continuous integration and deployment. The pipeline automatically triggers on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

### 2.1 Pipeline Stages

| Stage | Purpose | Trigger |
|-------|---------|---------|
| Lint | Code quality & style checks | All pushes/PRs |
| Test | Unit tests with coverage | All pushes/PRs |
| Code Analysis | Static analysis (complexity, duplication) | All pushes/PRs |
| Build | Compile application | After lint & test pass |
| Docker Build | Container images | Main branch only |
| Integration Test | Docker Compose validation | PRs only |

---

## 2. UML Sequence Diagram

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐     ┌────────┐     ┌────────┐
│Developer│     │  GitHub  │     │  Lint   │     │   Test   │     │ Build  │     │ Docker │
└────┬────┘     └────┬─────┘     └────┬────┘     └────┬─────┘     └───┬────┘     └───┬────┘
     │               │                │               │               │              │
     │ git push      │                │               │               │              │
     │──────────────►│                │               │               │              │
     │               │                │               │               │              │
     │               │ Trigger CI     │               │               │              │
     │               │───────────────►│               │               │              │
     │               │                │               │               │              │
     │               │                │ Run ESLint    │               │              │
     │               │                │───────┐       │               │              │
     │               │                │       │       │               │              │
     │               │                │◄──────┘       │               │              │
     │               │                │               │               │              │
     │               │                │ TypeScript    │               │              │
     │               │                │ Check         │               │              │
     │               │                │───────┐       │               │              │
     │               │                │       │       │               │              │
     │               │                │◄──────┘       │               │              │
     │               │                │               │               │              │
     │               │                │ Lint Pass     │               │              │
     │               │                │──────────────►│               │              │
     │               │                │               │               │              │
     │               │                │               │ Start         │              │
     │               │                │               │ PostgreSQL    │              │
     │               │                │               │───────┐       │              │
     │               │                │               │       │       │              │
     │               │                │               │◄──────┘       │              │
     │               │                │               │               │              │
     │               │                │               │ Run Vitest    │              │
     │               │                │               │ + Coverage    │              │
     │               │                │               │───────┐       │              │
     │               │                │               │       │       │              │
     │               │                │               │◄──────┘       │              │
     │               │                │               │               │              │
     │               │                │               │ Upload        │              │
     │               │                │               │ Coverage      │              │
     │               │                │               │───────┐       │              │
     │               │                │               │       │       │              │
     │               │                │               │◄──────┘       │              │
     │               │                │               │               │              │
     │               │                │               │ Tests Pass    │              │
     │               │                │               │──────────────►│              │
     │               │                │               │               │              │
     │               │                │               │               │ npm build    │
     │               │                │               │               │──────┐       │
     │               │                │               │               │      │       │
     │               │                │               │               │◄─────┘       │
     │               │                │               │               │              │
     │               │                │               │               │ Upload       │
     │               │                │               │               │ Artifacts    │
     │               │                │               │               │──────┐       │
     │               │                │               │               │      │       │
     │               │                │               │               │◄─────┘       │
     │               │                │               │               │              │
     │               │                │               │               │ [main only]  │
     │               │                │               │               │─────────────►│
     │               │                │               │               │              │
     │               │                │               │               │              │ Build Images
     │               │                │               │               │              │──────┐
     │               │                │               │               │              │      │
     │               │                │               │               │              │◄─────┘
     │               │                │               │               │              │
     │               │                │               │               │              │ Push to GHCR
     │               │                │               │               │              │──────┐
     │               │                │               │               │              │      │
     │               │                │               │               │              │◄─────┘
     │               │                │               │               │              │
     │               │ Pipeline       │               │               │              │
     │               │ Complete       │               │               │              │
     │◄──────────────│                │               │               │              │
     │               │                │               │               │              │
```

---

## 3. Detailed Stage Descriptions

### 3.1 Lint & Code Quality (Job: `lint`)

**Purpose:** Ensure code adheres to team coding standards

**Steps:**
1. Checkout code
2. Setup Node.js 20.x with npm cache
3. Install dependencies (`npm ci`)
4. Run ESLint on frontend
5. Run ESLint on backend services
6. TypeScript type checking

**ESLint Rules Enforced:**
| Rule | Threshold | Purpose |
|------|-----------|---------|
| `complexity` | max: 10 | Cyclomatic complexity |
| `max-depth` | max: 4 | Nesting depth |
| `max-lines-per-function` | max: 100 | Function length |
| `max-params` | max: 4 | Parameter count |
| `eqeqeq` | always | Strict equality |

### 3.2 Unit Tests & Coverage (Job: `test`)

**Purpose:** Validate functionality and measure code coverage

**Services:**
- PostgreSQL 16 (for database tests)

**Steps:**
1. Start PostgreSQL service container
2. Install dependencies
3. Generate Prisma client
4. Push database schema
5. Run Vitest with coverage
6. Upload coverage report as artifact
7. Generate coverage summary

**Coverage Thresholds:**
| Metric | Minimum |
|--------|---------|
| Statements | 50% |
| Branches | 50% |
| Functions | 50% |
| Lines | 50% |

### 3.3 Static Code Analysis (Job: `code-analysis`)

**Purpose:** Detect code smells and complexity issues

**Tools:**
- ESLint with complexity rules
- jscpd (copy-paste detector)

**Metrics Reported:**
- Cyclomatic complexity violations
- Code duplication percentage
- Duplicated lines count

### 3.4 Build (Job: `build`)

**Purpose:** Compile and bundle application

**Steps:**
1. Install dependencies
2. Generate Prisma client
3. Build frontend (SvelteKit)
4. Build backend services
5. Upload build artifacts

### 3.5 Docker Build (Job: `docker-build`)

**Purpose:** Create container images for deployment

**Trigger:** Only on push to `main` branch

**Services Built:**
- frontend
- api-gateway
- auth-service
- mascot-engine
- mission-service
- submission-service
- shop-service
- calculation-service
- supply-service

**Registry:** GitHub Container Registry (ghcr.io)

**Tags:**
- `latest` (main branch)
- `<branch-name>`
- `<commit-sha>`

---

## 4. Environment Configuration

### 4.1 Secrets Required

| Secret | Purpose | Required For |
|--------|---------|--------------|
| `GITHUB_TOKEN` | Container registry auth | Docker build |
| `SLACK_WEBHOOK_URL` | Failure notifications | Optional |

### 4.2 Environment Variables

Environment parameters are managed separately via:
- `.env` files (local development)
- `.env.example` (template)
- GitHub Secrets (CI/CD)
- Docker Compose environment blocks

```
# CI Environment Variables
DATABASE_URL=postgresql://testuser:testpassword@localhost:5432/testdb
NODE_ENV=test
```

---

## 5. Failure Handling

### 5.1 Notification Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Job Fails  │────►│  notify-    │────►│  Developer  │
│             │     │  failure    │     │  Notified   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  GitHub     │
                    │  Summary    │
                    └─────────────┘
```

### 5.2 Failure Information Provided

- Commit SHA
- Branch name
- Author
- Failed job details
- Link to workflow run

---

## 6. Artifacts

| Artifact | Retention | Contents |
|----------|-----------|----------|
| `coverage-report` | 30 days | HTML/JSON coverage reports |
| `code-analysis-reports` | 30 days | Complexity & duplication reports |
| `build-artifacts` | 7 days | Compiled frontend |

---

## 7. Pipeline Metrics

The pipeline generates summaries visible in GitHub Actions:

### Success Summary
```
✅ CI Pipeline Passed

| Stage | Status |
|-------|--------|
| Lint & Code Quality | ✅ Passed |
| Unit Tests | ✅ Passed |
| Static Analysis | ✅ Passed |
| Build | ✅ Passed |
```

### Coverage Summary
```
📊 Code Coverage Summary

| Metric | Coverage |
|--------|----------|
| Lines | 75% |
| Statements | 72% |
| Functions | 68% |
| Branches | 65% |
```

---

## 8. Local Pipeline Simulation

To run pipeline checks locally:

```bash
# Lint
npm run lint --workspaces --if-present

# Tests with coverage
cd frontend && npm run test:coverage

# Build
npm run build --workspaces --if-present

# Docker build
docker compose build
```

---

*Document generated: January 16, 2026*
