import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import PerformanceLayout from '../../components/layout/PerformanceLayout';
import { useAuth } from '../../contexts/AuthContext';

const PerformanceGoals = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
    targetDate: '',
    status: 'NOT_STARTED'
  });

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockGoals = [
      {
        id: 1,
        title: 'Complete React Advanced Course',
        description: 'Finish the advanced React course on frontend architecture and state management',
        category: 'TECHNICAL',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        progress: 65,
        targetDate: '2025-12-31',
        createdAt: '2025-01-15',
        updatedAt: '2025-09-01'
      },
      {
        id: 2,
        title: 'Improve Communication Skills',
        description: 'Attend communication workshop and practice presentation skills',
        category: 'SOFT_SKILLS',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        progress: 100,
        targetDate: '2025-08-30',
        createdAt: '2025-06-01',
        updatedAt: '2025-08-25'
      },
      {
        id: 3,
        title: 'Lead Team Project',
        description: 'Successfully lead the Q4 product launch project',
        category: 'LEADERSHIP',
        priority: 'HIGH',
        status: 'NOT_STARTED',
        progress: 0,
        targetDate: '2025-12-15',
        createdAt: '2025-09-01',
        updatedAt: '2025-09-01'
      }
    ];
    setGoals(mockGoals);
  }, []);

  const handleAddGoal = (e) => {
    e.preventDefault();
    const goal = {
      ...newGoal,
      id: Date.now(),
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      category: 'TECHNICAL',
      priority: 'MEDIUM',
      targetDate: '',
      status: 'NOT_STARTED'
    });
    setShowAddForm(false);
  };

  const handleUpdateGoal = (goalId, updates) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : goal
    ));
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'IN_PROGRESS': return <ClockIcon className="w-5 h-5 text-blue-600" />;
      case 'OVERDUE': return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const statsData = [
    {
      title: 'Total Goals',
      value: goals.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed',
      value: goals.filter(g => g.status === 'COMPLETED').length,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'In Progress',
      value: goals.filter(g => g.status === 'IN_PROGRESS').length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Not Started',
      value: goals.filter(g => g.status === 'NOT_STARTED').length,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <PerformanceLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Performance Goals</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Set and track your professional development goals</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 mx-auto"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Goal</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className={`w-12 h-12 mx-auto rounded-lg ${stat.bgColor} flex items-center justify-center mb-4`}>
                <div className={`${stat.color} font-bold text-xl`}>
                  {stat.value}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Goal</h3>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter goal title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe your goal and how you plan to achieve it"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TECHNICAL">Technical Skills</option>
                  <option value="SOFT_SKILLS">Soft Skills</option>
                  <option value="LEADERSHIP">Leadership</option>
                  <option value="CAREER">Career Development</option>
                  <option value="PERSONAL">Personal Development</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Add Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(goal.status)}
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(goal.priority)}`}>
                    {goal.priority} Priority
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{goal.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Category:</span> {goal.category.replace('_', ' ')}
                  </div>
                  <div>
                    <span className="font-medium">Target Date:</span> {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {new Date(goal.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setEditingGoal(goal)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit goal"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete goal"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Update Progress:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) => handleUpdateGoal(goal.id, { progress: parseInt(e.target.value) })}
                  className="flex-1 max-w-xs"
                />
                <select
                  value={goal.status}
                  onChange={(e) => handleUpdateGoal(goal.id, { status: e.target.value })}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ClockIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first performance goal</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Your First Goal
          </button>
        </div>
      )}
      </div>
    </PerformanceLayout>
  );
};

export default PerformanceGoals;
