# Proteger Rutas con Autenticación

Proteger rutas existentes con la autenticación de AWS Cognito.

## Proteger todas las rutas de cursos
```typescript
// src/routes/courses.ts
import { Router, type IRouter } from 'express';
import { authenticate } from '../middlewares/auth.js';
import container from '../config/diContainer.js';
import type { CoursesController } from '../controllers/index.js';

const router: IRouter = Router();
const coursesController = container.resolve<CoursesController>('coursesController');

router.use(authenticate);
router.get('/courses', coursesController.getAllCourses);
router.get('/courses/:id', coursesController.getCourse);
router.post('/courses', coursesController.createCourse);
router.put('/courses/:id', coursesController.updateCourse);
router.delete('/courses/:id', coursesController.deleteCourse);

export default router;
```

## Rutas mixtas

```typescript
// src/routes/courses.ts
import { Router, type IRouter } from 'express';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.js';
import container from '../config/diContainer.js';
import type { CoursesController } from '../controllers/index.js';

const router: IRouter = Router();
const coursesController = container.resolve<CoursesController>('coursesController');

router.get('/courses', optionalAuthenticate, coursesController.getAllCourses);
router.get('/courses/:id', optionalAuthenticate, coursesController.getCourse);

router.post('/courses', authenticate, coursesController.createCourse);
router.put('/courses/:id', authenticate, coursesController.updateCourse);
router.delete('/courses/:id', authenticate, coursesController.deleteCourse);

// Rutas privadas con roles específicos
router.delete('/courses/:id', authenticate, requireGroup('admin'), coursesController.deleteCourse);

export default router;
```

## Usar información del usuario en el controlador

```typescript
// src/controllers/courses.ts
import type { Request, Response } from 'express';

export class CoursesController {
  createCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      // req.user está disponible gracias al middleware authenticate
      const userId = req.user?.userId;
      const username = req.user?.username;
      
      console.log(`Course created by user: ${username} (${userId})`);
      
      const courseData = {
        ...req.body,
        createdBy: userId, // Agregar el ID del usuario al curso
      };
      
      res.status(201).json({
        success: true,
        data: courseData,
        message: 'Course created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating course',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  };
  
  getAllCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      // Con optionalAuthenticate, req.user puede ser undefined
      if (req.user) {
        console.log(`Fetching courses for authenticated user: ${req.user.username}`);
      } else {
        console.log('Fetching public courses for anonymous user');
      }
      
      res.json({
        success: true,
        data: { /* cursos */ }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching courses'
      });
    }
  };
}
```

## Proteger rutas con roles específicos

```typescript
// src/routes/courses.ts
import { Router, type IRouter } from 'express';
import { authenticate, requireGroup, requireAnyGroup } from '../middlewares/auth.js';
import container from '../config/diContainer.js';
import type { CoursesController } from '../controllers/index.js';

const router: IRouter = Router();
const coursesController = container.resolve<CoursesController>('coursesController');

// Rutas públicas
router.get('/courses', coursesController.getAllCourses);

// Solo usuarios autenticados
router.post('/courses', authenticate, coursesController.createCourse);

// Solo administradores
router.delete('/courses/:id', 
  authenticate, 
  requireGroup('admin'), 
  coursesController.deleteCourse
);

// Administradores o moderadores
router.put('/courses/:id', 
  authenticate, 
  requireAnyGroup(['admin', 'moderator']), 
  coursesController.updateCourse
);

export default router;
```

## Middleware personalizado basado en el usuario

```typescript
// src/middlewares/courseAuth.ts
import type { Request, Response, NextFunction } from 'express';
import container from '../config/diContainer.js';
import type { CourseService } from '../app/services/index.js';

/**
 * Verifica que el usuario autenticado sea el propietario del curso
 * Debe usarse después del middleware authenticate
 */
export const requireCourseOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const courseId = req.params.id;
    const courseService = container.resolve<CourseService>('courseService');
    
    // Obtener el curso
    const course = await courseService.getCourse(courseId);
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
        error: 'NOT_FOUND',
      });
      return;
    }

    // Verificar si el usuario es el propietario o es admin
    const isOwner = course.createdBy === req.user.userId;
    const isAdmin = req.user.groups?.includes('admin');

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this course',
        error: 'FORBIDDEN',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying course ownership',
      error: 'INTERNAL_SERVER_ERROR',
    });
  }
};
```

Uso del middleware personalizado:

```typescript
// src/routes/courses.ts
import { authenticate } from '../middlewares/auth.js';
import { requireCourseOwner } from '../middlewares/courseAuth.js';

// Solo el propietario del curso o admin puede actualizarlo
router.put('/courses/:id', 
  authenticate, 
  requireCourseOwner, 
  coursesController.updateCourse
);
```

## Verificar permisos en el servicio

```typescript
// src/app/services/course.service.ts
export class CourseServiceImpl implements CourseService {
  async updateCourse(
    courseId: string, 
    data: UpdateCourseDto, 
    userId: string
  ): Promise<Course> {
    // Verificar permisos a nivel de servicio
    const course = await this.coursesRepository.findById(courseId);
    
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    
    if (course.createdBy !== userId) {
      throw new ForbiddenError('You do not have permission to update this course');
    }
    
    return this.coursesRepository.update(courseId, data);
  }
}
```

### 1. **Autenticación Global**
Aplicar `authenticate` antes de todas las rutas con `router.use(authenticate)`.

### 2. **Autenticación por Ruta**
Aplicar `authenticate` solo en las rutas que lo necesiten.

### 3. **Autenticación Opcional**
Usar `optionalAuthenticate` para personalizar la respuesta según si el usuario está autenticado o no.

### 4. **Autorización por Roles**
Usa `requireGroup()` o `requireAnyGroup()` para restringir acceso basado en grupos de Cognito.
