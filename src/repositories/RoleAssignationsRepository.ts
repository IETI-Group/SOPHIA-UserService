/** TODO
import type { ROLE } from "../db/schema.js"

export interface RoleAssignationsRepository {
    getAssignedRoles(page: number, size: number, roleFilter: FiltersRoleAssignation, sort?: string, order?: string): PaginatedAssignations
    createAssignation(userId: string, role: ROLE): string
    updateAssignation(userId: string, role: ROLE, assignation: Partial<RoleAssignationInDTO>): RoleAssignationOutDTO
    updateAssignation(assignationId: string, assignation: Partial<RoleAssignationInDTO>): RoleAssignationOutDTO
    deleteAssignation(userId: string, role: ROLE): void
deleteAssignation(assignationId: string): void
}
*/
