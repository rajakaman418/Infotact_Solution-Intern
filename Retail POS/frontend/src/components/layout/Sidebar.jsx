import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ReceiptText,
  LogOut,
  Boxes,
  UserPlus,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { logout, user } = useAuth();

  const role = user?.role;

  const navClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">Retail POS</div>

        <nav className="sidebar-nav">

          {(role === "system_admin" ||
            role === "inventory_manager") && (
            <NavLink to="/dashboard" className={navClass}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          )}

          {(role === "system_admin" ||
            role === "cashier") && (
            <NavLink to="/pos" className={navClass}>
              <ShoppingCart size={18} />
              <span>POS</span>
            </NavLink>
          )}

          {(role === "system_admin" ||
            role === "inventory_manager") && (
            <NavLink to="/products" className={navClass}>
              <Package size={18} />
              <span>Products</span>
            </NavLink>
          )}

          {(role === "system_admin" ||
            role === "cashier") && (
            <NavLink to="/orders" className={navClass}>
              <ReceiptText size={18} />
              <span>Orders</span>
            </NavLink>
          )}

          {(role === "system_admin" ||
            role === "inventory_manager") && (
            <NavLink to="/inventory/add" className={navClass}>
              <Boxes size={18} />
              <span>Add Stock</span>
            </NavLink>
          )}

          {role === "system_admin" && (
            <NavLink to="/register" className={navClass}>
              <UserPlus size={18} />
              <span>Register User</span>
            </NavLink>
          )}
        </nav>
      </div>

      <button className="logout-btn" onClick={logout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}