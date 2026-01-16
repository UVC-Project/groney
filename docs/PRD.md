# Product Requirements Document (PRD)
## Green Schoolyard Gamification Platform - "Groeny"

**Version:** 1.0  
**Last Updated:** January 12, 2026  
**Product Owner:** Green Schoolyard Initiative  
**Target Users:** Dutch Primary School Students (ages 6-12) and Teachers

---

## 1. Executive Summary

### 1.1 Product Vision
Groeny is a gamified web platform that transforms green schoolyard maintenance into an engaging, collaborative experience for Dutch primary school children. By combining a Tamagotchi-style digital mascot with real-world environmental tasks, the platform addresses the "Maintenance Paradox" where schools invest in green schoolyards but struggle with ongoing upkeep.

### 1.2 Problem Statement
- Schools build green schoolyards but maintenance relies on overworked teachers
- Motivated children lack direction and structured engagement
- No system exists to track, reward, and gamify maintenance activities
- Environmental impact of student efforts goes unmeasured

### 1.3 Solution
A class-based gamification system where:
- Each class shares a digital mascot ("Groeny") whose health reflects real-world maintenance
- Students complete missions (watering plants, feeding animals, cleaning) to earn rewards
- Teachers manage classes, create missions, and validate student work
- Environmental impact (CO2 reduction) is calculated and displayed

---

## 2. User Personas

### 2.1 Primary Persona: Student (Age 6-12)
**Goals:**
- Have fun while helping maintain the schoolyard
- Earn rewards and customize their class mascot
- Compete with classmates and other classes
- Learn about environmental responsibility

**Pain Points:**
- Short attention span - needs engaging, visual feedback
- Limited reading ability - requires simple, icon-based UI
- Needs immediate gratification for completed tasks

### 2.2 Secondary Persona: Teacher
**Goals:**
- Organize and delegate maintenance tasks efficiently
- Track student participation and progress
- Reduce personal maintenance burden
- Integrate environmental education into curriculum

**Pain Points:**
- Limited time for additional administrative tasks
- Needs quick approval workflows
- Requires visibility into class-wide progress

---

## 3. Feature Specifications

### 3.1 Core Features

#### F1: User Authentication & Registration
| Attribute | Description |
|-----------|-------------|
| Priority | P0 (Critical) |
| Status | ✅ Implemented |
| Users | Students, Teachers |

**Capabilities:**
- Student registration with class code enrollment
- Teacher registration with email verification
- JWT-based session management (7-day expiry)
- Password reset via email
- Role-based access control (RBAC)

**Acceptance Criteria:**
- Users can register with username/password
- Students must provide valid class code
- Sessions persist across browser refreshes
- Failed logins show user-friendly error messages

---

#### F2: Class Management
| Attribute | Description |
|-----------|-------------|
| Priority | P0 (Critical) |
| Status | ✅ Implemented |
| Users | Teachers |

**Capabilities:**
- Create new classes with auto-generated class codes
- View enrolled students
- Switch between multiple classes
- Initialize default sectors and missions

**Acceptance Criteria:**
- Unique 6-character class codes generated
- Mascot initialized with default stats (100/100/100/100)
- Default sectors created: Trees, Flowers, Pond, Chickens, Garden

---

#### F3: Digital Mascot System ("Groeny")
| Attribute | Description |
|-----------|-------------|
| Priority | P0 (Critical) |
| Status | ✅ Implemented |
| Users | Students, Teachers |

**Capabilities:**
- Four health stats: Thirst, Hunger, Happiness, Cleanliness (0-100)
- Visual state changes based on health (Normal → Sad → Sick)
- Level progression system (1-10) based on XP
- Coin/seed currency for purchases
- Interactive "pet" feature (+5 happiness on tap)
- Real-time stat polling (5-second intervals)

**Stat Decay System:**
- Decay occurs only during school hours (8am-4pm, Mon-Fri)
- Configurable decay rates per stat (teacher-adjustable)
- Lazy evaluation pattern (calculated on fetch, not via cron)

| Stat | Default Decay Rate |
|------|-------------------|
| Thirst | 1.0 pts/hour |
| Hunger | 2.0 pts/hour |
| Happiness | 3.0 pts/hour |
| Cleanliness | 2.0 pts/hour |

**Level Progression:**
| Level | XP Required |
|-------|-------------|
| 1 | 0 |
| 2 | 100 |
| 3 | 250 |
| 4 | 500 |
| 5 | 1,000 |
| 6 | 2,000 |
| 7 | 3,500 |
| 8 | 5,500 |
| 9 | 8,000 |
| 10 | 11,000 |

---

#### F4: Interactive Schoolyard Map
| Attribute | Description |
|-----------|-------------|
| Priority | P0 (Critical) |
| Status | ✅ Implemented |
| Users | Students, Teachers |

