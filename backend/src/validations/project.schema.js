// backend/src/validations/project.schema.js
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  color: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  deadline: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const updateProjectStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
});