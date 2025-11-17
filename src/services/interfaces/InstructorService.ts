import type { InstructorInput, InstructorRecord } from '../../repositories/index.js';

export interface InstructorService {
  getInstructor(instructorId: string): Promise<InstructorRecord>;
  postInstructor(instructorInDTO: InstructorInput): Promise<string>;
  updateInstructor(
    instructorId: string,
    instructorUpdate: Partial<InstructorInput>
  ): Promise<InstructorRecord>;
  deleteInstructor(instructorId: string): Promise<void>;
}
