import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Plane } from "lucide-react";
import api from "../api/axios";
import styles from "../styles/loginStyles"; 

export default function Login() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    //==============
    // ايميل ديمو
    //==============
    if (email === "admin@demo.com" && password === "123456") {
      localStorage.setItem("token", "demo-token");
      navigate("/dashboard");
      return;
    }

    try {
      const res = await api.post("/admin/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoBox}>
            <Plane size={28} color="#fff" fill="#fff" style={{ transform: "rotate(-45deg)" }} />
          </div>
        </div>
        <h2 style={styles.title}>Log In</h2>
        <p style={styles.sub}>Welcome back, Captain. Check your flight path.</p>
        <form onSubmit={handleLogin}>  
          <div style={styles.inputGroup}>
            <label style={styles.label}>EMAIL ADDRESS</label>
            <div style={styles.inputWrap}>
              <Mail size={16} color="#94a3b8" style={{ marginRight: "10px", flexShrink: 0 }} />
              <input
                style={styles.input}
                type="email"
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>PASSWORD</label>
            <div style={styles.inputWrap}>
              <Lock size={16} color="#94a3b8" style={{ marginRight: "10px", flexShrink: 0 }} />
              <input
                style={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
            </div>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}