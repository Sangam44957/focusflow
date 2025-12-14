// backend/src/routes/index.js
import { Router } from 'express';
import prisma from '../config/database.js';
import authRoutes from './auth.routes.js';

import projectRoutes from './project.routes.js';
import taskRoutes, { taskRouter } from './task.routes.js';
import aiRoutes from './ai.routes.js';
import analyticsRoutes from './analytics.routes.js';
// import paymentRoutes from './payment.routes.js';           // Disabled
// import subscriptionRoutes from './subscription.routes.js'; // Disabled

const router = Router();

// Health check endpoints
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.get('/health/db', async (req, res) => {
  try {
    // Simple database check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: error.message });
  }
});

router.use('/auth', authRoutes);

router.use('/projects', projectRoutes);
router.use('/projects', taskRoutes);
router.use('/tasks', taskRouter);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);
// router.use('/payment', paymentRoutes);           // Disabled
// router.use('/subscription', subscriptionRoutes); // Disabled

export default router;