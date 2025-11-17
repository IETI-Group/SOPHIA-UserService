import { type IRouter, type Request, type Response, Router } from 'express';
import { validationResult } from 'express-validator';
import container from '../config/diContainer.js';
import type AdminController from '../controllers/AdminController.js';
import type { ROLE, ROLE_STATUS } from '../db/schema.js';
import type { InstructorInput, RoleAssignationInput, RoleInput } from '../repositories/index.js';
import {
  parseInstructorInBody,
  parseInstructorUpdateInBody,
  parsePaginationQuery,
  parseRoleAssignationInBody,
  parseRoleAssignationsQuery,
  parseRoleAssignationUpdateInBody,
  parseRoleInBody,
  parseRoleUpdateInBody,
} from '../utils/parsers.js';
import {
  enumQuery,
  instructorInDTO,
  paginationParams,
  roleAssignationInDTO,
  roleInDTO,
  sortingParams,
  stringParam,
} from '../utils/validators.js';

const router: IRouter = Router();

// Obtener instancia del controlador desde el contenedor DI
const adminController = container.resolve<AdminController>('adminController');

// ============================================
// ROLE MANAGEMENT ROUTES
// ============================================

/**
 * @route   GET /api/v1/admin/roles
 * @desc    Get all roles with pagination
 * @access  Admin
 */
router.get(
  '/roles',
  [...paginationParams, ...sortingParams],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      throw new Error(
        `Validation error: ${errors
          .array()
          .map((err) => err.msg)
          .join(', ')}`
      );

    const { page, size } = parsePaginationQuery(req);
    const roles = await adminController.getRoles(page, size);
    res.json(roles);
  }
);

/**
 * @route   GET /api/v1/admin/roles/:name
 * @desc    Get role by name
 * @access  Admin
 */
router.get(
  '/roles/:name',
  [stringParam('name', 'Invalid role name')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid role name');
    }

    const role = await adminController.getRole(req.params.name);
    res.json(role);
  }
);

/**
 * @route   POST /api/v1/admin/roles
 * @desc    Create a new role
 * @access  Admin
 */
router.post('/roles', [...roleInDTO()], async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    throw new Error('Validation error: Invalid role data');
  }

  const roleData: RoleInput = parseRoleInBody(req);
  const newRole = await adminController.postRole(roleData);
  res.status(201).json(newRole);
});

/**
 * @route   PUT /api/v1/admin/roles/:name
 * @desc    Update an existing role
 * @access  Admin
 */
router.put(
  '/roles/:name',
  [stringParam('name', 'Invalid role name'), ...roleInDTO(true)],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid role data or name');
    }

    const roleName = req.params.name;
    const roleData = parseRoleUpdateInBody(req);
    const updatedRole = await adminController.updateRole(roleName, roleData);
    res.json(updatedRole);
  }
);

/**
 * @route   DELETE /api/v1/admin/roles/:name
 * @desc    Delete a role by name
 * @access  Admin
 */
router.delete(
  '/roles/:name',
  [stringParam('name', 'Invalid role name')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid role name');
    }

    const roleName = req.params.name;
    const response = await adminController.deleteRole(roleName);
    res.status(200).json(response);
  }
);

// ============================================
// ROLE ASSIGNATION ROUTES
// ============================================

/**
 * @route   GET /api/v1/admin/assignations
 * @desc    Get all role assignations with pagination and filters
 * @access  Admin
 */
router.get(
  '/assignations',
  [
    ...paginationParams,
    ...sortingParams,
    enumQuery('role_status', 'Invalid role status', ['active', 'inactive', 'suspended'], true),
    enumQuery('role', 'Invalid role', ['admin', 'instructor', 'student', 'guest'], true),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      throw new Error(
        `Validation error: ${errors
          .array()
          .map((err) => err.msg)
          .join(', ')}`
      );

    const { page, size, sort, order } = parsePaginationQuery(req);
    const {
      assignmentStartDate,
      assignmentEndDate,
      expirationStartDate,
      expirationEndDate,
      roleStatus,
      role,
    } = parseRoleAssignationsQuery(req);

    const assignations = await adminController.getAssignedRoles(
      page,
      size,
      sort,
      order as 'asc' | 'desc',
      assignmentStartDate,
      assignmentEndDate,
      expirationStartDate,
      expirationEndDate,
      roleStatus as ROLE_STATUS | undefined,
      role as ROLE | undefined
    );
    res.json(assignations);
  }
);

/**
 * @route   POST /api/v1/admin/assignations
 * @desc    Assign a role to a user
 * @access  Admin
 */
