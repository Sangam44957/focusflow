// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };
    
    const handleAnalyticsRefresh = () => {
      fetchDashboardData();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('analyticsRefresh', handleAnalyticsRefresh);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('analyticsRefresh', handleAnalyticsRefresh);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, projectsRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/projects')
      ]);
      
      setAnalytics(analyticsRes.data.data);
      setRecentProjects(projectsRes.data.data?.slice(0, 4) || []);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'Create New Goal',
      description: 'Start tracking a new goal',
      href: '/projects',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      title: 'AI Planner',
      description: 'Let AI create your plan',
      href: '/ai-planner',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'View Calendar',
      description: 'Check your deadlines',
      href: '/calendar',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-600'
    }
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-white animate-slide-down">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-blue-100 text-base lg:text-lg">
              Ready to achieve your goals today?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 lg:w-24 lg:h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-slide-up">
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Active Goals</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{analytics?.activeProjects || 0}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{analytics?.completedProjects || 0}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{analytics?.totalTasks || 0}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                {analytics?.totalTasks > 0 
                  ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
                  : 0}%
              </p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Quick Actions */}
        <div className="xl:col-span-1">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="block p-4 bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover-lift"
              >
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${action.gradient} rounded-lg lg:rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                    {action.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">{action.title}</h3>
                    <p className="text-xs lg:text-sm text-gray-600 truncate">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Goals */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">Recent Goals</h2>
            <Link
              to="/projects"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap"
            >
              View All →
            </Link>
          </div>
          
          {recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-4 lg:p-6 bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover-lift"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      project.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'PAUSED'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{project._count?.tasks || 0} tasks</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-600 mb-4">Create your first goal to get started</p>
              <Link
                to="/projects"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Create Goal
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};