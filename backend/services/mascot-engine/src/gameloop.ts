/**
 * Groeny Gameloop Engine
 * 
 * Handles:
 * - Stat decay calculation (lazy evaluation)
 * - Level progression
 * - Health state determination
 */

// ============================================
// 🧪 DEBUG MODE - Set to true for fast testing
// ============================================
export const DEBUG_MODE = false;  // Set to false for production
export const DEBUG_DECAY_MULTIPLIER = 60;  // 1 minute = 1 hour of decay in debug mode

// XP thresholds for each level (index = level, value = total XP needed)
export const XP_THRESHOLDS = [
  0,      // Level 1 (starting)
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  3500,   // Level 7
  5500,   // Level 8
  8000,   // Level 9
  11000,  // Level 10
  15000,  // Level 10 max (no level 11)
];

export const MAX_LEVEL = 10;

// School hours configuration (24h format)
export const SCHOOL_HOURS = {
  startHour: 8,   // 8 AM
  endHour: 16,    // 4 PM
  schoolDays: [1, 2, 3, 4, 5], // Monday = 1, Friday = 5
};

export interface MascotStats {
  thirst: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
}

export interface DecayRates {
  thirstDecayRate: number;
  hungerDecayRate: number;
  happinessDecayRate: number;
  cleanlinessDecayRate: number;
}

export interface MascotData extends MascotStats, DecayRates {
  id: string;
  classId: string;
  level: number;
  xp: number;
  coins: number;
  equippedHat: string | null;
  equippedAccessory: string | null;
  lastDecayAt: Date;
}

export type GroenyState = 'normal' | 'sad' | 'sick';

/**
 * Calculate the average health percentage from all 4 stats
 */
export function calculateHealth(stats: MascotStats): number {
  const total = stats.thirst + stats.hunger + stats.happiness + stats.cleanliness;
  return Math.round(total / 4);
}

/**
 * Determine Groeny's visual state based on health
 */
export function getGroenyState(health: number): GroenyState {
  if (health >= 51) return 'normal';
  if (health >= 25) return 'sad';
  return 'sick';
}

/**
 * Calculate the current level based on total XP
 */
export function calculateLevel(xp: number): number {
  for (let level = MAX_LEVEL; level >= 1; level--) {
    if (xp >= XP_THRESHOLDS[level - 1]) {
      return level;
    }
  }
  return 1;
}

/**
 * Get XP progress within current level
 */
export function getLevelProgress(xp: number, level: number): { current: number; required: number; percentage: number } {
  const currentThreshold = XP_THRESHOLDS[level - 1] || 0;
  const nextThreshold = XP_THRESHOLDS[level] || XP_THRESHOLDS[MAX_LEVEL];
  
  const current = xp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const percentage = Math.min(100, Math.round((current / required) * 100));
  
  return { current, required, percentage };
}

/**
 * Check if a given timestamp is within school hours
 * In DEBUG_MODE, always returns true
 */
export function isSchoolHours(date: Date): boolean {
  if (DEBUG_MODE) return true;  // Always decay in debug mode
  
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = date.getHours();
  
  const isSchoolDay = SCHOOL_HOURS.schoolDays.includes(day);
  const isDuringHours = hour >= SCHOOL_HOURS.startHour && hour < SCHOOL_HOURS.endHour;
  
  return isSchoolDay && isDuringHours;
}

/**
 * Calculate school hours between two timestamps
 * Returns the number of hours during which decay should apply
 * In DEBUG_MODE, returns minutes elapsed * multiplier (for fast testing)
 */