**Capabilities:**
- Grid-based map builder (configurable dimensions)
- Drag-and-drop sector placement
- Sector types: Trees, Flowers, Pond, Animals, Garden, Playground, Compost
- Decoration elements: Buildings, Pavement, Parking, Fences, Benches
- Visual indicators for available missions
- Urgent mission highlighting (red sectors)

**Teacher Map Builder:**
- Add/remove/resize sectors
- Place decorations for visual context
- Rename sectors
- Configure map dimensions

---

#### F5: Mission System
| Attribute | Description |
|-----------|-------------|
| Priority | P0 (Critical) |
| Status | ✅ Implemented |
| Users | Students, Teachers |

**Capabilities:**
- Mission creation with customizable rewards
- Photo proof requirement
- QR code scanning support (optional)
- Class-wide cooldown system
- Maximum completion limits
- Mission categories: Thirst, Hunger, Happiness, Cleanliness

**Mission States:**
| State | Description |
|-------|-------------|
| Available | Can be accepted by any student |
| My Active | Currently assigned to viewing student |
| Taken | Another student is working on it |
| Cooldown | Recently completed, waiting period |
| Max Reached | Completion limit reached |

**Cooldown System:**
- Configurable hours before mission can be repeated
- Class-wide (not per-student) to reflect real-world state
- Prevents mission exploitation

---

#### F6: Submission & Validation Workflow
| Attribute | Description |
|-----------|-------------|
| Priority | P0 (Critical) |
| Status | ✅ Implemented |
| Users | Students, Teachers |

**Student Flow:**
1. Accept mission from map
2. Complete real-world task
3. Upload photo proof (max 5MB, JPEG/PNG)
4. Wait for teacher approval

**Teacher Flow:**
1. View pending submissions in dashboard
2. Review photo evidence
3. Approve or reject submission
4. Rewards automatically distributed on approval

**Photo Storage:**
- S3-compatible storage (MinIO)
- Served through API proxy for security
- Automatic bucket creation

---

#### F7: Reward & Progression System
| Attribute | Description |
|-----------|-------------|
| Priority | P1 (High) |
| Status | ✅ Implemented |
| Users | Students |

**Rewards on Mission Completion:**
- XP points (contributes to level)
- Coins/Seeds (currency for shop)
- Stat boosts (Thirst, Hunger, Happiness, Cleanliness)

**Login Streak System:**
- Daily login tracking
- Milestone rewards at 3, 7, 14, 30 days
- Streak reset notification
- Bonus coins for maintaining streaks

---

#### F8: Shop & Cosmetics
| Attribute | Description |
|-----------|-------------|
| Priority | P2 (Medium) |
| Status | ✅ Implemented |
| Users | Students |

**Capabilities:**
- Purchase cosmetic items with coins
- Item types: Hats, Accessories
- Ownership tracking per user
- Visual preview before purchase

**Available Items:**
- Red Cap, Blue Cap (Hats)
- Bow Tie, Sunglasses (Accessories)

---

#### F9: Wardrobe & Customization
| Attribute | Description |
|-----------|-------------|
| Priority | P2 (Medium) |
| Status | ✅ Implemented |
| Users | Students |

**Capabilities:**
- View owned items
- Equip/unequip items on Groeny
- Real-time preview of equipped items
- Persistent equipment state

---

#### F10: Activity Feed
| Attribute | Description |
|-----------|-------------|
| Priority | P2 (Medium) |
| Status | ✅ Implemented |
| Users | Students |

**Capabilities:**
- Class-wide activity stream
- Personal activity filter
- Activity types: Mission completed, Purchase, Level up
- Photo thumbnails for mission completions

---

#### F11: Teacher Dashboard
| Attribute | Description |
|-----------|-------------|
| Priority | P0 (Critical) |
| Status | ✅ Implemented |
| Users | Teachers |

**Dashboard Tabs:**
1. **Overview** - Class stats, mascot health, student list
2. **Missions** - Create/edit/delete missions
3. **Submissions** - Review pending submissions
4. **Map** - Configure schoolyard map
5. **Supplies** - Manage supply requests
6. **Settings** - Decay rates, QR codes

---

#### F12: Supply Request System
| Attribute | Description |
|-----------|-------------|
| Priority | P3 (Low) |
| Status | ✅ Implemented |
| Users | Students, Teachers |

**Capabilities:**
- Students request real-world supplies (gloves, seeds, watering cans)
- Teachers approve/reject requests
- Request status tracking

---

#### F13: CO2 Impact Calculation
| Attribute | Description |
|-----------|-------------|
| Priority | P2 (Medium) |
| Status | ✅ Implemented |
| Users | Students, Teachers |

