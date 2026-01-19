# CI/CD Pipeline Documentation - Groeny Platform

**Version:** 2.0  
**Last Updated:** January 19, 2026  
**Platform:** GitHub Actions  
**Project:** Green Schoolyard Gamification Platform (Groeny)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Requirements Compliance Matrix](#2-requirements-compliance-matrix)
3. [Pipeline Architecture](#3-pipeline-architecture)
4. [Detailed Implementation](#4-detailed-implementation)
5. [Unit Testing Implementation](#5-unit-testing-implementation)
6. [Linting & Code Standards](#6-linting--code-standards)
7. [Static Code Analysis](#7-static-code-analysis)
8. [Containerization with Docker](#8-containerization-with-docker)
9. [Environment Management](#9-environment-management)
10. [UML Sequence Diagram](#10-uml-sequence-diagram)
11. [Metrics & Reporting](#11-metrics--reporting)
12. [Evidence & Screenshots](#12-evidence--screenshots)

---

## 1. Executive Summary

The Groeny platform implements a comprehensive CI/CD pipeline using **GitHub Actions** that automatically builds, tests, analyzes, and containerizes the application on every code change. The pipeline ensures code quality through automated testing, linting, and static analysis while providing detailed metrics for continuous improvement.

### Key Achievements

| Metric | Value |
|--------|-------|
| Total Automated Tests | 96 |
| Test Frameworks | Vitest |
| Code Coverage Tracking | ✅ Enabled |
| Static Analysis Tools | ESLint, jscpd |
| Containerized Services | 9 microservices |
| Pipeline Trigger | Automatic on push/PR |

---

## 2. Requirements Compliance Matrix

### Learning Outcome 3: Deployment Pipeline

| Level | Requirement | Implementation | Status | Evidence |
|-------|-------------|----------------|--------|----------|
| **1. Propedeuse** | 1.1 Suitable development pipeline chosen | GitHub Actions CI/CD | ✅ | `.github/workflows/ci.yml` |
| **1. Propedeuse** | 1.2 Build process automatically triggered on push | `on: push` and `on: pull_request` triggers | ✅ | Section 4.1 |
| **2. Associate** | 2.1 Developers informed when build fails | `notify-failure` job + GitHub Summary | ✅ | Section 11.3 |
| **2. Associate** | 2.2 Pipeline produces working software | `build` job with artifacts | ✅ | Section 4.4 |
| **2. Associate** | 2.3 UML sequence diagram | Documented in Section 10 | ✅ | Section 10 |
| **2 AD+** | 2.4 Containerization with Docker | `docker-build` job for 9 services | ✅ | Section 8 |
| **3. Bachelor** | 3.1 Environmental parameters managed separately | `.env` files + GitHub Secrets | ✅ | Section 9 |

### Learning Outcome 5: Software Quality

| Level | Requirement | Implementation | Status | Evidence |
|-------|-------------|----------------|--------|----------|
| **1. Propedeuse** | 1.1 Unit tests executed locally in IDE | Vitest + VS Code Test Explorer | ✅ | Section 5.1 |
| **2. Associate** | 2.1 Unit tests automatically executed in pipeline | `test` job runs 96 tests | ✅ | Section 5.2 |
| **2. Associate** | 2.2 Linter added and adjusted to team standards | ESLint with custom rules | ✅ | Section 6 |
| **2 AD+** | 2.3 Static code analysis (code smells, complexity, coverage) | ESLint + jscpd + v8 coverage | ✅ | Section 7 |
| **3. Bachelor** | 3.1 Code coverage increased with metrics output | Coverage reports in CI Summary | ✅ | Section 11.1 |

---

## 3. Pipeline Architecture

### 3.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GITHUB ACTIONS PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  LINT   │───►│  TEST   │───►│ ANALYZE │───►│  BUILD  │───►│ DOCKER  │   │
│  │         │    │         │    │         │    │         │    │  BUILD  │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│       │              │              │              │              │         │
│       ▼              ▼              ▼              ▼              ▼         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        GITHUB STEP SUMMARY                          │   │
│  │  • ESLint Results    • Test Results    • Coverage    • Build Status │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Pipeline Jobs

| Job | Purpose | Dependencies | Runs On |
|-----|---------|--------------|---------|
| `lint` | Code quality & style checks | None | All pushes/PRs |
| `test` | Unit tests with coverage | `lint` | All pushes/PRs |
| `code-analysis` | Static analysis (complexity, duplication) | `lint` | All pushes/PRs |
| `build` | Compile application | `lint`, `test` | All pushes/PRs |
| `docker-build` | Container images | `build` | All pushes/PRs |
| `integration-test` | Docker Compose validation | `build` | PRs only |
| `notify-failure` | Developer notifications | `lint`, `test`, `build` | On failure |
| `success-summary` | Pipeline status report | All jobs | On success |

---

## 4. Detailed Implementation

### 4.1 Automatic Build Trigger (Requirement 1.2)

The pipeline automatically triggers on:

```yaml
on:
  push:
    branches:
      - main
      - develop
  pull_request:
    types: [opened, synchronize, reopened]
    branches:
      - main
      - develop
```

**Evidence:** Every push to `main` or `develop` branches, and every pull request targeting these branches, automatically triggers the full CI/CD pipeline.

### 4.2 Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

This ensures that:
- Only one pipeline runs per branch at a time
- New pushes cancel in-progress runs to save resources

### 4.3 Pipeline Configuration

**File Location:** `.github/workflows/ci.yml`

```yaml
env:
  NODE_VERSION: '20.x'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

### 4.4 Build Job (Requirement 2.2 - Working Software)

```yaml
build:
  name: 🏗️ Build Application
  runs-on: ubuntu-latest
  needs: [lint, test]
  steps:
    - name: Build Frontend
      run: npm run build --workspace=@groney/frontend
    - name: Build Backend Services
      run: npm run build --workspaces --if-present
    - name: Upload Build Artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-artifacts
        path: frontend/build/
```

**Evidence:** The build job produces working software artifacts that are uploaded and available for download.

---

## 5. Unit Testing Implementation

### 5.1 Local Test Execution (Requirement LO5 1.1)

Tests can be executed locally using:

```bash
# Run all tests
npm test

# Run frontend tests
npm run test --workspace=@groney/frontend

# Run backend tests
npm run test --workspace=@groney/auth-service
npm run test --workspace=@groney/shop-service
npm run test --workspace=@groney/supply-service
```

**IDE Integration:** Tests are discoverable in VS Code Test Explorer panel.

### 5.2 Automated Test Execution (Requirement LO5 2.1)

The pipeline automatically executes all unit tests:

```yaml
test:
  name: 🧪 Unit Tests & Coverage
  runs-on: ubuntu-latest
  needs: lint
  services:
    postgres:
      image: postgres:16-alpine
      # ... database configuration
  steps:
    - name: Run Frontend Tests with Coverage
      run: npm run test:coverage --workspace=@groney/frontend
    
    - name: Run Backend Tests (Auth Service)
      run: npm run test --workspace=@groney/auth-service -- --run
    
    - name: Run Backend Tests (Shop Service)
      run: npm run test --workspace=@groney/shop-service -- --run
    
    - name: Run Backend Tests (Supply Service)
      run: npm run test --workspace=@groney/supply-service -- --run
```

### 5.3 Test Statistics

| Service | Test Files | Tests | Framework |
|---------|------------|-------|-----------|
| Frontend | 2 | 59 | Vitest |
| Auth Service | 6 | 33 | Vitest |
| Shop Service | 1 | 2 | Vitest |
| Supply Service | 1 | 2 | Vitest |
| **Total** | **10** | **96** | - |

### 5.4 Test File Locations

```
frontend/
├── src/lib/__tests__/setup.test.ts
└── src/routes/page.test.ts

backend/services/
├── auth-service/src/app/Controllers/__tests__/
│   ├── LoginController.test.ts
│   ├── RegisterController.test.ts
│   ├── LogoutController.test.ts
│   ├── ProfileController.test.ts
│   ├── EmailVerificationController.test.ts
│   └── PasswordResetController.test.ts
├── shop-service/src/_tests_/shop.unit.test.ts
└── supply-service/src/_tests_/supplies.unit.test.ts
```

---

## 6. Linting & Code Standards

### 6.1 Linter Configuration (Requirement LO5 2.2)

**File Location:** `frontend/.eslintrc.cjs`

The ESLint configuration enforces team coding standards:

```javascript
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Code Quality Rules (Team Standards)
    'complexity': ['warn', { max: 15 }],        // Cyclomatic complexity
    'max-depth': ['warn', { max: 5 }],          // Nesting depth
    'max-lines-per-function': ['warn', { max: 150 }],
    'max-params': ['warn', { max: 5 }],         // Function parameters
    'no-duplicate-imports': 'warn',
    'no-var': 'error',
    'eqeqeq': ['warn', 'always'],               // Strict equality
    
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

### 6.2 Team Coding Standards

| Rule | Threshold | Purpose |
|------|-----------|---------|
| `complexity` | max: 15 | Limit cyclomatic complexity |
| `max-depth` | max: 5 | Prevent deep nesting |
| `max-lines-per-function` | max: 150 | Keep functions manageable |
| `max-params` | max: 5 | Limit function parameters |
| `eqeqeq` | always | Require strict equality |
| `no-var` | error | Enforce modern JS |

### 6.3 Pipeline Lint Execution

```yaml
lint:
  name: 🔍 Lint & Code Quality
  steps:
    - name: Run ESLint (Frontend)
      run: npm run lint --workspace=@groney/frontend
    
    - name: Run ESLint (Backend Services)
      run: npm run lint --workspaces --if-present
    
    - name: TypeScript Type Check (Frontend)
      run: npm run check --workspace=@groney/frontend
```

---

## 7. Static Code Analysis

### 7.1 Analysis Tools (Requirement LO5 2.3)

The pipeline uses multiple tools for comprehensive static analysis:

| Tool | Purpose | Metrics |
|------|---------|---------|
| **ESLint** | Cyclomatic complexity | Functions with complexity > 15 |
| **jscpd** | Code duplication (code smells) | Duplicated lines, clone count |
| **Vitest v8** | Code coverage | Lines, statements, functions, branches |

### 7.2 Cyclomatic Complexity Analysis

```yaml
- name: Analyze Cyclomatic Complexity
  run: |
    cd frontend
    npx eslint . --format json > ../complexity-report.json
    # Parse and report complexity violations
    COMPLEX_COUNT=$(cat complexity-report.json | jq '[.[] | .messages[] | select(.ruleId == "complexity")] | length')
```

**Output Example:**
```
| Metric | Value |
|--------|-------|
| Functions with high complexity (>15) | 4 |
| Total ESLint Warnings | 106 |
| Total ESLint Errors | 0 |
```

### 7.3 Code Duplication Detection (Code Smells)

```yaml
- name: Detect Code Duplication
  run: |
    jscpd frontend/src --reporters json --output ./duplication-report
    # Parse and report duplication metrics
```

**Output Example:**
```
| Metric | Value |
|--------|-------|
| Code Clones Found | 3 |
| Duplicated Lines | 40 |
| Duplication % | 1.29% |
```

### 7.4 Code Coverage (Requirement LO5 3.1)

**Configuration:** `frontend/vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
});
```

**Output Example:**
```
| Metric | Coverage |
|--------|----------|
| Lines | 11.96% |
| Statements | 11.96% |
| Functions | 0% |
| Branches | 0% |
```

---

## 8. Containerization with Docker

### 8.1 Docker Build Job (Requirement 2.4)

```yaml
docker-build:
  name: 🐳 Docker Build
  runs-on: ubuntu-latest
  needs: build
  strategy:
    matrix:
      service:
        - name: frontend
          context: ./frontend
        - name: api-gateway
          context: ./backend/services/api-gateway
        - name: auth-service
          context: ./backend/services/auth-service
        # ... 6 more services
```

### 8.2 Containerized Services

| Service | Port | Docker Context |
|---------|------|----------------|
| Frontend | 5173 | `./frontend` |
| API Gateway | 3000 | `./backend/services/api-gateway` |
| Auth Service | 3001 | `./backend/services/auth-service` |
| Mascot Engine | 3002 | `./backend/services/mascot-engine` |
| Mission Service | 3003 | `./backend/services/mission-service` |
| Submission Service | 3004 | `./backend/services/submission-service` |
| Shop Service | 3005 | `./backend/services/shop-service` |
| Calculation Service | 3006 | `./backend/services/calculation-service` |
| Supply Service | 3007 | `./backend/services/supply-service` |

### 8.3 Container Registry

Images are pushed to **GitHub Container Registry (ghcr.io)**:

```yaml
- name: Build and Push Docker Image
  uses: docker/build-push-action@v5
  with:
    context: ${{ matrix.service.context }}
    push: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}
    tags: ${{ steps.meta.outputs.tags }}
```

**Tagging Strategy:**
- `latest` - Main branch builds
- `<branch-name>` - Branch-specific builds
- `<commit-sha>` - Unique commit identifier

### 8.4 Docker Compose Configuration

**File:** `docker-compose.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
  redis:
    image: redis:7-alpine
  minio:
    image: minio/minio:latest
  api-gateway:
    build: ./backend/services/api-gateway
  # ... all microservices
```

---

## 9. Environment Management

### 9.1 Separate Environment Parameters (Requirement 3.1)

Environment variables are managed separately from code:

#### Local Development
**File:** `.env` (gitignored)

```bash
NODE_ENV=development
POSTGRES_PASSWORD=groney_password
JWT_SECRET=your-secret-key
S3_ACCESS_KEY=minioadmin
# ... more variables
```

#### Template File
**File:** `.env.example` (committed)

```bash
NODE_ENV=development
POSTGRES_PASSWORD=groney_password
JWT_SECRET=your-secret-key-change-in-production
# ... documented variables
```

#### CI/CD Environment
**GitHub Secrets** for sensitive values:
- `GITHUB_TOKEN` - Container registry authentication
- `SLACK_WEBHOOK_URL` - Optional notifications

**Workflow Environment Variables:**
```yaml
env:
  DATABASE_URL: postgresql://testuser:testpassword@localhost:5432/testdb
  NODE_ENV: test
```

### 9.2 Environment Hierarchy

```
┌─────────────────────────────────────────┐
│           Production (OCI)              │
│  • OCI Vault for secrets                │
│  • Cloudflare Tunnel for access         │
└─────────────────────────────────────────┘
                    ▲
┌─────────────────────────────────────────┐
│           CI/CD (GitHub Actions)        │
│  • GitHub Secrets                       │
│  • Workflow env variables               │
└─────────────────────────────────────────┘
                    ▲
┌─────────────────────────────────────────┐
│           Local Development             │
│  • .env file (gitignored)               │
│  • .env.example (template)              │
└─────────────────────────────────────────┘
```

---

## 10. UML Sequence Diagram

### 10.1 Pipeline Execution Flow (Requirement 2.3)

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
     │               │                │               │ (96 tests)    │              │
     │               │                │               │───────┐       │              │
     │               │                │               │       │       │              │
     │               │                │               │◄──────┘       │              │
     │               │                │               │               │              │
     │               │                │               │ Generate      │              │
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
     │               │                │               │               │ Build Pass   │
     │               │                │               │               │─────────────►│
     │               │                │               │               │              │
     │               │                │               │               │              │ Build 9
     │               │                │               │               │              │ Images
     │               │                │               │               │              │──────┐
     │               │                │               │               │              │      │
     │               │                │               │               │              │◄─────┘
     │               │                │               │               │              │
     │               │                │               │               │              │ Push to
     │               │                │               │               │              │ GHCR
     │               │                │               │               │              │──────┐
     │               │                │               │               │              │      │
     │               │                │               │               │              │◄─────┘
     │               │                │               │               │              │
     │               │ Pipeline       │               │               │              │
     │               │ Complete       │               │               │              │
     │◄──────────────│                │               │               │              │
     │               │                │               │               │              │
```

### 10.2 Failure Notification Flow

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
                    │  • Commit   │
                    │  • Branch   │
                    │  • Author   │
                    └─────────────┘
```

---

## 11. Metrics & Reporting

### 11.1 Code Coverage Report (Requirement LO5 3.1)

The pipeline generates coverage reports visible in GitHub Actions Summary:

```
## 📊 Code Coverage Summary

| Metric | Coverage |
|--------|----------|
| Lines | 11.96% |
| Statements | 11.96% |
| Functions | 0% |
| Branches | 0% |
```

**Artifacts Generated:**
- `coverage-report` - HTML coverage report (downloadable)
- `coverage-summary.json` - Machine-readable metrics

### 11.2 Static Analysis Report

```
## 🔄 Cyclomatic Complexity Report

| Metric | Value |
|--------|-------|
| Functions with high complexity (>15) | 4 |
| Total ESLint Warnings | 106 |
| Total ESLint Errors | 0 |

## 🔁 Code Duplication Report

| Metric | Value |
|--------|-------|
| Code Clones Found | 3 |
| Duplicated Lines | 40 |
| Duplication % | 1.29% |
```

### 11.3 Failure Notification (Requirement 2.1)

When the pipeline fails, developers are notified via:

1. **GitHub Summary** - Detailed failure information
2. **GitHub Email** - Automatic notification to committer
3. **PR Status Checks** - Visible in pull request

```
## ❌ Build Failed

The CI pipeline has failed. Please check the logs above for details.

**Commit:** abc123def456
**Branch:** feature/new-feature
**Author:** developer@example.com

### Failed Jobs:
- Check the workflow run for specific failure details
```

### 11.4 Success Summary

```
## ✅ CI Pipeline Passed

All checks have passed successfully!

| Stage | Status |
|-------|--------|
| Lint & Code Quality | ✅ Passed |
| Unit Tests | ✅ Passed |
| Static Analysis | ✅ Passed |
| Build | ✅ Passed |

**Commit:** `abc123def456`
**Branch:** main
```

---

## 12. Evidence & Screenshots

### 12.1 Pipeline Execution

The pipeline runs automatically on every push and pull request:

- **Workflow File:** `.github/workflows/ci.yml`
- **Trigger Events:** `push`, `pull_request`
- **Target Branches:** `main`, `develop`

### 12.2 Artifacts Generated

| Artifact | Size | Contents |
|----------|------|----------|
| `build-artifacts` | ~180 MB | Compiled frontend |
| `code-analysis-reports` | ~87 KB | ESLint JSON, jscpd report |
| `coverage-report` | ~136 KB | HTML coverage report |

### 12.3 Test Results

All 96 tests pass automatically in the pipeline:

- Frontend: 59 tests ✅
- Auth Service: 33 tests ✅
- Shop Service: 2 tests ✅
- Supply Service: 2 tests ✅

### 12.4 GitHub Summary Output

The pipeline generates formatted summaries visible in the GitHub Actions interface showing:

- Code coverage percentages
- Cyclomatic complexity violations
- Code duplication metrics
- Overall pipeline status

---

## Appendix A: File References

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Main CI/CD pipeline configuration |
| `frontend/.eslintrc.cjs` | Frontend linting rules |
| `frontend/vitest.config.ts` | Frontend test configuration |
| `docker-compose.yml` | Container orchestration |
| `.env.example` | Environment variable template |
| `package.json` | Workspace configuration |

## Appendix B: Commands Reference

```bash
# Run all tests locally
npm test

# Run linting
npm run lint --workspaces

# Run frontend tests with coverage
npm run test:coverage --workspace=@groney/frontend

# Build all services
npm run build --workspaces

# Start Docker environment
docker-compose up -d
```

---
