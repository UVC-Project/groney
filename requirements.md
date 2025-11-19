# Requirements Document

## Introduction

The Green Schoolyard Gamification System is a web application designed to mobilize primary school children (ages 6-12) in the Netherlands to maintain "Green Schoolyards" (Groene Schoolpleinen). The system addresses the "Maintenance Paradox" where schools build green yards but maintenance relies on overworked teachers while motivated children lack direction. The solution is a Tamagotchi-style digital mascot named "Groeny" whose health stats are directly tied to real-world physical maintenance tasks completed by students.

## Glossary

- **System**: The Green Schoolyard Gamification web application
- **Groeny**: The digital mascot character displayed to students
- **Student**: A primary school child (ages 6-12) who uses the application to complete missions
- **Teacher**: An adult educator who manages classes, validates missions, and oversees the system
- **Class**: A group of students and their shared mascot, identified by a unique class code
- **Mission**: A real-world maintenance task that students can accept and complete
- **Sector**: A physical area of the schoolyard (e.g., Chicken Coop, Veggie Garden, Pond)
- **Submission**: A student's proof of mission completion, including photo evidence
- **Mascot Stats**: Numerical values representing Groeny's health (Thirst, Hunger, Happiness, Cleanliness)
- **XP**: Experience points earned by completing missions, used for leveling up
- **Coins**: Virtual currency earned by completing missions, used to purchase cosmetic items
- **Shop Item**: A cosmetic customization (hat, accessory, color) that can be purchased with coins
- **Class Code**: A unique alphanumeric identifier used by students to join a class
- **Proof of Work**: Evidence submitted by students to demonstrate mission completion
- **CO2 Calculation**: A computation of carbon reduction based on completed maintenance work

## Requirements

### Requirement 1: User Authentication and Registration

**User Story:** As a student or teacher, I want to securely register and log into the system, so that I can access my class data and maintain progress.

#### Acceptance Criteria

1. WHEN a user provides valid credentials (username and password), THE System SHALL authenticate the user and create a session
2. WHEN a student registers, THE System SHALL require a valid class code to associate the student with a class
3. WHEN a teacher registers, THE System SHALL create a new user account without requiring a class code
4. WHEN authentication fails due to invalid credentials, THE System SHALL reject the login attempt and display an error message
5. WHERE a user session exists, THE System SHALL maintain authentication state across page navigation

### Requirement 2: Class Management

**User Story:** As a teacher, I want to create and manage classes, so that I can organize students and their shared mascot.

#### Acceptance Criteria

1. WHEN a teacher creates a new class, THE System SHALL generate a unique class code for student enrollment
2. WHEN a class is created, THE System SHALL initialize a mascot with default stats (Thirst: 100, Hunger: 100, Happiness: 100, Cleanliness: 100, Level: 1, XP: 0, Coins: 0)
3. WHEN a class is created, THE System SHALL initialize default sectors for the schoolyard
4. WHEN a student provides a valid class code during registration, THE System SHALL associate the student with that class
5. WHEN a teacher views class information, THE System SHALL display the class name, school, class code, mascot stats, and enrolled students

### Requirement 3: Mascot Display and Stats

**User Story:** As a student, I want to view Groeny and monitor its health stats, so that I understand what maintenance tasks are needed.

#### Acceptance Criteria

1. WHEN a student views the home page, THE System SHALL display Groeny with current health stats
2. WHEN mascot stats change, THE System SHALL update the visual display to reflect the new values
3. WHEN a student taps Groeny, THE System SHALL increase the Happiness stat by 5 points (maximum 100)
4. WHEN mascot stats are displayed, THE System SHALL show Thirst, Hunger, Happiness, and Cleanliness as numerical values between 0 and 100
5. WHEN the mascot has equipped items, THE System SHALL display those cosmetic customizations on Groeny

### Requirement 4: Schoolyard Map and Sectors

**User Story:** As a student, I want to view an interactive map of the schoolyard with different sectors, so that I can see where maintenance tasks are available.

#### Acceptance Criteria

1. WHEN a student navigates to the map page, THE System SHALL display all sectors for the student's class
2. WHEN a student selects a sector, THE System SHALL display available missions for that sector
3. WHEN sectors are displayed, THE System SHALL show the sector name and type (trees, flowers, pond, chickens, garden)
4. WHERE missions are available in a sector, THE System SHALL provide a visual indicator on the map
5. WHEN a sector has no available missions, THE System SHALL display an appropriate message

### Requirement 5: Mission System

**User Story:** As a student, I want to view and accept missions, so that I can complete real-world maintenance tasks and earn rewards.

#### Acceptance Criteria

1. WHEN a student views missions for a sector, THE System SHALL display mission title, description, and rewards
2. WHEN a student selects a mission, THE System SHALL display detailed information including XP reward, coin reward, and stat boosts
3. WHEN a mission requires photo proof, THE System SHALL indicate this requirement to the student
4. WHEN a mission requires QR code scanning, THE System SHALL indicate this requirement to the student
5. WHERE a mission is accepted, THE System SHALL allow the student to submit proof of completion

