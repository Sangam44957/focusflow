// backend/src/repositories/task.repository.js
import prisma from '../config/database.js';

export const taskRepository = {
  create: async (data) => {
    // Get max order for the project
    const maxOrder = await prisma.task.aggregate({
      where: { projectId: data.projectId },
      _max: { order: true }
    });
    
    return prisma.task.create({
      data: {
        ...data,
        order: (maxOrder._max.order || 0) + 1
      }
    });
  },
  
  findById: async (id, userId = null) => {
    const where = { id };
    if (userId) {
      where.project = { userId };
    }
    return prisma.task.findFirst({
      where,
      include: { project: true }
    });
  },
  
  findByProject: async (projectId) => {
    return prisma.task.findMany({
      where: { projectId },
      orderBy: { order: 'asc' }
    });
  },
  
  countByProject: async (projectId) => {
    return prisma.task.count({
      where: { projectId }
    });
  },
  
  update: async (id, data, userId = null) => {
    const where = { id };
    if (userId) {
      // Verify ownership through project
      const task = await prisma.task.findFirst({
        where: { id, project: { userId } }
      });
      if (!task) throw new Error('Task not found or access denied');
    }
    return prisma.task.update({
      where: { id },
      data
    });
  },
  
  updateStatus: async (id, status, userId = null) => {
    // Verify ownership if userId provided
    if (userId) {
      const task = await prisma.task.findFirst({
        where: { id, project: { userId } }
      });
      if (!task) throw new Error('Task not found or access denied');
    }
    
    // Get current task to log previous status
    const currentTask = await prisma.task.findUnique({
      where: { id },
      select: { status: true }
    });
    
    const task = await prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    });
    
    // Create task log with previous status
    await prisma.taskLog.create({
      data: {
        taskId: id,
        action: 'status_change',
        previousStatus: currentTask?.status,
        newStatus: status
      }
    });
    
    return task;
  },
  
  delete: async (id, userId = null) => {
    if (userId) {
      // Verify ownership through project
      const task = await prisma.task.findFirst({
        where: { id, project: { userId } }
      });
      if (!task) throw new Error('Task not found or access denied');
    }
    return prisma.task.delete({
      where: { id }
    });
  },
  
  reorder: async (projectId, taskIds) => {
    // Update order for each task
    const updates = taskIds.map((taskId, index) =>
      prisma.task.update({
        where: { id: taskId },
        data: { order: index }
      })
    );
    
    return prisma.$transaction(updates);
  },
  
  getStatsByUser: async (userId) => {
    return prisma.task.groupBy({
      by: ['status'],
      where: {
        project: { userId }
      },
      _count: true
    });
  },
  
  getCompletedByDateRange: async (userId, startDate, endDate) => {
    return prisma.taskLog.findMany({
      where: {
        task: { project: { userId } },
        newStatus: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
};