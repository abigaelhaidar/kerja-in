// components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Tasks", path: "/tasks" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-8">SPV Dashboard</h1>
      <nav className="flex flex-col gap-4 text-gray-600 font-medium">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={location.pathname === item.path ? "text-green-700" : ""}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
