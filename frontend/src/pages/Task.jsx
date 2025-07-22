// src/pages/Tasks.jsx
import React from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

export default function Tasks() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Tasks</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-2">Create New Task</h3>
          <TaskForm />
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-lg mb-2">Task List</h3>
          <TaskList />
        </div>
      </div>
    </div>
  );
}
