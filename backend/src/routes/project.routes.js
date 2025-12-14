// backend/src/routes/project.routes.js
import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
  updateProjectStatus
} from '../controllers/project.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProjectSchema, updateProjectSchema, updateProjectStatusSchema } from '../validations/project.schema.js';

const router = Router();

// All routes require authentication
router.use(auth);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.get('/stats', getProjectStats);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.patch('/:id/status', validate(updateProjectStatusSchema), updateProjectStatus);

export default router;