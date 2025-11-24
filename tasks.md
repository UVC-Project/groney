# Implementation Plan

## Phase 1: Project Setup and Core Infrastructure

- [ ] 1. Initialize project structure
- [ ] 1.1 Create monorepo structure with workspaces
  - Create root package.json with workspaces for frontend, backend services
  - Set up TypeScript configuration for all packages
  - Configure ESLint and Prettier for code quality
  - _Requirements: All_

- [ ] 1.2 Initialize SvelteKit 5 frontend
  - Run `npm create svelte@latest frontend`
  - Configure TypeScript, ESLint, Prettier
  - Set up TailwindCSS with custom design tokens
  - Create base layout with navigation structure
  - _Requirements: 18.1, 18.2, 18.3_

- [ ] 1.3 Set up API Gateway service
  - Create Express.js API Gateway in `services/api-gateway`
  - Configure http-proxy-middleware for routing
  - Implement rate limiting with express-rate-limit
  - Set up CORS configuration
  - Add request logging middleware
  - _Requirements: All API requirements_

- [ ] 1.4 Configure PostgreSQL database
  - Set up PostgreSQL connection
  - Install Drizzle ORM
  - Create database schema file based on design
  - Configure database migrations
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [ ] 1.5 Configure Redis for sessions and caching
  - Set up Redis connection
  - Configure session store
  - Implement caching utilities
  - _Requirements: 15.1, 15.2_


## Phase 2: Authentication Service

- [ ] 2. Build Authentication microservice
- [ ] 2.1 Create Authentication Service structure
  - Create Express app in `services/auth-service`
  - Set up database connection
  - Configure JWT token generation and validation
  - Implement password hashing with bcrypt
  - _Requirements: 1.1, 1.4, 15.1_

- [ ] 2.2 Implement user registration endpoints
  - POST /api/auth/register endpoint
  - Validate registration data with Zod
  - Hash passwords before storage
  - Generate unique class codes for teachers
  - Validate class codes for students
  - _Requirements: 1.2, 1.3_

- [ ]* 2.3 Write property test for registration
  - **Property 2: Student registration requires valid class code**
  - **Property 3: Teacher registration succeeds without class code**
  - **Validates: Requirements 1.2, 1.3**

- [ ] 2.4 Implement login endpoints
  - POST /api/auth/login endpoint
  - Verify credentials against database
  - Generate JWT tokens on successful login
  - Create session in Redis
  - _Requirements: 1.1, 15.1, 15.2_

- [ ]* 2.5 Write property test for authentication
  - **Property 1: Valid credentials create sessions**
  - **Property 4: Invalid credentials are rejected**
  - **Validates: Requirements 1.1, 1.4**

- [ ] 2.6 Implement logout and session management
  - POST /api/auth/logout endpoint
  - GET /api/auth/me endpoint
  - POST /api/auth/refresh endpoint
  - Session expiration handling
  - _Requirements: 15.3, 15.4_

- [ ]* 2.7 Write property test for session management
  - **Property 5: Sessions persist across navigation**
  - **Property 62: Session expiration setting**
  - **Property 64: Logout destroys session**
  - **Property 65: Expired session rejection**
  - **Validates: Requirements 1.5, 15.1, 15.3, 15.4**

- [ ] 2.8 Implement class management endpoints
  - POST /api/auth/class/create endpoint
  - GET /api/auth/class/:classId endpoint
  - GET /api/auth/class/teacher/:teacherId endpoint
  - POST /api/auth/class/switch endpoint
  - POST /api/auth/class/join endpoint
  - _Requirements: 2.1, 2.4, 12.5_

- [ ]* 2.9 Write property test for class management
  - **Property 6: Class codes are unique**
  - **Property 9: Valid class code associates student**
  - **Property 53: Class switching**
  - **Validates: Requirements 2.1, 2.4, 12.5**


## Phase 3: Mascot Engine Service

- [ ] 3. Build Mascot Engine microservice
- [ ] 3.1 Create Mascot Engine structure
  - Create Express app in `services/mascot-engine`
  - Set up database connection
  - Implement mascot data models
  - _Requirements: 3.1, 3.4_

