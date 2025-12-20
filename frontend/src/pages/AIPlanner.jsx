// frontend/src/pages/AIPlanner.jsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/common/Button';
import { Card, CardBody } from '../components/common/Card';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AIPlanner = () => {
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [importing, setImporting] = useState(false);
  const queryClient = useQueryClient();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error('Please enter a goal');
      return;
    }

    console.log('Generating AI plan for goal:', goal, 'deadline:', deadline);
    setLoading(true);
    try {
      const requestData = { goal };
      if (deadline) {
        requestData.deadline = deadline;
      }
      const response = await api.post('/ai/generate', requestData);
      console.log('AI plan response:', response.data);
      setPlan(response.data.data);
      toast.success('Plan generated successfully!');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!plan || !plan.id || importing) {
      return;
    }

    setImporting(true);
    console.log('Importing plan:', plan.id);
    
    try {
      const response = await api.post('/ai/import', { planId: plan.id });
      console.log('Import response:', response.data);
      
      toast.success(`Goal "${response.data.data.project.name}" created with ${response.data.data.tasksCreated} tasks!`);
      
      // Mark plan as imported instead of clearing it
      setPlan(prev => ({ ...prev, imported: true }));
      
      // Invalidate projects cache to refresh dashboard
      queryClient.invalidateQueries(['projects']);
      
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to import goal';
      toast.error(errorMessage);
      
      // If plan was already imported, mark it as imported
      if (errorMessage.includes('already imported')) {
        setPlan(prev => ({ ...prev, imported: true }));
      }
    } finally {
      setImporting(false);
    }
  };

  const handleNewPlan = () => {
    setPlan(null);
    setGoal('');
    setDeadline('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          🤖 AI Goal Planner
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your ideas into structured, actionable plans with AI assistance
        </p>
      </div>

      {!plan ? (
        /* Input Form */
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardBody className="p-6 lg:p-8">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    What's your goal? ✨
                  </label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    placeholder="E.g., Build a portfolio website with React, create a mobile app for task management, learn Python for data analysis, start a fitness routine..."
                    rows={4}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Target completion date (optional) 📅
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {deadline ? '🎯 AI will create a timeline to meet your deadline' : '⚡ AI will suggest optimal task scheduling'}
                  </p>
                </div>
                
                <button
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 text-lg font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>}
                  {loading ? '🧠 AI is thinking...' : '🚀 Generate My Plan'}
                </button>
              </form>
            </CardBody>
          </Card>
        </div>
      ) : (
        /* Generated Plan Display */
        <div className="space-y-6">
          {/* Plan Header with Import Button */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 lg:p-8 border border-blue-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                  🎯 {plan.projectName}
                </h2>
                <p className="text-gray-700 mb-3">{plan.projectDescription}</p>
                {plan.deadline && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Target: {new Date(plan.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {!plan.imported ? (
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="px-6 py-3 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
                  >
                    {importing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    {importing ? '📥 Importing...' : '✅ Import as Goal'}
                  </button>
                ) : (
                  <div className="bg-green-100 border border-green-300 rounded-xl px-4 py-3">
                    <p className="text-green-800 font-semibold text-sm flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Goal Created Successfully!
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleNewPlan}
                  variant="secondary"
                  size="lg"
                >
                  🆕 New Plan
                </Button>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <Card>
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Tasks ({plan.tasks?.length || 0})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {plan.tasks?.map((task, index) => {
                  const priorityColors = {
                    HIGH: 'bg-red-50 border-red-200 text-red-700',
                    MEDIUM: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                    LOW: 'bg-green-50 border-green-200 text-green-700'
                  };
                  
                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{task.title}</h4>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${priorityColors[task.priority] || priorityColors.MEDIUM} self-start sm:self-auto`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          )}
                          
                          {task.dueDate && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Features Section */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">How AI Planning Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">1. Define Your Goal</h4>
            <p className="text-sm text-gray-600">Describe what you want to achieve in natural language</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">2. AI Analysis</h4>
            <p className="text-sm text-gray-600">AI breaks down your goal into structured, actionable tasks</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">3. Import & Execute</h4>
            <p className="text-sm text-gray-600">Import your plan as a goal and start making progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};