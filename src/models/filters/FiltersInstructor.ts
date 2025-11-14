import type { VERIFICATION_STATUS } from '../../db/schema.js';

export default class FiltersInstructor {
  private verificationStatus: VERIFICATION_STATUS | null;
  private totalRatings: number | null;
  private totalStudents: number | null;
  private totalCourses: number | null;
  private averageRating: number | null;
  private detailedDTO: boolean;

  constructor(
    verificationStatus?: VERIFICATION_STATUS | null,
    totalRatings?: number | null,
    totalStudents?: number | null,
    totalCourses?: number | null,
    averageRating?: number | null,
    detailedDTO?: boolean
  ) {
    this.verificationStatus = verificationStatus || null;
    this.totalRatings = totalRatings ?? null;
    this.totalStudents = totalStudents ?? null;
    this.totalCourses = totalCourses ?? null;
    this.averageRating = averageRating ?? null;
    this.detailedDTO = detailedDTO ?? true;
  }

  // Getters
  public getVerificationStatus(): VERIFICATION_STATUS | null {
    return this.verificationStatus;
  }

  public getTotalRatings(): number | null {
    return this.totalRatings;
  }

  public getTotalStudents(): number | null {
    return this.totalStudents;
  }

  public getTotalCourses(): number | null {
    return this.totalCourses;
  }

  public getAverageRating(): number | null {
    return this.averageRating;
  }

  public isDetailedDTO(): boolean {
    return this.detailedDTO;
  }

  // Setters
  public setVerificationStatus(status: VERIFICATION_STATUS | null): void {
    this.verificationStatus = status;
  }

  public setTotalRatings(count: number | null): void {
    this.totalRatings = count;
  }

  public setTotalStudents(count: number | null): void {
    this.totalStudents = count;
  }

  public setTotalCourses(count: number | null): void {
    this.totalCourses = count;
  }

  public setAverageRating(rating: number | null): void {
    this.averageRating = rating;
  }

  public setDetailedDTO(detailed: boolean): void {
    this.detailedDTO = detailed;
  }
}