- [ ] 3.2 Implement mascot initialization
  - Create mascot on class creation
  - Set default stats (Thirst: 100, Hunger: 100, Happiness: 100, Cleanliness: 100)
  - Set default progression (Level: 1, XP: 0, Coins: 0)
  - _Requirements: 2.2_

- [ ]* 3.3 Write property test for mascot initialization
  - **Property 7: Mascot initialization defaults**
  - **Validates: Requirements 2.2**

- [ ] 3.4 Implement mascot status endpoint
  - GET /api/mascot/status/:userId endpoint
  - Retrieve mascot by user's class
  - Return all mascot stats and equipped items
  - _Requirements: 3.1, 3.4, 3.5_

- [ ]* 3.5 Write property test for mascot stats
  - **Property 14: Stats remain within bounds**
  - **Validates: Requirements 3.4**

- [ ] 3.6 Implement pet interaction
  - POST /api/mascot/pet endpoint
  - Increase Happiness by 5 (cap at 100)
  - Update mascot in database
  - _Requirements: 3.3_

- [ ]* 3.7 Write property test for pet interaction
  - **Property 12: Pet interaction increases happiness**
  - **Property 13: Pet interaction caps at 100**
  - **Validates: Requirements 3.3**

- [ ] 3.8 Implement stat boost endpoint
  - POST /api/mascot/boost endpoint
  - Apply stat boosts from mission completion
  - Ensure stats don't exceed 100
  - Update mascot in database
  - _Requirements: 7.5, 8.4_

- [ ]* 3.9 Write property test for stat boosts
  - **Property 31: Approval applies stat boosts**
  - **Property 35: Stat ceiling enforcement**
  - **Validates: Requirements 7.5, 8.4**

- [ ] 3.10 Implement reward awarding
  - POST /api/mascot/award endpoint
  - Add XP and coins to mascot
  - Calculate and update level based on XP
  - Update mascot in database
  - _Requirements: 7.4, 8.1, 8.2, 8.3_

- [ ]* 3.11 Write property test for rewards
  - **Property 30: Approval awards XP and coins**
  - **Property 32: XP accumulation**
  - **Property 33: Coin accumulation**
  - **Property 34: Level calculation**
  - **Validates: Requirements 7.4, 8.1, 8.2, 8.3**

- [ ] 3.12 Implement stat decay system
  - POST /api/mascot/decay endpoint (internal only)
  - Set up node-cron for scheduled decay
  - Decrease Thirst, Hunger, Happiness, Cleanliness at defined rates
  - Ensure stats don't fall below 0
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [ ]* 3.13 Write property test for stat decay
  - **Property 76: Thirst decay rate**
  - **Property 77: Hunger decay rate**
  - **Property 78: Happiness decay rate**
  - **Property 79: Cleanliness decay rate**
  - **Property 80: Stat floor enforcement**
  - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5**


## Phase 4: Mission Service

- [ ] 4. Build Mission microservice
- [ ] 4.1 Create Mission Service structure
  - Create Express app in `services/mission-service`
  - Set up database connection
  - Implement sector and mission data models
  - _Requirements: 4.1, 5.1_

- [ ] 4.2 Implement sector initialization
  - Create default sectors on class creation
  - Initialize 5 sector types (trees, flowers, pond, chickens, garden)
  - Create default missions for each sector
  - _Requirements: 2.3_

- [ ]* 4.3 Write property test for sector initialization
  - **Property 8: Class creation initializes sectors**
  - **Validates: Requirements 2.3**

- [ ] 4.4 Implement sector endpoints
  - GET /api/sectors/:classId endpoint
  - Return all sectors for a class
  - Include sector name, type, and description
  - _Requirements: 4.1, 4.3_

- [ ]* 4.5 Write property test for sectors
  - **Property 16: All class sectors are displayed**
  - **Property 18: Sector data completeness**
  - **Validates: Requirements 4.1, 4.3**

