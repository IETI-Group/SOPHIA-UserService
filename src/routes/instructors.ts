import { type IRouter, type Request, type Response, Router } from 'express';
import { validationResult } from 'express-validator';
import container from '../config/diContainer.js';
import type InstructorController from '../controllers/InstructorController.js';
import type { InstructorInput } from '../repositories/index.js';
import { parseInstructorInBody, parseInstructorUpdateInBody } from '../utils/parsers.js';
import { instructorInDTO, stringParam } from '../utils/validators.js';

const router: IRouter = Router();

// Obtener instancia del controlador desde el contenedor DI
const instructorController = container.resolve<InstructorController>('instructorController');

/**
 * @route   GET /api/v1/instructors/:instructorId
 * @desc    Get instructor by ID
 * @access  Public
 */
router.get(
  '/:instructorId',
  [stringParam('instructorId', 'Invalid instructor ID')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid instructor ID');
    }

    const instructorId = req.params.instructorId;
    const instructor = await instructorController.getInstructor(instructorId);
    res.json(instructor);
  }
);

/**
 * @route   POST /api/v1/instructors
 * @desc    Create a new instructor
 * @access  Public
 */
router.post('/', [...instructorInDTO()], async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    throw new Error('Validation error: Invalid instructor data');
  }

  const instructorData: InstructorInput = parseInstructorInBody(req);
  const newInstructor = await instructorController.postInstructor(instructorData);
  res.status(201).json(newInstructor);
});

/**
 * @route   PUT /api/v1/instructors/:instructorId
 * @desc    Update an existing instructor
 * @access  Public
 */
router.put(
  '/:instructorId',
  [stringParam('instructorId', 'Invalid instructor ID'), ...instructorInDTO(true)],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid instructor data or ID');
    }

    const instructorId = req.params.instructorId;
    const instructorData = parseInstructorUpdateInBody(req);
    const updatedInstructor = await instructorController.updateInstructor(
      instructorId,
      instructorData
    );
    res.json(updatedInstructor);
  }
);

/**
 * @route   DELETE /api/v1/instructors/:instructorId
 * @desc    Delete an instructor by ID
 * @access  Public
 */
router.delete(
  '/:instructorId',
  [stringParam('instructorId', 'Invalid instructor ID')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid instructor ID');
    }

    const instructorId = req.params.instructorId;
    const response = await instructorController.deleteInstructor(instructorId);
    res.status(200).json(response);
  }
);

export default router;
