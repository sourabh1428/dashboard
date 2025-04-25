import React from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your automation dashboard!</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={() => navigate('/automation/create')}
        >
          <span className="mr-2">+</span> Create Automation
        </button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Automations</p>
              <p className="text-3xl font-bold mt-1">12</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 text-xl">⚡</span>
            </div>
          </div>
          <div className="flex items-center mt-4 text-xs text-green-500">
            <span>↗</span>
            <span className="ml-1">+24% from last month</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Automations</p>
              <p className="text-3xl font-bold mt-1">8</p>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 text-xl">📊</span>
            </div>
          </div>
          <div className="flex items-center mt-4 text-xs text-green-500">
            <span>↗</span>
            <span className="ml-1">67% of total</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Executions</p>
              <p className="text-3xl font-bold mt-1">432</p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 text-xl">📈</span>
            </div>
          </div>
          <div className="flex items-center mt-4 text-xs text-green-500">
            <span>↗</span>
            <span className="ml-1">+35% from last week</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-3xl font-bold mt-1">95.7%</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">✓</span>
            </div>
          </div>
          <div className="flex items-center mt-4 text-xs text-green-500">
            <span>↗</span>
            <span className="ml-1">+2.3% improvement</span>
          </div>
        </div>
      </div>
      
      {/* Recent Automations */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Recent Automations</h2>
            <p className="text-sm text-gray-500">Your recently created or updated automations</p>
          </div>
          <button 
            className="text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 flex items-center"
            onClick={() => navigate('/automation')}
          >
            View All <span className="ml-2">→</span>
          </button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/automation/1')}>
                  <td className="py-4 px-4">
                    <div className="font-medium text-blue-600">Welcome Email Sequence</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="ml-2 text-sm">new_signup</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">Marketing</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">286</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/automation/2')}>
                  <td className="py-4 px-4">
                    <div className="font-medium text-blue-600">Abandoned Cart Recovery</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="ml-2 text-sm">abandoned_cart</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">Sales</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">142</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/automation/3')}>
                  <td className="py-4 px-4">
                    <div className="font-medium text-blue-600">Follow-up Task Creation</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="ml-2 text-sm">purchase_completed</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Paused</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">Customer Service</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">67</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard; 