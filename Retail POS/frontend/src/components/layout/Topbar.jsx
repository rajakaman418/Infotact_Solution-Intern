import { useAuth } from "../../context/AuthContext";

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="topbar-user">
        <div className="avatar">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <strong>{user?.name || "User"}</strong>
          <div className="muted-text">{user?.role || "staff"}</div>
        </div>
      </div>
    </header>
  );
}