- [ ] 4.6 Implement mission retrieval endpoints
  - GET /api/missions/sector/:sectorId endpoint
  - GET /api/missions/:id endpoint
  - Return mission details with rewards and requirements
  - _Requirements: 4.2, 5.1, 5.2_

- [ ]* 4.7 Write property test for missions
  - **Property 17: Sector missions are retrievable**
  - **Property 19: Mission data completeness**
  - **Validates: Requirements 4.2, 5.1, 5.2**

- [ ] 4.8 Implement mission creation endpoint (teacher only)
  - POST /api/missions endpoint
  - Validate required fields (sectorId, title, description)
  - Validate sector belongs to teacher's class
  - Store mission with rewards and boosts
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]* 4.9 Write property test for mission creation
  - **Property 54: Mission creation validation**
  - **Property 55: Mission reward storage**
  - **Property 56: Mission sector association**
  - **Property 57: Cross-class mission rejection**
  - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**

- [ ] 4.10 Implement mission update and delete endpoints
  - PUT /api/missions/:id endpoint
  - DELETE /api/missions/:id endpoint
  - Validate teacher permissions
  - _Requirements: 13.1_

- [ ] 4.11 Implement activity feed endpoints
  - GET /api/activities/:classId endpoint
  - POST /api/activities endpoint
  - Return activities in chronological order
  - _Requirements: 11.3, 11.4, 11.5_

- [ ]* 4.12 Write property test for activity feed
  - **Property 48: Activity chronological ordering**
  - **Property 49: Activity data completeness**
  - **Property 50: Activity image display**
  - **Validates: Requirements 11.3, 11.4, 11.5**


## Phase 5: Submission Service

- [ ] 5. Build Submission microservice
- [ ] 5.1 Create Submission Service structure
  - Create Express app in `services/submission-service`
  - Set up database connection
  - Configure Multer for file uploads
  - Set up Object Storage (S3-compatible) connection
  - _Requirements: 6.1, 17.1, 17.2_

- [ ] 5.2 Implement photo upload handling
  - Configure Multer with 5MB size limit
  - Validate image file types (JPEG, PNG, GIF, WebP)
  - Upload photos to Object Storage
  - Generate and store photo URLs
  - _Requirements: 6.1, 17.1, 17.2_

- [ ]* 5.3 Write property test for photo upload
  - **Property 22: Photo size validation**
  - **Property 70: Image format acceptance**
  - **Validates: Requirements 6.1, 17.1, 17.2**

- [ ] 5.4 Implement submission creation endpoint
  - POST /api/submissions endpoint
  - Accept FormData with photo and mission details
  - Validate required photo for missions with requiresPhoto=true
  - Set initial status to 'pending_approval'
  - Store submission with all required fields
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 5.5 Write property test for submission creation
  - **Property 23: Required photo validation**
  - **Property 24: Submission initial status**
  - **Property 25: Submission data completeness**
  - **Validates: Requirements 6.2, 6.3, 6.4**

- [ ] 5.6 Implement QR code validation
  - POST /api/submissions/validate-qr endpoint
  - Validate QR code data against mission
  - Return validation result
  - _Requirements: 6.5_

- [ ] 5.7 Implement submission retrieval endpoints
  - GET /api/submissions/pending/:classId endpoint
  - GET /api/submissions/user/:userId endpoint
  - Filter submissions by status and class
  - Include mission and student details
  - _Requirements: 7.1, 12.4_

- [ ]* 5.8 Write property test for submission filtering
  - **Property 27: Pending submissions filtering**
  - **Property 52: Submission detail completeness**
  - **Validates: Requirements 7.1, 12.4**

- [ ] 5.9 Implement submission review endpoint
  - PUT /api/submissions/:id/review endpoint
  - Update submission status (completed/rejected)
  - Record reviewer ID and notes
  - Trigger mascot reward on approval
  - Create activity feed entry on approval
  - _Requirements: 7.2, 7.3, 7.4, 7.5, 8.5, 11.1_

- [ ]* 5.10 Write property test for submission review
  - **Property 28: Approval updates status**
  - **Property 29: Rejection updates status**
  - **Property 36: Activity creation on reward**
  - **Validates: Requirements 7.2, 7.3, 8.5, 11.1**


