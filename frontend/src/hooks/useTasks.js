import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useTasks = (projectId) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/tasks`);
      return data.data;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000  // 2 minutes for tasks (more dynamic)
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, ...taskData }) => 
      api.post(`/projects/${projectId}/tasks`, taskData),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries(['tasks', projectId]);
      queryClient.invalidateQueries(['projects', projectId]);
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, taskId, ...data }) => 
      api.put(`/projects/${projectId}/tasks/${taskId}`, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries(['tasks', projectId]);
      queryClient.invalidateQueries(['projects', projectId]);
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, taskId }) => 
      api.delete(`/projects/${projectId}/tasks/${taskId}`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries(['tasks', projectId]);
      queryClient.invalidateQueries(['projects', projectId]);
    }
  });
};