**CO2 Factors (kg per mission):**
| Task Type | CO2 Reduction |
|-----------|---------------|
| Watering | 0.5 kg |
| Weeding | 0.3 kg |
| Planting | 1.0 kg |
| Cleaning | 0.2 kg |
| Feeding | 0.1 kg |

**Capabilities:**
- Calculate CO2 reduction per mission
- Aggregate class-wide impact
- Date range filtering
- Sector-to-task type mapping

---

#### F14: QR Code & Wiki System
| Attribute | Description |
|-----------|-------------|
| Priority | P3 (Low) |
| Status | ✅ Implemented |
| Users | Students, Teachers |

**Capabilities:**
- Generate printable QR codes per sector type
- Wiki pages with educational content
- Sector-specific care guides
- Related missions display

---

#### F15: Weather Widget
| Attribute | Description |
|-----------|-------------|
| Priority | P3 (Low) |
| Status | ✅ Implemented |
| Users | Students |

**Capabilities:**
- Display current weather conditions
- Compact and full display modes
- Location-based weather data

---

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- Page load time < 3 seconds
- API response time < 500ms
- Support 100+ concurrent users per school

#### NFR2: Accessibility
- WCAG 2.1 AA compliance
- Minimum touch target 48px
- Reduced motion support
- Screen reader compatible

#### NFR3: Security
- HTTPS only (via Cloudflare Tunnel)
- JWT token authentication
- Password hashing (bcrypt)
- SQL injection prevention (Prisma ORM)
- XSS protection

#### NFR4: Responsive Design
- Mobile-first approach
- Tablet optimization (Chromebook support)
- Desktop support

---

## 4. Technical Architecture

### 4.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | SvelteKit 5, TypeScript, TailwindCSS |
| API Gateway | Express.js, TypeScript |
| Backend Services | Node.js, Express, TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Cache | Redis 7 |
| Object Storage | MinIO (S3-compatible) |
| Deployment | Docker Compose, Oracle Cloud |
| CDN/Security | Cloudflare Tunnel (Zero Trust) |

### 4.2 Microservices Architecture

| Service | Port | Responsibility |
|---------|------|----------------|
| API Gateway | 3000 | Request routing, rate limiting |
| Auth Service | 3001 | Authentication, user management |
| Mascot Engine | 3002 | Stat decay, leveling, interactions |
| Mission Service | 3003 | Sectors, missions, activities |
| Submission Service | 3004 | Photo uploads, submission workflow |
| Shop Service | 3005 | Items, purchases, wardrobe |
| Calculation Service | 3006 | CO2 impact calculations |
| Supply Service | 3007 | Supply requests management |

---

## 5. Data Model Summary

### Core Entities
- **User** - Students and teachers with role-based access
- **Class** - Groups of students with shared mascot
- **Mascot** - Per-class digital pet with stats
- **Sector** - Schoolyard areas (Trees, Pond, etc.)
- **Mission** - Tasks with rewards and requirements
- **Submission** - Student proof of work
- **ShopItem** - Purchasable cosmetics
- **Purchase** - Ownership records
- **Activity** - Feed entries
- **Supply/SupplyRequest** - Real-world supply management

---

## 6. Success Metrics

### 6.1 Engagement Metrics
- Daily Active Users (DAU)
- Missions completed per week
- Average session duration
- Login streak retention

### 6.2 Educational Metrics
- CO2 reduction calculated
- Sectors maintained per class
- Student participation rate

### 6.3 Technical Metrics
- API uptime (target: 99.5%)
- Error rate (target: < 1%)
- Page load performance

---

## 7. Future Roadmap

### Phase 2 (Planned)
- [ ] Push notifications for low mascot stats
- [ ] WebSocket real-time updates
- [ ] Class leaderboard
- [ ] Achievement/badge system
- [ ] CO2 dashboard visualization

### Phase 3 (Planned)
- [ ] Multi-language support (Dutch, English)
- [ ] Parent portal
- [ ] School-wide competitions
- [ ] Integration with school calendars
- [ ] Export reports (PDF/CSV)

---

## 8. Appendix

### A. Glossary
| Term | Definition |
|------|------------|
| Groeny | The digital mascot character |
| Seeds | In-game currency (coins) |
| Sector | Physical area of schoolyard |
| Mission | Real-world maintenance task |
| Submission | Student's proof of work |

### B. Related Documents
- [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md)
- [CO2 Calculation Feature](./CO2_CALCULATION_FEATURE.md)
- [Gameloop Implementation](./GAMELOOP_IMPLEMENTATION_DOC.md)
- [QR Code Wiki Feature](./QR_CODE_WIKI_FEATURE.md)
