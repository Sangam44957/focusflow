// frontend/src/pages/AIPlanner.jsx
import { useState } from 'react';
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

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">AI Planner</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Let AI help you break down your goals into actionable tasks
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Input Section */}
        <Card>
          <CardBody>
            <h2 className="text-base sm:text-lg font-semibold mb-4">What do you want to achieve?</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your goal
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="E.g., Build a portfolio website with React, create a mobile app for task management, learn Python for data analysis..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target completion date (optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {deadline ? 'AI will distribute task deadlines to meet your target date' : 'AI will distribute task deadlines automatically based on priority'}
                </p>
              </div>
              <Button 
                type="submit" 
                loading={loading}
                className="w-full text-sm sm:text-base"
              >
                🤖 Generate Plan
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Output Section */}
        <Card>
          <CardBody>
            <h2 className="text-base sm:text-lg font-semibold mb-4">Generated Plan</h2>
            {plan ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{plan.projectName}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2">{plan.projectDescription}</p>
                  {plan.deadline && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-4">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">Target completion: {new Date(plan.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {plan.imported && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-green-700 text-xs sm:text-sm font-medium">
                        ✅ This plan has been imported as a project
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Tasks:</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
                    {plan.tasks?.map((task, index) => {
                      const priorityColors = {
                        HIGH: 'bg-red-100 text-red-700 border-red-200',
                        MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                        LOW: 'bg-green-100 text-green-700 border-green-200'
                      };
                      
                      return (
                        <div key={index} className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                          <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-2">
                              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{task.title}</p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[task.priority] || priorityColors.MEDIUM} flex-shrink-0 self-start sm:self-auto`}>
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center text-xs text-gray-500">
                                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {!plan.imported ? (
                  <Button 
                    onClick={handleImport}
                    variant="primary"
                    className="w-full mt-4 sm:mt-6 text-sm sm:text-base"
                    loading={importing}
                    disabled={importing}
                  >
                    📥 Import as Goal
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      setPlan(null);
                      setGoal('');
                      setDeadline('');
                    }}
                    variant="secondary"
                    className="w-full mt-4 sm:mt-6 text-sm sm:text-base"
                  >
                    🆕 Generate New Plan
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <span className="text-4xl sm:text-5xl lg:text-6xl text-gray-300 block mb-3 sm:mb-4">🤖</span>
                <p className="text-sm sm:text-base text-gray-500">Your AI-generated plan will appear here</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-2">
                  Describe your goal and let AI create a structured plan for you
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Features Section */}
      <div className="mt-8 sm:mt-12">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">How AI Planner Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardBody className="text-center">
              <span className="text-3xl sm:text-4xl block mb-2 sm:mb-3">🎯</span>
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Define Your Goal</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Describe what you want to achieve in natural language
              </p>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <span className="text-3xl sm:text-4xl block mb-2 sm:mb-3">🧠</span>
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">AI Analysis</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Our AI breaks down your goal into actionable tasks
              </p>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <span className="text-3xl sm:text-4xl block mb-2 sm:mb-3">📋</span>
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Get Your Plan</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Import the generated plan as a project and start working
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};