### Requirement 6: Mission Submission and Proof of Work

**User Story:** As a student, I want to submit proof that I completed a mission, so that I can receive rewards and improve Groeny's health.

#### Acceptance Criteria

1. WHEN a student submits a mission with photo proof, THE System SHALL accept image files up to 5MB in size
2. WHEN a student submits a mission without required photo proof, THE System SHALL reject the submission and display an error message
3. WHEN a student submits a mission, THE System SHALL set the submission status to pending approval
4. WHEN a submission is created, THE System SHALL record the mission ID, user ID, photo URL, and submission timestamp
5. WHERE QR code scanning is required, THE System SHALL record whether the QR code was successfully scanned

### Requirement 7: Mission Validation by Teachers

**User Story:** As a teacher, I want to review and validate student mission submissions, so that I can ensure tasks were completed properly before awarding rewards.

#### Acceptance Criteria

1. WHEN a teacher views pending submissions, THE System SHALL display all submissions with status pending approval for the teacher's class
2. WHEN a teacher approves a submission, THE System SHALL update the submission status to completed
3. WHEN a teacher rejects a submission, THE System SHALL update the submission status to rejected
4. WHEN a submission is approved, THE System SHALL award XP and coins to the class mascot
5. WHEN a submission is approved, THE System SHALL apply stat boosts (Thirst, Hunger, Happiness, Cleanliness) to the mascot

### Requirement 8: Reward System and Mascot Progression

**User Story:** As a student, I want to earn XP and coins by completing missions, so that I can level up Groeny and purchase cosmetic items.

#### Acceptance Criteria

1. WHEN a mission is approved, THE System SHALL add the mission's XP reward to the mascot's total XP
2. WHEN a mission is approved, THE System SHALL add the mission's coin reward to the mascot's total coins
3. WHEN mascot XP increases, THE System SHALL calculate and update the mascot's level based on accumulated XP
4. WHEN stat boosts are applied, THE System SHALL ensure stat values do not exceed 100
5. WHEN rewards are awarded, THE System SHALL create an activity feed entry for the class

### Requirement 9: Shop and Cosmetic Items

**User Story:** As a student, I want to browse and purchase cosmetic items for Groeny, so that I can customize our mascot's appearance.

#### Acceptance Criteria

1. WHEN a student views the shop, THE System SHALL display all available items with name, type, price, and image
2. WHEN a student purchases an item, THE System SHALL deduct the item price from the mascot's coin balance
3. WHEN a student attempts to purchase an item with insufficient coins, THE System SHALL reject the purchase and display an error message
4. WHEN a student attempts to purchase an already-owned item, THE System SHALL reject the purchase and display an error message
5. WHEN a purchase is completed, THE System SHALL record the purchase with user ID, item ID, class ID, and timestamp

### Requirement 10: Wardrobe and Item Equipping

**User Story:** As a student, I want to equip and unequip cosmetic items on Groeny, so that I can change the mascot's appearance using items I own.

#### Acceptance Criteria

1. WHEN a student equips a hat item, THE System SHALL update the mascot's equipped hat field
2. WHEN a student equips an accessory item, THE System SHALL update the mascot's equipped accessory field
3. WHEN a student equips a color item, THE System SHALL update the mascot's equipped color field
4. WHEN a student attempts to equip an unowned item, THE System SHALL reject the action and display an error message
5. WHEN a student unequips an item, THE System SHALL set the corresponding equipment slot to null

### Requirement 11: Activity Feed

**User Story:** As a student, I want to view recent class activities, so that I can see what my classmates have accomplished.

#### Acceptance Criteria

1. WHEN a mission is completed, THE System SHALL create an activity entry with type mission_completed
2. WHEN an item is purchased, THE System SHALL create an activity entry with type purchase
3. WHEN a student views the activity feed, THE System SHALL display the most recent activities for the student's class
4. WHEN an activity is displayed, THE System SHALL show the activity content, user name, and timestamp
5. WHERE an activity has an associated image, THE System SHALL display the image with the activity

### Requirement 12: Teacher Dashboard

**User Story:** As a teacher, I want to access a dashboard with class overview and management tools, so that I can monitor progress and manage missions.

#### Acceptance Criteria

1. WHEN a teacher accesses the dashboard, THE System SHALL display class information including name, school, and class code
2. WHEN a teacher views the dashboard, THE System SHALL display the class mascot's current stats and level
3. WHEN a teacher views the dashboard, THE System SHALL display a list of enrolled students
4. WHEN a teacher views pending submissions, THE System SHALL display submission details including student name, mission title, and photo proof
5. WHERE a teacher manages multiple classes, THE System SHALL allow the teacher to switch between classes