## Phase 6: Shop Service

- [ ] 6. Build Shop microservice
- [ ] 6.1 Create Shop Service structure
  - Create Express app in `services/shop-service`
  - Set up database connection
  - Implement shop item and purchase data models
  - _Requirements: 9.1, 9.5_

- [ ] 6.2 Initialize shop items
  - Create seed data for default shop items
  - Include hats, accessories, colors, and supplies
  - Set prices and image URLs
  - _Requirements: 9.1_

- [ ] 6.3 Implement shop item endpoints
  - GET /api/shop/items endpoint
  - Return all available shop items
  - Include name, type, price, imageUrl
  - _Requirements: 9.1_

- [ ]* 6.4 Write property test for shop items
  - **Property 37: Shop item data completeness**
  - **Validates: Requirements 9.1**

- [ ] 6.5 Implement purchase endpoint
  - POST /api/shop/purchase endpoint
  - Validate sufficient coins
  - Validate item not already owned
  - Deduct coins from mascot
  - Create purchase record
  - Create activity feed entry
  - _Requirements: 9.2, 9.3, 9.4, 9.5, 11.2_

- [ ]* 6.6 Write property test for purchases
  - **Property 38: Purchase deducts coins**
  - **Property 39: Insufficient coins rejection**
  - **Property 40: Duplicate purchase prevention**
  - **Property 41: Purchase record completeness**
  - **Property 47: Purchase creates activity**
  - **Validates: Requirements 9.2, 9.3, 9.4, 9.5, 11.2**

- [ ] 6.7 Implement purchase retrieval endpoints
  - GET /api/shop/purchases/user/:userId endpoint
  - GET /api/shop/purchases/class/:classId endpoint
  - Return all purchases for user or class
  - _Requirements: 9.5_

- [ ] 6.8 Implement item equipping endpoints
  - POST /api/shop/equip endpoint
  - Validate item ownership
  - Update mascot equipped slots (hat, accessory, color)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ]* 6.9 Write property test for equipping
  - **Property 42: Hat equipping updates mascot**
  - **Property 43: Accessory equipping updates mascot**
  - **Property 44: Color equipping updates mascot**
  - **Property 45: Unowned item equip rejection**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [ ] 6.10 Implement item unequipping endpoint
  - POST /api/shop/unequip endpoint
  - Clear mascot equipped slot
  - _Requirements: 10.5_

- [ ]* 6.11 Write property test for unequipping
  - **Property 46: Unequip clears slot**
  - **Validates: Requirements 10.5**


## Phase 7: Calculation Service

- [ ] 7. Build Calculation microservice
- [ ] 7.1 Create Calculation Service structure
  - Create Express app in `services/calculation-service`
  - Implement CO2 calculation formulas
  - Define CO2 factors for each task type
  - _Requirements: 14.1, 14.4_

- [ ] 7.2 Implement CO2 calculation endpoint
  - POST /api/calculate/co2 endpoint
  - Accept array of missions with types and quantities
  - Calculate CO2 reduction for each mission
  - Return total and breakdown in JSON format
  - _Requirements: 14.1, 14.2, 14.4_

- [ ]* 7.3 Write property test for CO2 calculation
  - **Property 58: CO2 calculation consistency**
  - **Property 59: CO2 response format**
  - **Property 61: Task-specific CO2 factors**
  - **Validates: Requirements 14.1, 14.2, 14.4**

- [ ] 7.4 Implement class CO2 aggregation endpoint
  - GET /api/calculate/co2/class/:classId endpoint
  - Query all completed missions for class
  - Calculate total CO2 reduction
  - Support date range filtering
  - _Requirements: 14.3_

- [ ]* 7.5 Write property test for CO2 aggregation
  - **Property 60: CO2 aggregation**
  - **Validates: Requirements 14.3**


## Phase 8: SvelteKit Frontend - Core Pages

