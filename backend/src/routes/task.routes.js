// backend/src/routes/task.routes.js
import { Router } from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
  reorderTasks
} from '../controllers/task.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  reorderTasksSchema
} from '../validations/task.schema.js';

const router = Router();

router.use(auth);

// Get all tasks for a project & Create task in project
router.route('/:projectId/tasks')
  .get(getTasks)
  .post(createTask);

// Reorder tasks within a project
router.post('/:projectId/tasks/reorder', reorderTasks);

// Individual task routes (these will be mounted separately)
export const taskRouter = Router();

taskRouter.use(auth);

taskRouter.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

taskRouter.patch('/:id/status', validate(updateTaskStatusSchema), updateTaskStatus);

export default router;