import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaBars } from "react-icons/fa";

export default function Layout({ children }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Inventory", path: "/inventory" },
    { name: "POS", path: "/pos" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className={`fixed md:relative z-50 w-64 bg-blue-900 text-white h-full
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition`}>

        <h1 className="text-xl font-bold p-4 border-b">Ultimate Inventory</h1>

        <ul>
          {menu.map((item) => (
            <li key={item.path}
              className={`p-3 hover:bg-blue-700 ${
                location.pathname === item.path ? "bg-blue-700" : ""
              }`}
            >
              <Link to={item.path} onClick={()=>setOpen(false)}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* LOGOUT */}
        <div className="p-4 border-t">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="bg-red-500 px-3 py-1 rounded w-full"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white shadow p-4 flex justify-between items-center">

          <button className="md:hidden" onClick={()=>setOpen(!open)}>
            <FaBars />
          </button>

          <h2 className="font-semibold">Dashboard</h2>

          <p>{user?.name || "Admin"}</p>
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}