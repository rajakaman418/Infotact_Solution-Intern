import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ReceiptText,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Boxes } from "lucide-react";

export default function Sidebar() {
  const { logout } = useAuth();

  const navClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">Retail POS</div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={navClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/pos" className={navClass}>
            <ShoppingCart size={18} />
            <span>POS</span>
          </NavLink>

          <NavLink to="/products" className={navClass}>
            <Package size={18} />
            <span>Products</span>
          </NavLink>

          <NavLink to="/orders" className={navClass}>
            <ReceiptText size={18} />
            <span>Orders</span>
          </NavLink>
          <NavLink to="/inventory/add" className={navClass}>
            <Boxes size={18} />
            <span>Add Stock</span>
          </NavLink>
        </nav>
      </div>

      <button className="logout-btn" onClick={logout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}