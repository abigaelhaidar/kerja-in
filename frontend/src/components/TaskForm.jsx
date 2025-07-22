import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function TaskForm() {
  const [task, setTask] = useState("");
  const [status, setStatus] = useState("pending");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task) return;

    const { error } = await supabase.from("tasks").insert([{ title: task, status }]);
    if (!error) {
      setTask("");
      setStatus("pending");
      alert("Task added successfully!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Task title"
        className="w-full border rounded px-3 py-2"
        required
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="pending">Pending</option>
        <option value="in progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Task
      </button>
    </form>
  );
}
