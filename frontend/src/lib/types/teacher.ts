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

export type DecorationType =
	| 'BUILDING'
	| 'PAVEMENT'
	| 'PARKING'
	| 'FENCE'
	| 'ENTRANCE'
	| 'BENCH'
	| 'TRASH_BIN'
	| 'BIKE_RACK';

export interface MapDecoration {
	id: string;
	classId: string;
	type: DecorationType;
	gridX: number;
	gridY: number;
	gridWidth: number;
	gridHeight: number;
	label?: string;
}

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
	supplyRequests: TeacherSupplyRequest[];
	decorations: MapDecoration[];
	error?: string;
}

export type SupplyRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Supply {
	id: string;
	name: string;
	description: string;
	imageUrl: string;
	createdAt: string;
	updatedAt: string;
}

export interface TeacherSupplyRequest {
	id: string;
	supplyId: string;
	userId: string;
	classId: string;
	status: SupplyRequestStatus;
	createdAt: string;
	updatedAt: string;

	supply: Supply;
	user: {
		id: string;
		username: string;
		firstName: string;
		lastName: string;
	};
}
