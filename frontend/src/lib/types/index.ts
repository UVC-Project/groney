// Core entity types based on the design document

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  profileImageUrl?: string;
  role: 'student' | 'teacher';
  classId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  school: string;
  classCode: string;
  createdById?: string;
  createdAt: string;
}

export interface Mascot {
  id: string;
  classId: string;
  name: string;
  level: number;
  xp: number;
  thirst: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
  coins: number;
  equippedHat?: string;
  equippedAccessory?: string;
  equippedColor?: string;
  lastFed?: string;
  lastWatered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sector {
  id: string;
  classId: string;
  name: string;
  type: 'trees' | 'flowers' | 'pond' | 'chickens' | 'garden';
  description?: string;
  createdAt: string;
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
  requiresQrCode: boolean;
  qrCodeData?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  missionId: string;
  userId: string;
  status: 'available' | 'in_progress' | 'pending_approval' | 'completed' | 'rejected';
  photoUrl?: string;
  qrCodeScanned: boolean;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description?: string;
  type: 'hat' | 'accessory' | 'color' | 'supply';
  price: number;
  imageUrl?: string;
  customizationData?: Record<string, unknown>;
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  itemId: string;
  classId: string;
  purchasedAt: string;
}

export interface Activity {
  id: string;
  classId: string;
  userId: string;
  type: 'mission_completed' | 'purchase' | 'level_up';
  content: string;
  imageUrl?: string;
  createdAt: string;
}

// API response types
export interface ApiError {
  message: string;
  error?: string;
  stack?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
