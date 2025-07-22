import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", {
      ascending: false,
    });
    if (data) setTasks(data);
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  };

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
          <div>
            <p className="font-medium">{task.title}</p>
            <span className="text-xs text-gray-600">{task.status}</span>
          </div>
          <button
            onClick={() => deleteTask(task.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
