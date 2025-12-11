import { and, asc, desc, eq, gte, type SQL, sql } from 'drizzle-orm';
import type { DBDrizzleProvider } from '../../db/index.js';
import { instructors, users, VERIFICATION_STATUS } from '../../db/schema.js';
import type { FiltersInstructor, PaginatedResponse } from '../../models/index.js';
import type {
  InstructorInput,
  InstructorRecord,
  InstructorsRepository,
} from '../InstructorsRepository.js';

export class InstructorsRepositoryPostgreSQL implements InstructorsRepository {
  private readonly client: DBDrizzleProvider;

  constructor(drizzleClient: DBDrizzleProvider) {
    this.client = drizzleClient;
  }

  private validateFilters(filters: FiltersInstructor): SQL<unknown>[] {
    const whereConditions: SQL<unknown>[] = [];

    const verificationStatus = filters.getVerificationStatus();
    const totalRatings = filters.getTotalRatings();
    const totalStudents = filters.getTotalStudents();
    const totalCourses = filters.getTotalCourses();
    const averageRating = filters.getAverageRating();

    if (verificationStatus) {
      whereConditions.push(eq(instructors.verification_status, verificationStatus));
    }
    if (totalRatings !== null && totalRatings !== undefined) {
      whereConditions.push(gte(instructors.total_reviews, totalRatings));
    }
    if (totalStudents !== null && totalStudents !== undefined) {
      whereConditions.push(gte(instructors.total_students, totalStudents));
    }
    if (totalCourses !== null && totalCourses !== undefined) {
      whereConditions.push(gte(instructors.total_courses, totalCourses));
    }
    if (averageRating !== null && averageRating !== undefined) {
      whereConditions.push(gte(instructors.average_rating, averageRating.toString()));
    }

    return whereConditions;
  }

  public async getInstructors(
    page: number,
    size: number,
    filters: FiltersInstructor,
    sort?: string,
    order?: string
  ): Promise<PaginatedResponse<InstructorRecord>> {
    const whereConditions: SQL<unknown>[] = this.validateFilters(filters);
    const isDescending = order?.toLowerCase() === 'desc';
    const sortField = sort || 'average_rating';

    // Validate sort field
    const validSortFields = [
      'average_rating',
      'total_students',
      'total_courses',
      'total_reviews',
      'verification_status',
    ];
    if (!validSortFields.includes(sortField)) {
      throw new Error(`Invalid sort field: ${sortField}`);
    }

    const orderByClause =
      sortField === 'total_students'
        ? isDescending
          ? desc(instructors.total_students)
          : asc(instructors.total_students)
        : sortField === 'total_courses'
          ? isDescending
            ? desc(instructors.total_courses)
            : asc(instructors.total_courses)
          : sortField === 'total_reviews'
            ? isDescending
              ? desc(instructors.total_reviews)
              : asc(instructors.total_reviews)
            : sortField === 'verification_status'
              ? isDescending
                ? desc(instructors.verification_status)
                : asc(instructors.verification_status)
              : isDescending
                ? desc(instructors.average_rating)
                : asc(instructors.average_rating);

    const baseQuery = this.client
      .select({
        id_instructor: instructors.id_instructor,
        first_name: users.first_name,
        last_name: users.last_name,
        total_students: instructors.total_students,
        total_courses: instructors.total_courses,
        average_rating: instructors.average_rating,
        total_reviews: instructors.total_reviews,
        verification_status: instructors.verification_status,
        verified_at: instructors.verified_at,
      })
      .from(instructors)
      .innerJoin(users, eq(instructors.id_instructor, users.id_user));

    const queryWithFilters =
      whereConditions.length > 0 ? baseQuery.where(and(...whereConditions)) : baseQuery;

    const instructorsResult = await queryWithFilters
      .orderBy(orderByClause)
      .limit(size)
      .offset((page - 1) * size);

    const countBaseQuery = this.client
      .select({ count: sql<number>`count(*)::int` })
      .from(instructors);

    const countQuery =
      whereConditions.length > 0 ? countBaseQuery.where(and(...whereConditions)) : countBaseQuery;

    const totalResult = await countQuery;
    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / size);

    return {
      success: true,
      message: 'Instructors retrieved successfully',
      data: instructorsResult,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit: size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  public async getInstructor(instructorId: string): Promise<InstructorRecord> {
    const [instructor] = await this.client
      .select({
        id_instructor: instructors.id_instructor,
        first_name: users.first_name,
        last_name: users.last_name,
        total_students: instructors.total_students,
        total_courses: instructors.total_courses,
        average_rating: instructors.average_rating,
        total_reviews: instructors.total_reviews,
        verification_status: instructors.verification_status,
        verified_at: instructors.verified_at,
      })
      .from(instructors)
      .innerJoin(users, eq(instructors.id_instructor, users.id_user))
      .where(eq(instructors.id_instructor, instructorId))
      .limit(1);

    if (!instructor) {
      throw new Error(`Instructor with id ${instructorId} not found`);
    }

    return instructor;
  }

  public async postInstructor(instructorInput: InstructorInput): Promise<string> {
    const { instructorId, verificationStatus, verifiedAt } = instructorInput;

    try {
      const [instructor] = await this.client
        .insert(instructors)
        .values({
          id_instructor: instructorId,
          verification_status: verificationStatus || VERIFICATION_STATUS.PENDING,
          verified_at: verifiedAt || null,
        })
        .returning();

      return instructor.id_instructor;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error(`Instructor with id ${instructorId} already exists`);
        }
        if (error.message.includes('foreign key')) {
          throw new Error(`User with id ${instructorId} not found`);
        }
      }
      throw error;
    }
  }

  public async updateInstructor(
    instructorId: string,
    instructorUpdate: Partial<InstructorInput>
  ): Promise<InstructorRecord> {
    if (!instructorUpdate || Object.keys(instructorUpdate).length === 0) {
      throw new Error('No fields to update provided');
    }

    const allowedFields = ['verificationStatus', 'verifiedAt'];
    const providedFields = Object.keys(instructorUpdate);
    const invalidFields = providedFields.filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields provided: ${invalidFields.join(', ')}`);
    }

    const updateValues: {
      verification_status?: VERIFICATION_STATUS;
      verified_at?: Date | null;
    } = {};

    if (instructorUpdate.verificationStatus !== undefined) {
      updateValues.verification_status = instructorUpdate.verificationStatus;
    }
    if (instructorUpdate.verifiedAt !== undefined) {
      updateValues.verified_at = instructorUpdate.verifiedAt;
    }

    const [updatedInstructor] = await this.client
      .update(instructors)
      .set(updateValues)
      .where(eq(instructors.id_instructor, instructorId))
      .returning();

    if (!updatedInstructor) {
      throw new Error(`Instructor with id ${instructorId} not found`);
    }

    // Fetch the complete instructor data with user info
    return this.getInstructor(instructorId);
  }

  public async deleteInstructor(instructorId: string): Promise<void> {
    const [deletedInstructor] = await this.client
      .delete(instructors)
      .where(eq(instructors.id_instructor, instructorId))
      .returning();

    if (!deletedInstructor) {
      throw new Error(`Instructor with id ${instructorId} not found`);
    }
  }
}
