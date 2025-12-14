// backend/src/repositories/project.repository.js
import prisma from '../config/database.js';

export const projectRepository = {
  create: async (data) => {
    return prisma.project.create({
      data,
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });
  },

  findAllByUser: async (userId, options = {}) => {
    const { includeTaskCount = true, limit = 50, offset = 0 } = options;
    
    return prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  findById: async (id, userId) => {
    return prisma.project.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });
  },

  update: async (id, userId, data) => {
    return prisma.project.update({
      where: { 
        id,
        userId // Ensure user owns the project
      },
      data,
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });
  },

  delete: async (id) => {
    return prisma.project.delete({
      where: { id }
    });
  },

  countByUser: async (userId) => {
    return prisma.project.count({
      where: { userId }
    });
  },

  getStats: async (userId) => {
    const [projects, tasks] = await prisma.$transaction([
      prisma.project.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { project: { userId } },
        _count: true,
      }),
    ]);

    return { projects, tasks };
  },
};