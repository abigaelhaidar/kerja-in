// pages/Reports.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    const { data, error } = await supabase
      .from("task_reports")
      .select(`
        id,
        photo_url,
        status,
        submitted_at,
        keterangan,
        tasks(title),
        users(name)
      `)
      .in("status", ["approved", "rejected"]); // ✅ Filter hanya yang sudah divalidasi

    if (error) {
      console.error("Error fetching reports:", error.message);
    } else {
      setReports(data);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-6">Task Reports</h2>
        <div className="grid gap-6">
          {reports.length === 0 ? (
            <p className="text-gray-600">Belum ada laporan yang divalidasi.</p>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow p-6 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    {report.tasks?.title || "Judul Tugas Tidak Ditemukan"}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      report.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : report.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">
                  <strong>Nama Karyawan:</strong> {report.users?.name || "-"}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Tanggal Submit:</strong> {report.submitted_at || "-"}
                </p>
                {report.keterangan && (
                  <p className="text-gray-700 text-sm">
                    <strong>Keterangan:</strong> {report.keterangan}
                  </p>
                )}
                {report.photo_url && (
                  <img
                    src={report.photo_url}
                    alt="Task Report"
                    className="rounded-md mt-2 w-full max-w-xs"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
