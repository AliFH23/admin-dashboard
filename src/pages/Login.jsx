import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Plane, Rotate3D } from "lucide-react";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  



  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // ايميل ديمو
    if (email === "admin@demo.com" && password === "123456") {
        localStorage.setItem("token", "demo-token");
        navigate("/dashboard");
        return;
        }
    try {
      const res = await api.post("/auth/login", { email, password });
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
            <Plane size={28} color="#fff" style={{transform:"rotate(-45deg)"}} />
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

const styles = {
  page: { minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" },
  card: { background: "#fff", padding: "2.5rem", borderRadius: "20px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  logoWrap: { display: "flex", justifyContent: "center", marginBottom: "1.25rem" },
  logoBox: { width: "64px", height: "64px", background: "#2563EB", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { fontSize: "26px", fontWeight: "700", color: "#1e293b", textAlign: "center", margin: "0 0 6px" },
  sub: { fontSize: "13px", color: "#94a3b8", textAlign: "center", marginBottom: "2rem" },
  inputGroup: { marginBottom: "1.25rem" },
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "8px", letterSpacing: "0.05em" },
  inputWrap: { display: "flex", alignItems: "center", background: "#f1f5f9", borderRadius: "12px", padding: "0 14px" },
  input: { flex: 1, padding: "13px 0", border: "none", background: "transparent", fontSize: "14px", color: "#1e293b", outline: "none" },
  button: { width: "100%", padding: "14px", background: "#2563EB", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginTop: "0.5rem" },
  error: { background: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "1rem" },
};