import React from "react";
import { Check, CalendarDays, User2, BarChart4 } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h1 className="text-2xl font-bold text-green-700 mb-8">SPV Dashboard</h1>
        <nav className="flex flex-col gap-4 text-gray-600 font-medium">
          <a href="/dashboard" className="text-green-700">Dashboard</a>
          <a href="/tasks">Tasks</a>
          <a href="/reports">Reports</a>
          {/* <a href="#">Settings</a> */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Welcome back! Here's your task overview.</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ New Task</button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Active Users</p>
                <h3 className="text-2xl font-bold">24</h3>
                <p className="text-green-600 text-sm mt-1">+12% from last month</p>
              </div>
              <User2 className="text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Reports Today</p>
                <h3 className="text-2xl font-bold">8</h3>
                <p className="text-green-600 text-sm mt-1">+25% from yesterday</p>
              </div>
              <CalendarDays className="text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Total Tasks</p>
                <h3 className="text-2xl font-bold">156</h3>
                <p className="text-green-600 text-sm mt-1">+8% this week</p>
              </div>
              <Check className="text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Completion Rate</p>
                <h3 className="text-2xl font-bold">87%</h3>
                <p className="text-green-600 text-sm mt-1">+5% improvement</p>
              </div>
              <BarChart4 className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Recent Tasks and Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h4 className="text-xl font-bold mb-4">Recent Tasks</h4>
            <div className="divide-y">
              <div className="py-2 flex justify-between items-center">
                <div>
                  <p className="font-medium">Complete project proposal</p>
                  <p className="text-sm text-gray-500">Assigned to John Doe</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">2024-01-15</p>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">pending</span>
                </div>
              </div>
              <div className="py-2 flex justify-between items-center">
                <div>
                  <p className="font-medium">Review marketing strategy</p>
                  <p className="text-sm text-gray-500">Assigned to Jane Smith</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">2024-01-12</p>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">completed</span>
                </div>
              </div>
              <div className="py-2 flex justify-between items-center">
                <div>
                  <p className="font-medium">Update system documentation</p>
                  <p className="text-sm text-gray-500">Assigned to Mike Johnson</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">2024-01-18</p>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h4 className="text-xl font-bold mb-4">Recent Reports</h4>
            <div className="divide-y">
              <div className="py-2 flex justify-between items-start">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-500">Project proposal submitted successfully</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">2 hours ago</p>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">completed</span>
                </div>
              </div>
              <div className="py-2 flex justify-between items-start">
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-gray-500">Marketing review completed with recommendations</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">4 hours ago</p>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">completed</span>
                </div>
              </div>
              <div className="py-2 flex justify-between items-start">
                <div>
                  <p className="font-medium">Mike Johnson</p>
                  <p className="text-sm text-gray-500">System docs updated</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">6 hours ago</p>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