export function calculateSchoolHoursBetween(startDate: Date, endDate: Date): number {
  if (DEBUG_MODE) {
    // In debug mode: minutes elapsed become "hours" for decay calculation
    const minutesElapsed = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    return minutesElapsed * (DEBUG_DECAY_MULTIPLIER / 60);  // Convert to equivalent hours
  }
  
  // If less than 1 minute has passed, no decay
  const msElapsed = endDate.getTime() - startDate.getTime();
  if (msElapsed < 60 * 1000) {
    return 0;
  }
  
  let schoolMinutes = 0;
  const current = new Date(startDate);
  
  // Cap at 7 days to prevent excessive calculation
  const maxEnd = new Date(startDate);
  maxEnd.setDate(maxEnd.getDate() + 7);
  const effectiveEnd = endDate < maxEnd ? endDate : maxEnd;
  
  // Iterate minute by minute for more accurate calculation
  // But optimize by checking hour boundaries
  while (current < effectiveEnd) {
    if (isSchoolHours(current)) {
      // Calculate how many minutes until the end of this hour or until effectiveEnd
      const endOfHour = new Date(current);
      endOfHour.setMinutes(59, 59, 999);
      
      const minutesInThisHour = Math.min(
        Math.floor((effectiveEnd.getTime() - current.getTime()) / (1000 * 60)),
        Math.floor((endOfHour.getTime() - current.getTime()) / (1000 * 60)) + 1
      );
      
      schoolMinutes += Math.max(0, minutesInThisHour);
      
      // Jump to next hour
      current.setHours(current.getHours() + 1, 0, 0, 0);
    } else {
      // Not school hours, jump to next hour
      current.setHours(current.getHours() + 1, 0, 0, 0);
    }
  }
  
  // Convert minutes to hours
  return schoolMinutes / 60;
}


/**
 * Apply decay to mascot stats based on time elapsed
 * Returns the new stats after decay (clamped to 0-100)
 */
export function applyDecay(
  stats: MascotStats,
  decayRates: DecayRates,
  schoolHoursElapsed: number
): MascotStats {
  return {
    thirst: Math.max(0, Math.round(stats.thirst - (schoolHoursElapsed * decayRates.thirstDecayRate))),
    hunger: Math.max(0, Math.round(stats.hunger - (schoolHoursElapsed * decayRates.hungerDecayRate))),
    happiness: Math.max(0, Math.round(stats.happiness - (schoolHoursElapsed * decayRates.happinessDecayRate))),
    cleanliness: Math.max(0, Math.round(stats.cleanliness - (schoolHoursElapsed * decayRates.cleanlinessDecayRate))),
  };
}

/**
 * Process mascot state - applies decay and calculates level
 * This is the main function called when fetching mascot data
 */
export function processMascotState(mascot: MascotData, now: Date = new Date()): {
  stats: MascotStats;
  level: number;
  levelProgress: { current: number; required: number; percentage: number };
  health: number;
  state: GroenyState;
  schoolHoursElapsed: number;
  shouldUpdate: boolean;
} {
  // Calculate school hours since last decay
  const schoolHoursElapsed = calculateSchoolHoursBetween(mascot.lastDecayAt, now);
  
  // Apply decay if any school hours have passed
  const currentStats: MascotStats = {
    thirst: mascot.thirst,
    hunger: mascot.hunger,
    happiness: mascot.happiness,
    cleanliness: mascot.cleanliness,
  };
  
  const decayRates: DecayRates = {
    thirstDecayRate: mascot.thirstDecayRate,
    hungerDecayRate: mascot.hungerDecayRate,
    happinessDecayRate: mascot.happinessDecayRate,
    cleanlinessDecayRate: mascot.cleanlinessDecayRate,
  };
  
  const newStats = schoolHoursElapsed > 0 
    ? applyDecay(currentStats, decayRates, schoolHoursElapsed)
    : currentStats;
  
  // Calculate level from XP
  const level = calculateLevel(mascot.xp);
  const levelProgress = getLevelProgress(mascot.xp, level);
  
  // Calculate health and state
  const health = calculateHealth(newStats);
  const state = getGroenyState(health);
  
  return {
    stats: newStats,
    level,
    levelProgress,
    health,
    state,
    schoolHoursElapsed,
    shouldUpdate: schoolHoursElapsed > 0,
  };
}

/**
 * Check if mascot leveled up after gaining XP
 */
export function checkLevelUp(oldXp: number, newXp: number): { leveledUp: boolean; oldLevel: number; newLevel: number } {
  const oldLevel = calculateLevel(oldXp);
  const newLevel = calculateLevel(newXp);
  
  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
  };
}
