import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

const initialRegisterForm = {
  name: "",
  email: "",
  password: "",
  role: "cashier",
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState(initialRegisterForm);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await login(loginForm.email, loginForm.password);

      const role = data?.user?.role;

      if (role === "cashier") {
        navigate("/pos");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await registerUser(registerForm);

      alert("Registration successful. Please login.");

      setLoginForm({
        email: registerForm.email,
        password: "",
      });

      setRegisterForm(initialRegisterForm);
      setMode("login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Retail POS</h1>
        <p>
          {mode === "login"
            ? "Sign in to continue"
            : "Create a role-based account"}
        </p>

        {mode === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm((p) => ({ ...p, email: e.target.value }))
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((p) => ({ ...p, password: e.target.value }))
              }
              required
            />

            {error && <div className="error-text">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="auth-switch">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("register");
                }}
              >
                Register
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={registerForm.name}
              onChange={(e) =>
                setRegisterForm((p) => ({ ...p, name: e.target.value }))
              }
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm((p) => ({ ...p, email: e.target.value }))
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm((p) => ({ ...p, password: e.target.value }))
              }
              required
            />

            <select
              value={registerForm.role}
              onChange={(e) =>
                setRegisterForm((p) => ({ ...p, role: e.target.value }))
              }
              required
            >
              <option value="cashier">Store Cashier</option>
              <option value="inventory_manager">Inventory Manager</option>
              <option value="system_admin">System Administrator</option>
            </select>

            {error && <div className="error-text">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="auth-switch">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
              >
                Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}