- [ ] 8. Build SvelteKit frontend application
- [ ] 8.1 Set up authentication pages
  - Create src/routes/login/+page.svelte
  - Create src/routes/register/+page.svelte
  - Implement login form with validation
  - Implement registration form with role selection
  - Create +page.server.ts for form actions
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 8.2 Create authentication utilities
  - Implement JWT token storage (cookies)
  - Create auth store for user state
  - Implement hooks.server.ts for auth middleware
  - Create protected route guards
  - _Requirements: 1.5, 15.1_

- [ ] 8.3 Build Home page
  - Create src/routes/+page.svelte
  - Implement +page.ts load function to fetch mascot and activities
  - Create MascotDisplay.svelte component
  - Create StatCard.svelte component
  - Implement pet interaction handler
  - Display activity feed
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 11.3, 11.4, 11.5_

- [ ] 8.4 Build Map page
  - Create src/routes/map/+page.svelte
  - Implement +page.ts load function to fetch sectors
  - Display interactive sector map
  - Implement sector selection navigation
  - Show mission indicators
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 8.5 Build Mission Detail page
  - Create src/routes/mission/[id]/+page.svelte
  - Implement +page.ts load function to fetch mission
  - Display mission details and rewards
  - Implement photo upload interface
  - Implement QR code scanning interface
  - Create submission form action
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2_

- [ ] 8.6 Build Shop page
  - Create src/routes/shop/+page.svelte
  - Implement +page.ts load function to fetch items and purchases
  - Create tabbed interface for item categories
  - Display item grid with prices
  - Implement purchase handler
  - Show ownership indicators
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 8.7 Build Wardrobe page
  - Create src/routes/wardrobe/+page.svelte
  - Implement +page.ts load function to fetch mascot and owned items
  - Display mascot preview with equipped items
  - Create category tabs
  - Implement equip/unequip handlers
  - Show visual feedback for equipped items
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8.8 Build Teacher Dashboard page
  - Create src/routes/teacher/+page.svelte
  - Implement +page.ts load function (teacher-only)
  - Display class overview
  - Show pending submissions queue
  - Create SubmissionReviewCard.svelte component
  - Implement approve/reject handlers
  - Display mission creation form
  - Show student list
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 13.1, 13.2_


## Phase 9: SvelteKit Frontend - Components and Styling

- [ ] 9. Build reusable components and styling
- [ ] 9.1 Create MascotDisplay component
  - Implement MascotDisplay.svelte
  - Display mascot image with vine wreath decoration
  - Show level badge and coin count
  - Handle tap interactions with Svelte events
  - Add Svelte transitions for animations
  - _Requirements: 3.1, 3.3, 3.5_

- [ ] 9.2 Create StatCard component
  - Implement StatCard.svelte
  - Color-code borders by stat type
  - Display icon and progress bar
  - Use Svelte tweened stores for smooth animations
  - _Requirements: 3.4_

- [ ] 9.3 Create BottomNav component
  - Implement BottomNav.svelte
  - Create 5 navigation tabs
  - Implement active state using $page.url
  - Add decorative curved top edge
  - _Requirements: All navigation_

- [ ] 9.4 Create MissionCard component
  - Implement MissionCard.svelte
  - Display mission preview
  - Show rewards and requirements
  - Handle click navigation
  - _Requirements: 5.1, 5.2_

- [ ] 9.5 Create SubmissionReviewCard component
  - Implement SubmissionReviewCard.svelte (teacher only)
  - Display photo proof
  - Show approve/reject buttons
  - Include notes textarea
  - _Requirements: 12.4_

- [ ] 9.6 Implement TailwindCSS design system
  - Configure custom color palette (Sky Blue, Grass Green, Sunshine Yellow, etc.)
  - Set up custom fonts (Fredoka for students, Inter for teachers)
  - Create utility classes for game-like styling
  - Implement responsive breakpoints
  - _Requirements: 18.1, 18.2, 18.3_

- [ ] 9.7 Create toast notification system
  - Implement toast store
  - Create Toast.svelte component
  - Add success/error/info variants
  - Use Svelte transitions
  - _Requirements: 19.1, 19.3, 19.4_

