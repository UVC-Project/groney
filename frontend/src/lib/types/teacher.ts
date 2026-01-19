// Teacher Dashboard Types

export type UserRole = 'student' | 'teacher';

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	username: string;
	role: UserRole;
}

export interface Mascot {
	level: number;
	xp: number;
	coins: number;
	thirst: number;
	hunger: number;
	happiness: number;
	cleanliness: number;
}

export interface Class {
	id: string;
	name: string;
	school: string;
	classCode: string;
	mascot: Mascot;
	students: User[];
	// Map configuration
	mapWidth: number;
	mapHeight: number;
}

export interface ClassListItem {
	id: string;
	name: string;
	school: string;
}

export type SectorType =
	| 'TREES'
	| 'FLOWERS'
	| 'POND'
	| 'ANIMALS'
	| 'GARDEN'
	| 'PLAYGROUND'
	| 'COMPOST'
	| 'OTHER'
	| 'CHICKENS';

export interface Sector {
	id: string;
	name: string;
	type: SectorType;
	description?: string;
	classId: string;
	// Map grid position and size
	gridX: number;
	gridY: number;
	gridWidth: number;
	gridHeight: number;
	color?: string;
	missions?: Mission[];
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
}

export type SubmissionStatus = 'pending_approval' | 'completed' | 'rejected';

export interface Submission {
	id: string;
	missionId: string;
	mission: {
		id: string;
		title: string;
		description: string;
	};
	student: {
		id: string;
		firstName: string;
		lastName: string;
		username: string;
	};
	photoUrl: string;
	submittedAt: string;
	status: SubmissionStatus;
}

export interface TeacherDashboardData {
	currentClass: Class | null;
	allClasses: ClassListItem[];
	sectors: Sector[];
	missions: Mission[];
	submissions: Submission[];
	error?: string;
}
