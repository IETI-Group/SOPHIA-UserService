import type {
  InstructorInput,
  InstructorRecord,
  InstructorsRepository,
} from '../../repositories/index.js';
import type { InstructorService } from '../interfaces/InstructorService.js';

export default class InstructorServiceImpl implements InstructorService {
  private instructorsRepository: InstructorsRepository;

  constructor(instructorsRepository: InstructorsRepository) {
    this.instructorsRepository = instructorsRepository;
  }

  public async getInstructor(instructorId: string): Promise<InstructorRecord> {
    return this.instructorsRepository.getInstructor(instructorId);
  }

  public async postInstructor(instructorInDTO: InstructorInput): Promise<string> {
    return this.instructorsRepository.postInstructor(instructorInDTO);
  }

  public async updateInstructor(
    instructorId: string,
    instructorUpdate: Partial<InstructorInput>
  ): Promise<InstructorRecord> {
    return this.instructorsRepository.updateInstructor(instructorId, instructorUpdate);
  }

  public async deleteInstructor(instructorId: string): Promise<void> {
    return this.instructorsRepository.deleteInstructor(instructorId);
  }
}