- [ ] 9.8 Create error pages
  - Create src/routes/+error.svelte
  - Implement custom 401, 403, 404, 500 pages
  - Add handleError hook in hooks.server.ts
  - _Requirements: 19.1, 19.2_


## Phase 10: API Gateway Integration

- [ ] 10. Connect API Gateway to all microservices
- [ ] 10.1 Configure service routing
  - Set up proxy routes for all microservices
  - Configure health check endpoints
  - Implement service discovery (if using Docker)
  - _Requirements: All API requirements_

- [ ] 10.2 Implement JWT validation middleware
  - Create middleware to validate JWT tokens
  - Extract user information from tokens
  - Handle token expiration
  - Pass user context to downstream services
  - _Requirements: 15.1, 15.4_

- [ ] 10.3 Configure rate limiting
  - Set up rate limits per endpoint
  - Configure Redis-backed rate limiting
  - Implement different limits for authenticated vs anonymous users
  - _Requirements: All API requirements_

- [ ] 10.4 Set up request logging
  - Log all incoming requests
  - Include request ID for tracing
  - Log response times and status codes
  - _Requirements: 19.5_

- [ ] 10.5 Configure CORS
  - Set up CORS for SvelteKit frontend
  - Configure allowed origins
  - Set up credentials handling
  - _Requirements: All API requirements_


## Phase 11: Data Integrity and Validation

- [ ] 11. Implement data integrity and validation
- [ ] 11.1 Set up database constraints
  - Configure foreign key constraints
  - Set up unique constraints (usernames, class codes)
  - Configure cascade delete rules
  - _Requirements: 16.1, 16.2, 16.3_

- [ ]* 11.2 Write property test for data integrity
  - **Property 66: Entity ID uniqueness**
  - **Property 67: Referential integrity enforcement**
  - **Property 68: Cascade deletion**
  - **Validates: Requirements 16.1, 16.2, 16.3**

- [ ] 11.3 Implement Zod validation schemas
  - Create schemas for all API request bodies
  - Validate user registration data
  - Validate mission creation data
  - Validate submission data
  - _Requirements: 1.2, 13.1, 6.2_

- [ ] 11.4 Implement timestamp handling
  - Configure timezone for all timestamps
  - Use consistent timestamp format (ISO 8601)
  - Set up automatic timestamp updates
  - _Requirements: 16.4_

- [ ]* 11.5 Write property test for timestamps
  - **Property 69: Timestamp consistency**
  - **Validates: Requirements 16.4**

- [ ] 11.6 Implement error response formatting
  - Create standard error response format
  - Include error codes and messages
  - Add stack traces in development mode
  - _Requirements: 16.5, 19.1, 19.2, 19.3_

- [ ]* 11.7 Write property test for error handling
  - **Property 71: API error messages**
  - **Property 72: Validation error specificity**
  - **Property 73: Network error handling**
  - **Property 75: Error logging completeness**
  - **Validates: Requirements 19.1, 19.2, 19.3, 19.5**


## Phase 12: Testing Infrastructure

- [ ] 12. Set up testing infrastructure
- [ ] 12.1 Configure Vitest for backend services
  - Install Vitest and testing utilities
  - Configure test environment
  - Set up test database
  - Create test utilities and helpers
  - _Requirements: All_

- [ ] 12.2 Configure Vitest for SvelteKit frontend
  - Install Vitest and Svelte Testing Library
  - Configure test environment for Svelte components
  - Set up mock API responses
  - Create component test utilities
  - _Requirements: All_

- [ ] 12.3 Set up fast-check for property-based testing
  - Install fast-check library
  - Create custom generators for domain objects
  - Configure test iterations (minimum 100)
  - Set up shrinking for failed tests
  - _Requirements: All_

- [ ] 12.4 Create test data generators
  - Generate random users (students and teachers)
  - Generate random classes with codes
  - Generate random mascots with stats
  - Generate random missions and submissions
  - Generate random shop items and purchases
  - _Requirements: All_

- [ ] 12.5 Set up integration test environment
  - Configure test containers for PostgreSQL
  - Configure test Redis instance
  - Set up mock Object Storage
  - Create integration test utilities
  - _Requirements: All_


