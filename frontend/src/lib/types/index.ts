export type UserRole = 'student' | 'teacher';

export type SectorType = 'trees' | 'flowers' | 'pond' | 'chickens' | 'garden';

export type MissionCategory = 'thirst' | 'hunger' | 'happiness' | 'cleanliness';

export type MissionStatus = 'available' | 'in_progress' | 'completed' | 'expired';

export type SubmissionStatus = 'pending' | 'completed' | 'rejected';

export type ItemType = 'hat' | 'accessory' | 'color';

export type ActivityType = 'mission_completed' | 'purchase' | 'level_up';

// ----- Core Models -----

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  school: string;
  classCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassUser {
  classId: string;
  userId: string;
}

export interface Mascot {
  id: string;
  classId: string;
  thirst: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
  level: number;
  xp: number;
  coins: number;
  equippedHat?: string;
  equippedAccessory?: string;
  equippedColor?: string;
  lastDecayAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sector {
  id: string;
  classId: string;
  name: string;
  type: SectorType;
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  id: string;
  sectorId: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  thirstBoost: number;
  hungerBoost: number;
  happinessBoost: number;
  cleanlinessBoost: number;
  requiresPhoto: boolean;
  requiresQR: boolean;
  coordinates_x: number;
  coordinates_y: number;
  category: MissionCategory;
  status: MissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  missionId: string;
  userId: string;
  classId: string;
  photoUrl?: string;
  qrScanned: boolean;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  itemId: string;
  classId: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  classId: string;
  userId: string;
  type: ActivityType;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

// ----- API Types -----

export interface ApiError {
  message: string;
  error?: string;
  stack?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
