import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plane, Users, BarChart2, LogOut, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import api from "../api/axios";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get("/admin/users"),
          api.get(`/admin/users/${id}/stats`),
        ]);
        const foundUser = usersRes.data.data.users.find((u) => u._id === id);
        setUser(foundUser);
        setStats(statsRes.data.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: "2rem", color: "#94a3b8", fontFamily: "'Segoe UI', sans-serif" }}>Loading...</div>;
  if (!user) return <div style={{ padding: "2rem" }}>User not found</div>;

  const income = stats?.summary?.income?.total || 0;
  const totalExpenses = stats?.summary?.expenses?.total || 0;
  const fixed = stats?.summary?.expenses?.fixed?.total || 0;
  const variable = stats?.summary?.expenses?.variable?.total || 0;
  const balance = stats?.summary?.balance || 0;
  const recent = stats?.recent || [];

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.navLogo}>
            <Plane size={20} color="#fff" />
          </div>
          <span style={styles.navTitle}>PocketPilot Admin</span>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => navigate("/dashboard")}>
            <Users size={15} style={{ marginRight: "6px", verticalAlign: "middle" }} />Users
          </span>
          <span style={styles.navLink} onClick={() => navigate("/dashboard")}>
            <BarChart2 size={15} style={{ marginRight: "6px", verticalAlign: "middle" }} />Statistics
          </span>
        </div>
        <button style={styles.logoutBtn} onClick={() => { localStorage.removeItem("token"); navigate("/"); }}>
          <LogOut size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />Logout
        </button>
      </div>

      <div style={styles.content}>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />Back to Users
        </button>

        {/* User Header */}
        <div style={styles.userCard}>
          <div style={styles.userAvatar}>{user.fullName.charAt(0)}</div>
          <div>
            <div style={styles.userName}>{user.fullName}</div>
            <div style={styles.userMeta}>{user.email} · {user.phone}</div>
            <div style={styles.userDate}>
              Joined: {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>BALANCE</div>
            <div style={{ ...styles.summaryNum, color: "#2563EB" }}>${balance.toLocaleString()}</div>
          </div>
          <div style={{ ...styles.summaryCard, background: "#2563EB" }}>
            <div style={{ ...styles.summaryLabel, color: "rgba(255,255,255,0.7)" }}>TOTAL INCOME</div>
            <div style={{ ...styles.summaryNum, color: "#fff" }}>${income.toLocaleString()}</div>
          </div>
          <div style={{ ...styles.summaryCard, background: "#F59E0B" }}>
            <div style={{ ...styles.summaryLabel, color: "rgba(255,255,255,0.7)" }}>TOTAL EXPENSES</div>
            <div style={{ ...styles.summaryNum, color: "#fff" }}>${totalExpenses.toLocaleString()}</div>
          </div>
        </div>

        <div style={styles.row}>
          {/* Expenses Breakdown */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Expenses Breakdown</div>
            <div style={styles.breakdownRow}>
              <span style={styles.breakdownLabel}>Fixed</span>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: totalExpenses ? `${Math.round((fixed / totalExpenses) * 100)}%` : "0%", background: "#2563EB" }} />
              </div>
              <span style={{ color: "#2563EB", fontWeight: "600", fontSize: "14px", minWidth: "50px", textAlign: "right" }}>${fixed.toLocaleString()}</span>
            </div>
            <div style={styles.breakdownRow}>
              <span style={styles.breakdownLabel}>Variable</span>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: totalExpenses ? `${Math.round((variable / totalExpenses) * 100)}%` : "0%", background: "#F59E0B" }} />
              </div>
              <span style={{ color: "#F59E0B", fontWeight: "600", fontSize: "14px", minWidth: "50px", textAlign: "right" }}>${variable.toLocaleString()}</span>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Recent Transactions</div>
            {recent.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>No transactions found</p>
            ) : recent.map((t) => (
              <div key={t.id} style={styles.txItem}>
                <div style={{ ...styles.txIcon, background: t.type === "income" ? "#eff6ff" : "#fffbeb", color: t.type === "income" ? "#2563EB" : "#F59E0B" }}>
                  {t.type === "income"
                    ? <TrendingUp size={16} />
                    : <TrendingDown size={16} />}
                </div>
                <div style={styles.txInfo}>
                  <div style={styles.txTitle}>{t.title}</div>
                  <div style={styles.txDate}>{new Date(t.date).toLocaleDateString()}</div>
                </div>
                <div style={{ ...styles.txAmt, color: t.type === "income" ? "#2563EB" : "#F59E0B" }}>
                  {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f0f2f5", fontFamily: "'Segoe UI', sans-serif" },
  navbar: { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
  navBrand: { display: "flex", alignItems: "center", gap: "10px" },
  navLogo: { width: "36px", height: "36px", background: "#2563EB", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: "17px", fontWeight: "700", color: "#2563EB" },
  navLinks: { display: "flex", gap: "2rem" },
  navLink: { fontSize: "14px", color: "#64748b", cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center" },
  logoutBtn: { padding: "8px 18px", background: "none", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" },
  content: { padding: "2rem" },
  backBtn: { background: "none", border: "none", color: "#2563EB", fontSize: "14px", cursor: "pointer", marginBottom: "1.25rem", padding: 0, fontWeight: "600", display: "flex", alignItems: "center" },
  userCard: { display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "1.5rem" },
  userAvatar: { width: "56px", height: "56px", borderRadius: "50%", background: "#eff6ff", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "22px", flexShrink: 0 },
  userName: { fontSize: "18px", fontWeight: "700", color: "#1e293b" },
  userMeta: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  userDate: { fontSize: "12px", color: "#94a3b8", marginTop: "4px" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "1.5rem" },
  summaryCard: { background: "#fff", borderRadius: "16px", padding: "1.25rem 1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  summaryLabel: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "8px" },
  summaryNum: { fontSize: "28px", fontWeight: "700" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card: { background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "1.25rem" },
  breakdownRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
  breakdownLabel: { fontSize: "12px", color: "#64748b", width: "55px", flexShrink: 0 },
  barTrack: { flex: 1, height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px" },
  txItem: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f8fafc" },
  txIcon: { width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  txInfo: { flex: 1 },
  txTitle: { fontSize: "14px", fontWeight: "500", color: "#1e293b" },
  txDate: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  txAmt: { fontSize: "14px", fontWeight: "600" },
};