## Phase 13: Deployment and DevOps

- [ ] 13. Set up deployment infrastructure
- [ ] 13.1 Create Docker containers
  - Create Dockerfile for each microservice
  - Create Dockerfile for SvelteKit frontend
  - Create Dockerfile for API Gateway
  - Optimize images for production
  - _Requirements: All_

- [ ] 13.2 Create docker-compose configuration
  - Configure all services in docker-compose.yml
  - Set up service dependencies
  - Configure environment variables
  - Set up volumes for persistence
  - _Requirements: All_

- [ ] 13.3 Set up environment configuration
  - Create .env.example files
  - Document all environment variables
  - Set up different configs for dev/staging/prod
  - Configure secrets management
  - _Requirements: All_

- [ ] 13.4 Create database migrations
  - Set up Drizzle migrations
  - Create initial schema migration
  - Create seed data migrations
  - Document migration process
  - _Requirements: 16.1, 16.2, 16.3_

- [ ] 13.5 Set up CI/CD pipeline
  - Configure automated testing
  - Set up linting and type checking
  - Configure automated builds
  - Set up deployment automation
  - _Requirements: All_


## Phase 14: Additional Features and Polish

- [ ] 14. Implement additional features
- [ ] 14.1 Add accessibility features
  - Ensure minimum 48px touch targets
  - Add ARIA labels to interactive elements
  - Implement keyboard navigation
  - Respect prefers-reduced-motion
  - Test with screen readers
  - _Requirements: 18.3, 18.5_

- [ ] 14.2 Implement responsive design
  - Test on mobile devices (320px - 480px)
  - Test on tablets (768px - 1024px)
  - Test on desktop (1280px+)
  - Optimize images for different screen sizes
  - _Requirements: 18.1, 18.2, 18.4_

- [ ] 14.3 Add loading states and optimistic updates
  - Implement loading spinners
  - Add skeleton screens
  - Implement optimistic UI updates
  - Handle loading errors gracefully
  - _Requirements: 19.1, 19.4_

- [ ] 14.4 Implement success feedback
  - Add success toasts for all operations
  - Add confetti animation for level ups
  - Add coin animation for purchases
  - Add sparkle effect for pet interactions
  - _Requirements: 19.4_

- [ ] 14.5 Add CO2 impact display
  - Create CO2 dashboard component
  - Display total class CO2 reduction
  - Show CO2 breakdown by task type
  - Add date range filtering
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 14.6 Implement Wiki/Help page
  - Create src/routes/wiki/+page.svelte
  - Document how to use the app
  - Explain mascot stats and decay
  - Provide mission completion tips
  - Add FAQ section
  - _Requirements: All_


## Phase 15: Final Integration and Testing

- [ ] 15. Final integration and testing
- [ ] 15.1 End-to-end testing
  - Test complete student flow (register → login → view missions → submit → see rewards)
  - Test complete teacher flow (create class → create missions → review submissions)
  - Test class joining flow
  - Test shop purchase and equip flow
  - Test stat decay over time
  - _Requirements: All_

- [ ] 15.2 Performance testing
  - Test API response times
  - Test database query performance
  - Test image upload performance
  - Optimize slow queries
  - _Requirements: All_

- [ ] 15.3 Security testing
  - Test authentication and authorization
  - Test input validation and sanitization
  - Test file upload security
  - Test rate limiting
  - Test CORS configuration
  - _Requirements: 1.1, 1.4, 15.1, 15.3, 15.5_

- [ ] 15.4 Cross-browser testing
  - Test on Chrome/Edge
  - Test on Firefox
  - Test on Safari
  - Test on mobile browsers
  - _Requirements: 18.1, 18.2_

- [ ] 15.5 Load testing
  - Test with multiple concurrent users
  - Test database connection pooling
  - Test Redis session handling
  - Identify and fix bottlenecks
  - _Requirements: All_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Run all unit tests
  - Run all property-based tests
  - Run all integration tests
  - Fix any failing tests
  - Verify test coverage meets goals (80%+ core logic, 70%+ API routes)
  - _Requirements: All_

