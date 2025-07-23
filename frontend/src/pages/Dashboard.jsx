import React, { useEffect, useState } from "react";
import {
  Check,
  CalendarDays,
  User2,
  BarChart4,
} from "lucide-react";
import Swal from "sweetalert2";
import { Dialog } from "@headlessui/react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskData, setTaskData] = useState({ title: "", description: "", assigned_date: "", created_by: "" });
  const [saving, setSaving] = useState(false);

  const [counts, setCounts] = useState({
    users: 0,
    reportsToday: 0,
    totalTasks: 0,
    completedRate: "0%",
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentReports, setRecentReports] = useState([]);

  // Ambil statistik dan data recent
  const fetchStats = async () => {
    // Active users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Today reports
    const today = new Date().toISOString().split('T')[0];
    const { count: reportsTodayCount } = await supabase
      .from('task_reports')
      .select('*', { count: 'exact', head: true })
      .eq('submitted_at', today);

    // Total tasks
    const { count: totalTasksCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    // Completed rate
    const { data: doneOnly } = await supabase
      .from('task_reports')
      .select('id', { count: 'exact' })
      .eq('status', 'approved');
    const completedRate = totalTasksCount ? `${Math.round((doneOnly.count / totalTasksCount) * 100)}%` : '0%';

    // Recent tasks
    const { data: tasksList } = await supabase
      .from('tasks')
      .select('id, title, assigned_date, created_by')
      .order('assigned_date', { ascending: false })
      .limit(3);

    // Recent reports
    const { data: reportsList } = await supabase
      .from('task_reports')
      .select('id, status, submitted_at, photo_url, tasks(title), users:submitted_by(name)')
      .order('submitted_at', { ascending: false })
      .limit(3);

    setCounts({ users: userCount, reportsToday: reportsTodayCount, totalTasks: totalTasksCount, completedRate });
    setRecentTasks(tasksList || []);
    setRecentReports(reportsList || []);
  };

  useEffect(() => {
    fetchStats();
    const usersSub = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchStats();
      })
      .subscribe();
    const tasksSub = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchStats();
      })
      .subscribe();
    const reportsSub = supabase
      .channel('reports-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_reports' }, () => {
        fetchStats();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(usersSub);
      supabase.removeChannel(tasksSub);
      supabase.removeChannel(reportsSub);
    };
  }, []);

  const handleCreateTask = async () => {
    const { title, description, created_by } = taskData;
    if (!title || !description || !created_by) {
      return Swal.fire("Gagal", "Semua field harus diisi", "warning");
    }
  
    const assigned_date = new Date().toISOString();
    
  
    // Fungsi untuk generate ID tugas otomatis
    const getNextTaskId = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id")
        .like("id", "TASK%")
        .order("id", { ascending: false })
        .limit(1);
  
      if (error) {
        console.error("Gagal mengambil ID terakhir:", error);
        return "TASK001";
      }
  
      if (!data || data.length === 0) return "TASK001";
  
      const lastId = data[0].id; // contoh: TASK008
      const nextNumber = parseInt(lastId.replace("TASK", "")) + 1;
      return `TASK${String(nextNumber).padStart(3, "0")}`; // contoh: TASK009
    };
  
    try {
      setSaving(true);
      const newTaskId = await getNextTaskId();
  
      const { error } = await supabase.from("tasks").insert([{
        id: newTaskId,
        title,
        description,
        assigned_date,
        created_by,
      }]);
  
      if (error) throw error;
  
      Swal.fire("Berhasil!", "Tugas berhasil ditambahkan", "success");
      setIsModalOpen(false);
      fetchStats();
      setTaskData({ title: "", description: "", assigned_date: "", created_by: "" });
    } catch (err) {
      console.error("Insert error:", err);
      Swal.fire("Error", "Gagal menambahkan tugas", "error");
    } finally {
      setSaving(false);
    }
  };
 

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Welcome back! Here's your task overview.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + New Task
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Active Users" value={counts.users} change="+12%" icon={<User2 />} />
          <StatCard label="Reports Today" value={counts.reportsToday} change="+?" icon={<CalendarDays />} />
          <StatCard label="Total Tasks" value={counts.totalTasks} change="+?" icon={<Check />} />
          <StatCard label="Completion Rate" value={counts.completedRate} change="+?" icon={<BarChart4 />} />
        </div>

        {/* Recent Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ListCard title="Recent Tasks" items={recentTasks.map(t => ({
            title: t.title,
            subtitle: `Assigned to ${t.created_by}`,
            date: t.assigned_date,
            status: 'pending',
          }))} />
          <ListCard title="Recent Reports" items={recentReports.map(r => ({
            title: r.tasks?.title,
            subtitle: r.users?.name,
            date: r.submitted_at,
            status: r.status,
          }))} />
        </div>
      </main>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 flex justify-center items-center p-4">
          <Dialog.Panel className="w-full max-w-lg bg-white rounded-xl p-6 shadow-lg">
            <Dialog.Title className="text-xl font-bold mb-4">Tambah Tugas Baru</Dialog.Title>
            {/* Form */}
            <FormInput label="Nama Tugas" value={taskData.title} onChange={e => setTaskData(prev => ({ ...prev, title: e.target.value }))} />
            <FormInput multiline label="Deskripsi" value={taskData.description} onChange={e => setTaskData(prev => ({ ...prev, description: e.target.value }))} />
            <FormInput label="Dibuat oleh" value={taskData.created_by} onChange={e => setTaskData(prev => ({ ...prev, created_by: e.target.value }))} />
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Batal</button>
              <button onClick={handleCreateTask} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

// Komponen pembantu
function StatCard({ label, value, change, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">{label}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-green-600 text-sm mt-1">{change}</p>
        </div>
        <div className="text-green-600">{icon}</div>
      </div>
    </div>
  );
}

function ListCard({ title, items }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h4 className="text-xl font-bold mb-4">{title}</h4>
      <div className="divide-y">
        {items.map((it, i) => (
          <div key={i} className="py-2 flex justify-between items-center">
            <div>
              <p className="font-medium">{it.title}</p>
              <p className="text-sm text-gray-500">{it.subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{it.date}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                it.status === 'completed' || it.status === 'approved'
                  ? 'bg-green-100 text-green-600'
                  : it.status === 'rejected'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {it.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormInput({ label, multiline, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {multiline ? (
        <textarea className="mt-1 block w-full border rounded-md p-2" rows={3} {...props} />
      ) : (
        <input className="mt-1 block w-full border rounded-md p-2" {...props} />
      )}
    </div>
  );
}
