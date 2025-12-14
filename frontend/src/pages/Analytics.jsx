// frontend/src/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import { Card, CardBody } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CompletionTrendChart } from '../features/analytics/components/CompletionTrendChart';
import { ProductivityChart } from '../features/analytics/components/ProductivityChart';
import { analyticsService } from '../features/analytics/services/analyticsService';
import api from '../services/api';

export const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [productivityData, setProductivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Refresh data when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAnalytics();
      }
    };
    
    const handleAnalyticsRefresh = () => {
      fetchAnalytics();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('analyticsRefresh', handleAnalyticsRefresh);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('analyticsRefresh', handleAnalyticsRefresh);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, trendRes, productivityRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getCompletionTrend(30),
        analyticsService.getProductivityByDay()
      ]);
      
      setAnalytics(overviewRes);
      setTrendData(trendRes);
      setProductivityData(productivityRes);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set default empty state
      setAnalytics({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        todoTasks: 0,
        completionRate: 0,
        currentStreak: 0,
        bestStreak: 0
      });
      setTrendData([]);
      setProductivityData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Goals',
      value: analytics?.totalGoals || analytics?.totalProjects || 0,
      icon: '🎯',
      color: 'bg-blue-100 text-blue-700',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Tasks',
      value: analytics?.totalTasks || 0,
      icon: '📋',
      color: 'bg-purple-100 text-purple-700',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Completed Tasks',
      value: analytics?.completedTasks || 0,
      icon: '✅',
      color: 'bg-green-100 text-green-700',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Completion Rate',
      value: `${analytics?.completionRate || 0}%`,
      icon: '📊',
      color: 'bg-yellow-100 text-yellow-700',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Current Streak',
      value: `${analytics?.currentStreak || 0} days`,
      icon: '🔥',
      color: 'bg-orange-100 text-orange-700',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Active Tasks',
      value: analytics?.activeTasks || 0,
      icon: '🔄',
      color: 'bg-indigo-100 text-indigo-700',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">
          Track your productivity and progress over time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-lg transition-shadow">
            <CardBody className="flex items-center">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                <span className="text-white text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CompletionTrendChart data={trendData} />
        <ProductivityChart data={productivityData} />
      </div>

      {/* Task Distribution & Streak Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">To Do</span>
                </div>
                <span className="text-sm font-medium">
                  {analytics?.todoTasks || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <span className="text-sm font-medium">
                  {analytics?.activeTasks || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="text-sm font-medium">
                  {analytics?.completedTasks || 0}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            {analytics?.totalTasks > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{analytics.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${analytics.completionRate}%` }}
                  />
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Streak Information</h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {analytics?.currentStreak || 0}
                </div>
                <div className="text-sm text-gray-600">Current Streak (days)</div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics?.currentStreak > 0 ? 'Keep it up!' : 'Complete a task to start your streak'}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Best Streak</span>
                  <span className="text-lg font-bold text-gray-900">
                    {analytics?.bestStreak || 0} days
                  </span>
                </div>
              </div>
              
              {analytics?.currentStreak === analytics?.bestStreak && analytics?.currentStreak > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-2">🏆</span>
                    <span className="text-sm text-yellow-800 font-medium">
                      Personal best! You're on fire!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Productivity Tips */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-medium text-gray-900">Stay Consistent</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Try to complete at least one task every day to maintain your streak
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-medium text-gray-900">Focus on Priorities</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Tackle high-priority tasks first to maximize your impact
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-medium text-gray-900">Track Progress</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Regular check-ins help you stay on track with your goals
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h4 className="font-medium text-gray-900">Use AI Planner</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Let AI help you break down complex goals into manageable tasks
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};