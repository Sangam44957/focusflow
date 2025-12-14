// backend/src/services/task.service.js
import { taskRepository } from '../repositories/task.repository.js';
import { projectRepository } from '../repositories/project.repository.js';
import { ApiError } from '../utils/ApiError.js';

export const taskService = {
  create: async (projectId, userId, data, userPlan = 'FREE') => {
    // Verify project ownership
    const project = await projectRepository.findById(projectId, userId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    return taskRepository.create({
      ...data,
      projectId
    });
  },
  
  getByProject: async (projectId, userId) => {
    // Verify project ownership
    const project = await projectRepository.findById(projectId, userId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    return taskRepository.findByProject(projectId);
  },
  
  update: async (taskId, userId, data) => {
    return taskRepository.update(taskId, data, userId);
  },
  
  updateStatus: async (taskId, userId, status) => {
    return taskRepository.updateStatus(taskId, status, userId);
  },
  
  delete: async (taskId, userId) => {
    return taskRepository.delete(taskId, userId);
  },
  
  reorder: async (projectId, userId, taskIds) => {
    const project = await projectRepository.findById(projectId, userId);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }
    
    return taskRepository.reorder(projectId, taskIds);
  }
};