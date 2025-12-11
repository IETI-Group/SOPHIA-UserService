import type { VERIFICATION_STATUS } from '../db/schema.js';
import type FiltersInstructor from '../models/filters/FiltersInstructor.js';
import type { PaginatedResponse } from '../models/index.js';

// Types based on DB schema
export type InstructorRecord = {
  id_instructor: string;
  first_name: string;
  last_name: string;
  total_students: number;
  total_courses: number;
  average_rating: string; // decimal in DB
  total_reviews: number;
  verification_status: VERIFICATION_STATUS;
  verified_at: Date | null;
};

export type InstructorInput = {
  instructorId: string;
  verificationStatus?: VERIFICATION_STATUS;
  verifiedAt?: Date;
};

export interface InstructorsRepository {
  getInstructors(
    page: number,
    size: number,
    filters: FiltersInstructor,
    sort?: string,
    order?: string
  ): Promise<PaginatedResponse<InstructorRecord>>;
  getInstructor(instructorId: string): Promise<InstructorRecord>;
  postInstructor(instructorInput: InstructorInput): Promise<string>;
  updateInstructor(
    instructorId: string,
    instructorUpdate: Partial<InstructorInput>
  ): Promise<InstructorRecord>;
  deleteInstructor(instructorId: string): Promise<void>;
}
