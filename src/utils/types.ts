export interface HealthInfo {
  success: boolean;
  message: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
}

export enum ROLE {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  GUEST = 'guest',
}

export enum LEARNING_STYLES {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading_writing',
  GAMIFICATION = 'gamification',
  STORYTELLING = 'storytelling',
  CASE_STUDY = 'case_study',
  PROBLEM_SOLVING = 'problem_solving',
  COLLABORATIVE = 'collaborative',
  SELF_PACED = 'self_paced',
}

export enum PACE_PREFERENCE {
  SLOW = 'slow',
  NORMAL = 'normal',
  FAST = 'fast',
}

export enum REVIEW_DISCRIMINANT {
  INSTRUCTOR = 'instructor',
  COURSE = 'course',
}

export enum ROLE_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum VERIFICATION_STATUS {
  VERIFIED = 'verified',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export interface ValidUserSortFields {
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  created_at: string;
}
