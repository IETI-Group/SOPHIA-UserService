/** TODO
export interface InstructorsRepository {
  getInstructors(page: number, size: number, filters: FiltersInstructor, sort?: string, order?: string): PaginatedInstructors;
  getInstructor(instructorId: string): InstructorOutDTO;
  postInstructor(instructorInDTO: PublicInstructorInDTO): InstructorOutDTO;
  updateInstructor(instructorId: string, instructorUpdate: Partial<PublicInstructorInDTO>): InstructorOutDTO;
  deleteInstructor(instructorId: string): void;
}
*/
