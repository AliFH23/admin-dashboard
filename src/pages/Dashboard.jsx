import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Users, BarChart2, LogOut, Calendar } from "lucide-react";
import api from "../api/axios";
import UserTable from "../components/UserTable";

export default function Dashboard() {
  const [activePage, setActivePage] = useState("users");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data.users);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem("token"); navigate("/"); }
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    if (stats) return;
    setLoading(true);
    try {
      const allStats = await Promise.all(users.map((u) => api.get(`/admin/users/${u._id}/stats`)));
      const totalIncome = allStats.reduce((sum, r) => sum + (r.data.data.summary?.income?.total || 0), 0);
      const totalExpenses = allStats.reduce((sum, r) => sum + (r.data.data.summary?.expenses?.total || 0), 0);
      const fixed = allStats.reduce((sum, r) => sum + (r.data.data.summary?.expenses?.fixed?.total || 0), 0);
      const variable = allStats.reduce((sum, r) => sum + (r.data.data.summary?.expenses?.variable?.total || 0), 0);
      setStats({ totalIncome, totalExpenses, balance: totalIncome - totalExpenses, fixed, variable });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    if (page === "stats") fetchStats();
  };

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };
  const total = users.length;

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.navLogo}>
            <Plane size={20} color="#fff" style={{ transform: "rotate(-45deg)" }} />
          </div>
          <span style={styles.navTitle}>PocketPilot Admin</span>
        </div>
        <div style={styles.navLinks}>
          <span style={activePage === "users" ? styles.navLinkActive : styles.navLink} onClick={() => handlePageChange("users")}>
            <Users size={15} style={{ marginRight: "6px", verticalAlign: "middle" }} />Users
          </span>
          <span style={activePage === "stats" ? styles.navLinkActive : styles.navLink} onClick={() => handlePageChange("stats")}>
            <BarChart2 size={15} style={{ marginRight: "6px", verticalAlign: "middle" }} />Statistics
          </span>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />Logout
        </button>
      </div>

      <div style={styles.content}>

        {activePage === "users" && (
          <>
            <div style={styles.header}>
              <div>
                <p style={styles.headerSub}>ADMIN PANEL</p>
                <h1 style={styles.pageTitle}>User Management</h1>
              </div>
              <div style={styles.totalBadge}>
                <span style={styles.totalNum}>{total}</span>
                <span style={styles.totalLabel}>Total Users</span>
              </div>
            </div>
            {loading ? <p style={styles.loading}>Loading...</p> : <UserTable users={users} />}
          </>
        )}

        {activePage === "stats" && (
          <>
            <div style={styles.header}>
              <div>
                <p style={styles.headerSub}>FINANCIAL ANALYSIS</p>
                <h1 style={styles.pageTitle}>Statistics</h1>
              </div>
              <div style={styles.periodBadge}>
                <Calendar size={22} color="#2563EB" />
                <div>
                  <div style={styles.periodLabel}>ACTIVE PERIOD</div>
                  <div style={styles.periodVal}>{new Date().toLocaleString("default", { month: "short", year: "numeric" })}</div>
                </div>
              </div>
            </div>

            {loading ? <p style={styles.loading}>Loading...</p> : stats && (
              <>
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>BALANCE</div>
                    <div style={{ ...styles.statNum, color: "#2563EB" }}>${stats.balance.toLocaleString()}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: "#2563EB" }}>
                    <div style={{ ...styles.statLabel, color: "rgba(255,255,255,0.7)" }}>TOTAL INCOME</div>
                    <div style={{ ...styles.statNum, color: "#fff" }}>${stats.totalIncome.toLocaleString()}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: "#F59E0B" }}>
                    <div style={{ ...styles.statLabel, color: "rgba(255,255,255,0.7)" }}>TOTAL EXPENSES</div>
                    <div style={{ ...styles.statNum, color: "#fff" }}>${stats.totalExpenses.toLocaleString()}</div>
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.card}>
                    <div style={styles.cardTitle}>Expenses Breakdown</div>
                    <div style={styles.breakdownRow}>
                      <span style={styles.breakdownLabel}>Fixed</span>
                      <div style={styles.barTrack}>
                        <div style={{ ...styles.barFill, width: `${Math.round((stats.fixed / stats.totalExpenses) * 100) || 0}%`, background: "#2563EB" }} />
                      </div>
                      <span style={{ color: "#2563EB", fontWeight: "600", fontSize: "14px", minWidth: "50px", textAlign: "right" }}>${stats.fixed.toLocaleString()}</span>
                    </div>
                    <div style={styles.breakdownRow}>
                      <span style={styles.breakdownLabel}>Variable</span>
                      <div style={styles.barTrack}>
                        <div style={{ ...styles.barFill, width: `${Math.round((stats.variable / stats.totalExpenses) * 100) || 0}%`, background: "#F59E0B" }} />
                      </div>
                      <span style={{ color: "#F59E0B", fontWeight: "600", fontSize: "14px", minWidth: "50px", textAlign: "right" }}>${stats.variable.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div style={styles.cardTitle}>Cash Flow</div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <span style={{ fontSize: "11px", color: "#2563EB", fontWeight: "700" }}>INCOME</span>
                        <span style={{ fontSize: "11px", color: "#F59E0B", fontWeight: "700" }}>EXPENSES</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
                      <svg width="130" height="130" viewBox="0 0 140 140">
                        <circle cx="70" cy="70" r="55" fill="none" stroke="#f1f5f9" strokeWidth="22" />
                        <circle cx="70" cy="70" r="55" fill="none" stroke="#2563EB" strokeWidth="22"
                          strokeDasharray={`${2 * Math.PI * 55 * stats.totalIncome / (stats.totalIncome + stats.totalExpenses) || 0} ${2 * Math.PI * 55}`}
                          strokeDashoffset={2 * Math.PI * 55 * 0.25} strokeLinecap="round" />
                        <circle cx="70" cy="70" r="55" fill="none" stroke="#F59E0B" strokeWidth="22"
                          strokeDasharray={`${2 * Math.PI * 55 * stats.totalExpenses / (stats.totalIncome + stats.totalExpenses) || 0} ${2 * Math.PI * 55}`}
                          strokeDashoffset={-(2 * Math.PI * 55 * stats.totalIncome / (stats.totalIncome + stats.totalExpenses) || 0) + (2 * Math.PI * 55 * 0.25)}
                          strokeLinecap="round" />
                        <text x="70" y="63" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e293b">${(stats.balance / 1000).toFixed(1)}k</text>
                        <text x="70" y="79" textAnchor="middle" fontSize="10" fill="#94a3b8">Balance</text>
                      </svg>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                          <div style={{ fontSize: "11px", color: "#2563EB", fontWeight: "700" }}> INCOME</div>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>${stats.totalIncome.toLocaleString()}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{Math.round(stats.totalIncome / (stats.totalIncome + stats.totalExpenses) * 100) || 0}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#F59E0B", fontWeight: "700" }}> EXPENSES</div>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>${stats.totalExpenses.toLocaleString()}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{Math.round(stats.totalExpenses / (stats.totalIncome + stats.totalExpenses) * 100) || 0}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
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
  navLinkActive: { fontSize: "14px", color: "#2563EB", cursor: "pointer", padding: "4px 0", fontWeight: "600", borderBottom: "2px solid #2563EB", display: "flex", alignItems: "center" },
  logoutBtn: { padding: "8px 18px", background: "none", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" },
  content: { padding: "2rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" },
  headerSub: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.08em", margin: "0 0 4px" },
  pageTitle: { fontSize: "26px", fontWeight: "700", color: "#1e293b", margin: 0 },
  totalBadge: { background: "#2563EB", borderRadius: "14px", padding: "12px 20px", textAlign: "center" },
  totalNum: { display: "block", fontSize: "28px", fontWeight: "700", color: "#fff" },
  totalLabel: { fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  periodBadge: { display: "flex", alignItems: "center", gap: "12px", background: "#f1f5f9", borderRadius: "14px", padding: "12px 16px" },
  periodLabel: { fontSize: "10px", color: "#94a3b8", fontWeight: "700", letterSpacing: "0.05em" },
  periodVal: { fontSize: "15px", fontWeight: "700", color: "#1e293b" },
  loading: { textAlign: "center", color: "#94a3b8", marginTop: "3rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "1.5rem" },
  statCard: { background: "#fff", borderRadius: "16px", padding: "1.25rem 1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  statLabel: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "8px" },
  statNum: { fontSize: "28px", fontWeight: "700" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card: { background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "1.25rem" },
  breakdownRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
  breakdownLabel: { fontSize: "12px", color: "#64748b", width: "55px", flexShrink: 0 },
  barTrack: { flex: 1, height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "4px" },
};