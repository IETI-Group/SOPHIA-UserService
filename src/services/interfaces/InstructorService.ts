import type FiltersInstructor from '../../models/filters/FiltersInstructor.js';
import type { PaginatedResponse } from '../../models/index.js';
import type { InstructorInput, InstructorRecord } from '../../repositories/index.js';

export interface InstructorService {
  getInstructors(
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    filters: FiltersInstructor
  ): Promise<PaginatedResponse<InstructorRecord>>;
  getInstructor(instructorId: string): Promise<InstructorRecord>;
  postInstructor(instructorInDTO: InstructorInput): Promise<string>;
  updateInstructor(
    instructorId: string,
    instructorUpdate: Partial<InstructorInput>
  ): Promise<InstructorRecord>;
  deleteInstructor(instructorId: string): Promise<void>;
}
