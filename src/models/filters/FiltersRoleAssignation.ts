import type { ROLE, ROLE_STATUS } from '../../db/schema.js';

export default class FiltersRoleAssignation {
  private assignmentStartDate: Date | null;
  private assignmentEndDate: Date | null;
  private expirationStartDate: Date | null;
  private expirationEndDate: Date | null;
  private roleStatus: ROLE_STATUS | null;
  private role: ROLE | null;

  constructor(
    assignmentStartDate?: Date | null,
    assignmentEndDate?: Date | null,
    expirationStartDate?: Date | null,
    expirationEndDate?: Date | null,
    roleStatus?: ROLE_STATUS | null,
    role?: ROLE | null
  ) {
    this.assignmentStartDate = assignmentStartDate || null;
    this.assignmentEndDate = assignmentEndDate || null;
    this.expirationStartDate = expirationStartDate || null;
    this.expirationEndDate = expirationEndDate || null;
    this.roleStatus = roleStatus || null;
    this.role = role || null;
  }

  // Getters
  public getAssignmentStartDate(): Date | null {
    return this.assignmentStartDate;
  }

  public getAssignmentEndDate(): Date | null {
    return this.assignmentEndDate;
  }

  public getExpirationStartDate(): Date | null {
    return this.expirationStartDate;
  }

  public getExpirationEndDate(): Date | null {
    return this.expirationEndDate;
  }

  public getRoleStatus(): ROLE_STATUS | null {
    return this.roleStatus;
  }

  public getRole(): ROLE | null {
    return this.role;
  }

  // Setters
  public setAssignmentStartDate(date: Date | null): void {
    this.assignmentStartDate = date;
  }

  public setAssignmentEndDate(date: Date | null): void {
    this.assignmentEndDate = date;
  }

  public setExpirationStartDate(date: Date | null): void {
    this.expirationStartDate = date;
  }

  public setExpirationEndDate(date: Date | null): void {
    this.expirationEndDate = date;
  }

  public setRoleStatus(status: ROLE_STATUS | null): void {
    this.roleStatus = status;
  }

  public setRole(role: ROLE | null): void {
    this.role = role;
  }
}
