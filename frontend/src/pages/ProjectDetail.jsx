// frontend/src/pages/ProjectDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card, CardBody } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ConfirmModal } from '../components/common/ConfirmModal';
import api from '../services/api';
import toast from 'react-hot-toast';

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: ''
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger'
  });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`)
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch project data');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    const taskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority
    };
    
    // Only add dueDate if it's provided
    if (formData.dueDate) {
      taskData.dueDate = new Date(formData.dueDate).toISOString();
    }
    
    console.log('Creating task:', taskData, 'for project:', id);
    try {
      const response = await api.post(`/projects/${id}/tasks`, taskData);
      console.log('Task created:', response.data);
      toast.success('Task created successfully!');
      setShowModal(false);
      setFormData({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
      fetchProjectData();
    } catch (error) {
      console.error('Task creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleSubmitTask = async (data) => {
    setTaskLoading(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, data);
        toast.success('Task updated successfully!');
      } else {
        await api.post(`/projects/${id}/tasks`, data);
        toast.success('Task created successfully!');
      }
      setShowTaskModal(false);
      setEditingTask(null);
      fetchProjectData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingTask ? 'update' : 'create'} task`);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const [statusLoading, setStatusLoading] = useState(false);

  const handleProjectStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      console.log('Updating project status to:', newStatus);
      const response = await api.patch(`/projects/${id}/status`, { status: newStatus });
      console.log('Status update response:', response.data);
      
      const statusText = newStatus === 'PAUSED' ? 'paused' : 'resumed';
      toast.success(`Project ${statusText} successfully!`);
      
      // Update local state immediately for better UX
      setProject(prev => ({ ...prev, status: newStatus }));
      
      // Refresh data
      fetchProjectData();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update project status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteTask = (taskId, taskTitle) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Task',
      message: `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/tasks/${taskId}`);
          toast.success('Task deleted successfully!', { duration: 2000 });
          fetchProjectData();
        } catch (error) {
          toast.error('Failed to delete task', { duration: 2000 });
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      variant: 'danger'
    });
  };

  const handleDeleteProject = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"? This will permanently delete all tasks and cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/projects/${id}`);
          toast.success('Project deleted successfully!', { duration: 2000 });
          navigate('/projects');
        } catch (error) {
          toast.error('Failed to delete project', { duration: 2000 });
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      variant: 'danger'
    });
  };

  const handleUpdateDeadline = async (deadline) => {
    try {
      const response = await api.put(`/projects/${id}`, { deadline });
      setProject(prev => ({ ...prev, deadline }));
      toast.success('Deadline updated!');
    } catch (error) {
      toast.error('Failed to update deadline');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Project not found</h2>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }

  const columns = [
    { key: 'TODO', label: '📋 To Do', bg: 'bg-slate-50' },
    { key: 'IN_PROGRESS', label: '🔄 In Progress', bg: 'bg-blue-50' },
    { key: 'COMPLETED', label: '✅ Completed', bg: 'bg-emerald-50' }
  ];

  return (
    <div>
      {/* Project Header */}
      <div className="glass rounded-2xl shadow-xl border border-white/20 p-4 lg:p-8 mb-8 animate-slide-in">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative flex-shrink-0">
              <div 
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl shadow-lg flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${project.color || '#6366f1'}, ${project.color || '#6366f1'}dd)` 
                }}
              >
                <span className="text-white text-xl lg:text-2xl font-bold">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs ${
                project.status === 'ACTIVE' 
                  ? 'bg-emerald-500 text-white'
                  : project.status === 'PAUSED'
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}>
                {project.status === 'ACTIVE' ? '✓' : project.status === 'PAUSED' ? '⏸' : '✓'}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">{project.name}</h1>
                <span className={`px-3 py-1 lg:px-4 lg:py-2 rounded-full text-sm font-semibold border self-start ${
                  project.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : project.status === 'PAUSED'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {project.status === 'PAUSED' ? '⏸️ Paused' : project.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-base lg:text-lg mb-4 leading-relaxed">
                {project.description || 'No description provided'}
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-500">Total Tasks</p>
                    <p className="font-semibold text-gray-900">{tasks.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-500">Completed</p>
                    <p className="font-semibold text-gray-900">{tasks.filter(t => t.status === 'COMPLETED').length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    project.deadline 
                      ? (new Date(project.deadline) < new Date() ? 'bg-red-500' : 'bg-orange-500')
                      : 'bg-gray-400'
                  }`}></div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-500">Deadline</p>
                    <p className={`font-semibold text-xs lg:text-sm ${
                      project.deadline 
                        ? (new Date(project.deadline) < new Date() ? 'text-red-600' : 'text-gray-900')
                        : 'text-gray-500'
                    }`}>
                      {project.deadline 
                        ? (() => {
                            const days = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                            return days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`;
                          })()
                        : 'No deadline'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-500">Created</p>
                    <p className="font-semibold text-xs lg:text-sm text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <input
              type="date"
              value={project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''}
              onChange={(e) => handleUpdateDeadline(e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="px-2 py-1 lg:px-3 lg:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              title="Set deadline"
            />
            <Button
              variant={project.status === 'PAUSED' ? 'primary' : 'secondary'}
              onClick={() => handleProjectStatusChange(project.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED')}
              loading={statusLoading}
              className="hover-lift text-sm px-3 py-1 lg:px-4 lg:py-2"
            >
              <span className="hidden sm:inline">{project.status === 'PAUSED' ? '▶️ Resume' : '⏸️ Pause'}</span>
              <span className="sm:hidden">{project.status === 'PAUSED' ? '▶️' : '⏸️'}</span>
            </Button>
            <Button 
              onClick={() => setShowTaskModal(true)}
              className="hover-lift bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-sm px-3 py-1 lg:px-4 lg:py-2"
            >
              <span className="hidden sm:inline">+ Add Task</span>
              <span className="sm:hidden">+</span>
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteProject}
              className="hover-lift bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 lg:px-4 lg:py-2"
            >
              <span className="hidden sm:inline">🗑️ Delete</span>
              <span className="sm:hidden">🗑️</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Professional Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {columns.map((col, colIndex) => {
          const columnTasks = tasks.filter(task => task.status === col.key);
          
          return (
            <div key={col.key} className="animate-slide-in" style={{ animationDelay: `${colIndex * 100}ms` }}>
              {/* Column Header */}
              <div className={`rounded-t-2xl p-6 border-b-4 ${
                col.key === 'TODO' ? 'bg-slate-100 border-slate-400' :
                col.key === 'IN_PROGRESS' ? 'bg-blue-100 border-blue-500' : 'bg-emerald-100 border-emerald-500'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center">
                    <span className="mr-3 text-2xl">
                      {col.key === 'TODO' ? '📝' : col.key === 'IN_PROGRESS' ? '🔄' : '✅'}
                    </span>
                    {col.label.replace(/📋|🔄|✅/g, '').trim()}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    col.key === 'TODO' ? 'bg-slate-200 text-slate-700' :
                    col.key === 'IN_PROGRESS' ? 'bg-blue-200 text-blue-700' : 'bg-emerald-200 text-emerald-700'
                  }`}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>
              
              {/* Column Content */}
              <div className="bg-white rounded-b-2xl shadow-lg h-[400px] lg:h-[500px] p-2 lg:p-4">
                <div className="h-full overflow-y-auto space-y-3 lg:space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {columnTasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      className="group hover-lift bg-white border border-gray-200 rounded-xl p-3 lg:p-4 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-base leading-tight flex-1 pr-2">
                          {task.title}
                        </h4>
                        <div className={`px-3 py-1 text-xs font-medium rounded-lg border ${
                          task.priority === 'HIGH' 
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : task.priority === 'LOW'
                            ? 'bg-gray-50 text-gray-600 border-gray-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {task.priority}
                        </div>
                      </div>
                      
                      {/* Task Description */}
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      
                      {/* Task Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 font-medium">
                          {task.dueDate ? (
                            <div className={`${
                              new Date(task.dueDate) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-500'
                            }`}>
                              Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          ) : (
                            <div>
                              Created: {new Date(task.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {[
                              { value: 'TODO', label: 'To Do', emoji: '📝', color: 'gray' },
                              { value: 'IN_PROGRESS', label: 'Progress', emoji: '🔄', color: 'blue' },
                              { value: 'COMPLETED', label: 'Done', emoji: '✅', color: 'green' }
                            ].map((status) => (
                              <button
                                key={status.value}
                                onClick={() => handleStatusChange(task.id, status.value)}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                                  task.status === status.value
                                    ? status.color === 'gray' ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-300'
                                      : status.color === 'blue' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                                      : 'bg-green-100 text-green-700 ring-2 ring-green-300'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                                title={`Mark as ${status.label}`}
                              >
                                <span>{status.emoji}</span>
                                <span className="hidden sm:inline">{status.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                              title="Update task"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id, task.title)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                              title="Delete task"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty State */}
                  {columnTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-4xl mb-3 opacity-30">
                        {col.key === 'TODO' ? '📝' : col.key === 'IN_PROGRESS' ? '🔄' : '✅'}
                      </div>
                      <p className="text-gray-500 font-medium">No tasks yet</p>
                      <p className="text-gray-400 text-sm mt-1">Tasks will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Glass Task Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg mx-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  Create Task
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    🎯 Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    placeholder="What needs to be done?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    📝 Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm resize-none"
                    placeholder="Add some details..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    🔥 Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'LOW', emoji: '🟢', label: 'Low', color: 'emerald' },
                      { key: 'MEDIUM', emoji: '🟡', label: 'Medium', color: 'amber' },
                      { key: 'HIGH', emoji: '🔴', label: 'High', color: 'red' }
                    ].map((priority) => (
                      <button
                        key={priority.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: priority.key })}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          formData.priority === priority.key
                            ? 'bg-white/30 border-white/60 text-white shadow-lg'
                            : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">{priority.emoji}</div>
                          <div className="text-sm font-semibold">{priority.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    📅 Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-105 border border-white/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    ✨ Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Simple Task Edit Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={handleCloseTaskModal}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                title: formData.get('title'),
                description: formData.get('description') || undefined,
                priority: formData.get('priority'),
                dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate')).toISOString() : undefined
              };
              handleSubmitTask(data);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title *</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editingTask?.title || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What needs to be done?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingTask?.description || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add more details..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    defaultValue={editingTask?.priority || 'MEDIUM'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                  <input
                    name="dueDate"
                    type="date"
                    defaultValue={editingTask?.dueDate ? editingTask.dueDate.split('T')[0] : ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseTaskModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-primary flex-1"
                  loading={taskLoading}
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};