router.post('/assignations', [...roleAssignationInDTO()], async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    throw new Error('Validation error: Invalid assignation data');
  }

  const { userId, role } = parseRoleAssignationInBody(req);
  const newAssignation = await adminController.assignRole(userId, role as ROLE);
  res.status(201).json(newAssignation);
});

/**
 * @route   PUT /api/v1/admin/assignations/user/:userId/role/:role
 * @desc    Update a role assignation by user ID and role
 * @access  Admin
 */
router.put(
  '/assignations/user/:userId/role/:role',
  [
    stringParam('userId', 'Invalid user ID'),
    stringParam('role', 'Invalid role'),
    ...roleAssignationInDTO(true),
  ],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid assignation data');
    }

    const { userId, role } = req.params;
    const assignationData: Partial<RoleAssignationInput> = parseRoleAssignationUpdateInBody(req);
    const updatedAssignation = await adminController.updateAssignationByUserAndRole(
      userId,
      role as ROLE,
      assignationData
    );
    res.json(updatedAssignation);
  }
);

/**
 * @route   PUT /api/v1/admin/assignations/:assignationId
 * @desc    Update a role assignation by assignation ID
 * @access  Admin
 */
router.put(
  '/assignations/:assignationId',
  [stringParam('assignationId', 'Invalid assignation ID'), ...roleAssignationInDTO(true)],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid assignation data');
    }

    const assignationId = req.params.assignationId;
    const assignationData: Partial<RoleAssignationInput> = parseRoleAssignationUpdateInBody(req);
    const updatedAssignation = await adminController.updateAssignationById(
      assignationId,
      assignationData
    );
    res.json(updatedAssignation);
  }
);

/**
 * @route   DELETE /api/v1/admin/assignations/user/:userId/role/:role
 * @desc    Revoke a role from a user by user ID and role
 * @access  Admin
 */
router.delete(
  '/assignations/user/:userId/role/:role',
  [stringParam('userId', 'Invalid user ID'), stringParam('role', 'Invalid role')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID or role');
    }

    const { userId, role } = req.params;
    const response = await adminController.revokeRoleByUserAndRole(userId, role as ROLE);
    res.status(200).json(response);
  }
);

/**
 * @route   DELETE /api/v1/admin/assignations/:assignationId
 * @desc    Revoke a role assignation by assignation ID
 * @access  Admin
 */
router.delete(
  '/assignations/:assignationId',
  [stringParam('assignationId', 'Invalid assignation ID')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid assignation ID');
    }

    const assignationId = req.params.assignationId;
    const response = await adminController.revokeRoleById(assignationId);
    res.status(200).json(response);
  }
);

// ============================================
// INSTRUCTOR MANAGEMENT ROUTES
// ============================================

/**
 * @route   GET /api/v1/admin/instructors
 * @desc    Get all instructors with pagination and filters
 * @access  Admin
 */
router.get(
  '/instructors',
  [
    ...paginationParams,
    ...sortingParams,
    enumQuery(
      'verification_status',
      'Invalid verification status',
      ['verified', 'pending', 'rejected'],
      true
    ),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      throw new Error(
        `Validation error: ${errors
          .array()
          .map((err) => err.msg)
          .join(', ')}`
      );

    const { page, size, sort, order } = parsePaginationQuery(req);
    const instructors = await adminController.getInstructors(page, size, sort, order);
    res.json(instructors);
  }
);

/**
 * @route   POST /api/v1/admin/instructors
 * @desc    Create a new instructor
 * @access  Admin
 */
router.post('/instructors', [...instructorInDTO()], async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    throw new Error('Validation error: Invalid instructor data');
  }

  const instructorData: InstructorInput = parseInstructorInBody(req);
  const newInstructor = await adminController.postInstructor(instructorData);
  res.status(201).json(newInstructor);
});

/**
 * @route   PUT /api/v1/admin/instructors/:instructorId
 * @desc    Update an existing instructor
 * @access  Admin
 */
router.put(
  '/instructors/:instructorId',
  [stringParam('instructorId', 'Invalid instructor ID'), ...instructorInDTO(true)],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid instructor data or ID');
    }

    const instructorId = req.params.instructorId;
    const instructorData = parseInstructorUpdateInBody(req);
    const updatedInstructor = await adminController.updateInstructor(instructorId, instructorData);
    res.json(updatedInstructor);
  }
);

/**
 * @route   DELETE /api/v1/admin/instructors/:instructorId
 * @desc    Delete an instructor by ID
 * @access  Admin
 */
router.delete(
  '/instructors/:instructorId',
  [stringParam('instructorId', 'Invalid instructor ID')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid instructor ID');
    }

    const instructorId = req.params.instructorId;
    const response = await adminController.deleteInstructor(instructorId);
    res.status(200).json(response);
  }
);

export default router;
