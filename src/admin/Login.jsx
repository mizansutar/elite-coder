import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page">

      <div className="login-card">
        <h2>Admin Login</h2>

        <input placeholder="Email" />
        <input type="password" placeholder="Password" />

        <button onClick={() => navigate("/admin/dashboard")}>
          Login
        </button>
      </div>

    </div>
  );
}
