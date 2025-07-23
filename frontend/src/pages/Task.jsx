import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import TaskCard from "../components/TaskCard";

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("task_reports")
        .select(`
          id,
          status,
          submitted_at,
          keterangan,
          photo_url,
          tasks (
            id,
            title,
            description,
            assigned_date
          ),
          users:submitted_by (
            name,
            telegram_id
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err.message);
      setError("Gagal memuat data tugas. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // 👇 Real-time listener untuk tabel task_reports
    const taskReportSubscription = supabase
      .channel('realtime:task_reports')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_reports',
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          fetchTasks(); // Re-fetch tasks on change
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(taskReportSubscription);
    };
  }, []);

  const handleStatusUpdate = () => {
    fetchTasks();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-8">
          <h2 className="text-3xl font-bold mb-6">Laporan Menunggu Review</h2>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Laporan Menunggu Review</h2>
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
            {tasks.length} Laporan
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <p className="text-gray-600">Tidak ada laporan yang menunggu review.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
