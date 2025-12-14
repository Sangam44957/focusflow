// frontend/src/pages/Projects.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ConfirmModal } from '../components/common/ConfirmModal';
import api from '../services/api';
import toast from 'react-hot-toast';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      console.log('Projects data:', JSON.stringify(response.data.data, null, 2));
      console.log('First project deadline:', response.data.data[0]?.deadline);
      setProjects(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProject = async (data) => {
    setFormLoading(true);
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, data);
        toast.success('Goal updated successfully!');
      } else {
        await api.post('/projects', data);
        toast.success('Goal created successfully!');
      }
      setShowModal(false);
      setEditingProject(null);
      fetchProjects();
      
      // Trigger analytics refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('analyticsRefresh'));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingProject ? 'update' : 'create'} goal`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId, projectName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Goal',
      message: `Are you sure you want to delete "${projectName}"? This will permanently delete all tasks and cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/projects/${projectId}`);
          toast.success('Goal deleted successfully!', { duration: 2000 });
          fetchProjects();
          
          // Trigger analytics refresh
          window.dispatchEvent(new CustomEvent('analyticsRefresh'));
        } catch (error) {
          toast.error('Failed to delete goal', { duration: 2000 });
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      variant: 'danger'
    });
  };

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Goals</h1>
          <p className="text-gray-600 mt-1">Track and achieve your objectives</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Goal
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover-lift group">
              <div className="flex justify-between items-start mb-4">
                <Link to={`/projects/${project.id}`} className="flex-1">
                  <div
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-bold text-base lg:text-lg shadow-lg"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 lg:px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                    project.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'PAUSED'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {project.status}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditProject(project);
                      }}
                      className="p-1.5 lg:p-2 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Update goal"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteProject(project.id, project.name);
                      }}
                      className="p-1.5 lg:p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete goal"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
                
              <Link to={`/projects/${project.id}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
              </Link>
                
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || 'No description provided'}
              </p>
                
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  {project._count?.tasks || 0} tasks
                </div>
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
                
              {project.deadline && (
                <div className="flex items-center text-sm mt-2">
                  <svg className="w-4 h-4 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={
                    new Date(project.deadline) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-600'
                  }>
                    Target: {new Date(project.deadline).toLocaleDateString()}
                    {(() => {
                      const days = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                      return days < 0 ? ` (${Math.abs(days)} days overdue)` : days === 0 ? ' (Due today)' : ` (${days} days left)`;
                    })()} 
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start your journey by creating your first goal. Break it down into manageable tasks and track your progress.
          </p>
          <Button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Create Your First Goal
          </Button>
        </div>
      )}

      {/* Simple Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                {editingProject ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                name: formData.get('name'),
                description: formData.get('description') || undefined,
                priority: formData.get('priority'),
                color: formData.get('color'),
                deadline: formData.get('deadline') ? new Date(formData.get('deadline')).toISOString() : undefined
              };
              handleSubmitProject(data);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Goal Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingProject?.name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What do you want to achieve?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingProject?.description || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe your goal..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    defaultValue={editingProject?.priority || 'MEDIUM'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
                  <input
                    name="deadline"
                    type="date"
                    defaultValue={editingProject?.deadline ? editingProject.deadline.split('T')[0] : ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <input name="color" type="hidden" defaultValue={editingProject?.color || '#6366f1'} />
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-primary flex-1"
                  loading={formLoading}
                >
                  {editingProject ? 'Update Goal' : 'Create Goal'}
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