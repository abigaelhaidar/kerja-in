// src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("task_reports")
      .select(`*, users(name)`)
      .order("submitted_at", { ascending: false });

    if (data) setReports(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Task Reports</h2>
      <div className="bg-white p-4 rounded-xl shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">User</th>
              <th className="py-2">Photo</th>
              <th className="py-2">Status</th>
              <th className="py-2">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b">
                <td className="py-2">{report.users?.name || report.submitted_by}</td>
                <td className="py-2">
                  <a
                    href={report.photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 underline"
                  >
                    View
                  </a>
                </td>
                <td className="py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      report.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="py-2">{report.submitted_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