### Requirement 13: Mission Creation by Teachers

**User Story:** As a teacher, I want to create custom missions for my class, so that I can tailor maintenance tasks to our specific schoolyard needs.

#### Acceptance Criteria

1. WHEN a teacher creates a mission, THE System SHALL require sector ID, title, and description
2. WHEN a teacher creates a mission, THE System SHALL allow specification of XP reward, coin reward, and stat boosts
3. WHEN a teacher creates a mission, THE System SHALL associate the mission with the specified sector
4. WHEN a teacher attempts to create a mission for a sector not in their class, THE System SHALL reject the action
5. WHEN a mission is created, THE System SHALL store the mission with all specified parameters

### Requirement 14: CO2 Impact Calculation

**User Story:** As a teacher or student, I want to view the environmental impact of our maintenance work, so that I can understand our contribution to sustainability.

#### Acceptance Criteria

1. WHEN maintenance work is completed, THE System SHALL calculate CO2 reduction based on task type and quantity
2. WHEN CO2 calculations are requested, THE System SHALL return data in JSON format
3. WHEN CO2 data is displayed, THE System SHALL show total CO2 reduction for the class
4. WHEN different task types are completed, THE System SHALL apply appropriate CO2 reduction factors
5. WHERE CO2 data is unavailable, THE System SHALL display an appropriate message

### Requirement 15: Session Management and Security

**User Story:** As a user, I want my session to remain secure and persist appropriately, so that my data is protected and I don't need to log in repeatedly.

#### Acceptance Criteria

1. WHEN a user logs in, THE System SHALL create a session with a 7-day expiration
2. WHEN a session is created, THE System SHALL store session data securely in the database
3. WHEN a user logs out, THE System SHALL destroy the session and clear authentication state
4. WHERE a session expires, THE System SHALL require re-authentication
5. WHEN session cookies are set, THE System SHALL use httpOnly and secure flags in production

### Requirement 16: Data Persistence and Integrity

**User Story:** As a system administrator, I want all data to be persisted reliably, so that user progress and class information are never lost.

#### Acceptance Criteria

1. WHEN any entity is created, THE System SHALL store it in the PostgreSQL database with a unique identifier
2. WHEN data is updated, THE System SHALL maintain referential integrity across related tables
3. WHEN a class is deleted, THE System SHALL handle cascading deletions for related entities
4. WHEN timestamps are recorded, THE System SHALL use consistent timezone handling
5. WHERE database operations fail, THE System SHALL return appropriate error messages

### Requirement 17: Photo Upload and Storage

**User Story:** As a student, I want to upload photos as proof of mission completion, so that my teacher can verify my work.

#### Acceptance Criteria

1. WHEN a student uploads a photo, THE System SHALL accept JPEG, PNG, and other common image formats
2. WHEN a photo exceeds 5MB, THE System SHALL reject the upload and display an error message
3. WHEN a photo is uploaded, THE System SHALL encode it as base64 for database storage
4. WHEN a photo is displayed, THE System SHALL decode the base64 data and render the image
5. WHERE photo storage fails, THE System SHALL return an error and prevent submission

### Requirement 18: Responsive Design and Mobile Support

**User Story:** As a student using a tablet or Chromebook, I want the interface to work well on my device, so that I can easily interact with the system.

#### Acceptance Criteria

1. WHEN the application is accessed on mobile devices, THE System SHALL display a mobile-optimized layout
2. WHEN the application is accessed on tablets, THE System SHALL display a tablet-optimized layout
3. WHEN touch interactions occur, THE System SHALL provide appropriate touch targets (minimum 48px)
4. WHEN the viewport size changes, THE System SHALL adapt the layout responsively
5. WHERE animations are displayed, THE System SHALL respect user preferences for reduced motion

### Requirement 19: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when errors occur, so that I understand what went wrong and how to proceed.

#### Acceptance Criteria

1. WHEN an API request fails, THE System SHALL display an error message to the user
2. WHEN validation fails, THE System SHALL indicate which fields have errors
3. WHEN a network error occurs, THE System SHALL display a user-friendly error message
4. WHEN an operation succeeds, THE System SHALL display a success confirmation
5. WHERE errors are logged, THE System SHALL include sufficient detail for debugging

### Requirement 20: Stat Decay System

**User Story:** As a teacher, I want mascot stats to decay over time, so that students are motivated to complete maintenance tasks regularly.

#### Acceptance Criteria

1. WHEN time passes without maintenance, THE System SHALL decrease mascot Thirst stat at a defined rate
2. WHEN time passes without maintenance, THE System SHALL decrease mascot Hunger stat at a defined rate
3. WHEN time passes without maintenance, THE System SHALL decrease mascot Happiness stat at a defined rate
4. WHEN time passes without maintenance, THE System SHALL decrease mascot Cleanliness stat at a defined rate
5. WHEN stat decay occurs, THE System SHALL ensure stat values do not fall below 0
