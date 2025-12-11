import type { Logger } from 'winston';
import type { VERIFICATION_STATUS } from '../db/schema.js';
import { type ApiResponse, FiltersInstructor, type PaginatedResponse } from '../models/index.js';
import type { InstructorInput, InstructorRecord } from '../repositories/index.js';
import type { InstructorService } from '../services/index.js';
import { parseApiResponse } from '../utils/parsers.js';

export default class InstructorController {
  private instructorService: InstructorService;
  private logger: Logger;

  constructor(instructorService: InstructorService, logger: Logger) {
    this.instructorService = instructorService;
    this.logger = logger;
  }

  public async getInstructors(
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    verificationStatus?: VERIFICATION_STATUS
  ): Promise<PaginatedResponse<InstructorRecord>> {
    const filters = new FiltersInstructor(verificationStatus);
    return this.instructorService.getInstructors(page, size, sort, order, filters);
  }

  public async getInstructor(instructorId: string): Promise<ApiResponse<InstructorRecord>> {
    const response = await this.instructorService.getInstructor(instructorId);
    return parseApiResponse(response, 'Instructor retrieved successfully');
  }

  public async postInstructor(
    instructorInDTO: InstructorInput
  ): Promise<ApiResponse<InstructorRecord>> {
    const instructorId = await this.instructorService.postInstructor(instructorInDTO);
    // Fetch the created instructor to return full data
    const instructor = await this.instructorService.getInstructor(instructorId);
    return parseApiResponse(instructor, 'Instructor created successfully');
  }

  public async updateInstructor(
    instructorId: string,
    instructorUpdate: Partial<InstructorInput>
  ): Promise<ApiResponse<InstructorRecord>> {
    const response = await this.instructorService.updateInstructor(instructorId, instructorUpdate);
    return parseApiResponse(response, 'Instructor updated successfully');
  }

  public async deleteInstructor(instructorId: string): Promise<ApiResponse<string>> {
    await this.instructorService.deleteInstructor(instructorId);
    return parseApiResponse(
      `Instructor ${instructorId} deleted successfully`,
      'Instructor deleted successfully'
    );
  }
}
