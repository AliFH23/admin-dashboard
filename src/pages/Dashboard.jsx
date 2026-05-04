import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BarChart2, LogOut } from "lucide-react";
import api from "../api/axios";
import UserTable from "../components/UserTable";
import styles from "../styles/dashboardStyles"; 

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Dashboard() {
  const [activePage, setActivePage] = useState("users");
  const [users, setUsers]           = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [statsMonth, setStatsMonth] = useState(new Date().getMonth() + 1);
  const [statsYear, setStatsYear]   = useState(new Date().getFullYear());
  const navigate = useNavigate();

  // لما الصفحة تفتح أول مرة => جيب اليوزرز تلقائياً 
  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // GET http://localhost:8000/api/admin/users 
      const res = await api.get("/admin/users");
      setUsers(res.data.data.users);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem("token"); navigate("/"); }
    } finally { setLoading(false); }
  };

  // بتجيب إحصائيات كل اليوزرز للشهر والسنة المحددين 
  const fetchStats = async (month, year) => {
    setLoading(true);
    setStats(null);
    try {
      const allStats = await Promise.all(
        users.map((u) => api.get(`/admin/users/${u._id}/stats?month=${month}&year=${year}`))
      );
      const totalIncome   = allStats.reduce((sum, r) => sum + (r.data.data.summary?.income?.total    || 0), 0);
      const totalExpenses = allStats.reduce((sum, r) => sum + (r.data.data.summary?.expenses?.total  || 0), 0);
      const fixed         = allStats.reduce((sum, r) => sum + (r.data.data.summary?.expenses?.fixed?.total    || 0), 0);
      const variable      = allStats.reduce((sum, r) => sum + (r.data.data.summary?.expenses?.variable?.total || 0), 0);
      setStats({ totalIncome, totalExpenses, balance: totalIncome - totalExpenses, fixed, variable });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  //لما اضغط على Users او Statistics
  const handlePageChange = (page) => {
    setActivePage(page);
    if (page === "stats") fetchStats(statsMonth, statsYear); // هون اذا احتا في صفحة Statistics جيب الاحصائيات
  };

  const handleLogout = () => {
     localStorage.removeItem("token"); 
     navigate("/"); 
    };
  const total = users.length;

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.navTitle}>PocketPilot Admin</span>
        </div>
        <div style={styles.navLinks}>
          <span
            style={activePage === "users" ? styles.navLinkActive : styles.navLink}
            onClick={() => handlePageChange("users")}
          >
            <Users size={15} style={{ marginRight: "6px", verticalAlign: "middle" }} />Users
          </span>
          <span
            style={activePage === "stats" ? styles.navLinkActive : styles.navLink}
            onClick={() => handlePageChange("stats")}
          >
            <BarChart2 size={15} style={{ marginRight: "6px", verticalAlign: "middle" }} />Statistics
          </span>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />Logout
        </button>
      </div>

      <div style={styles.content}>

        {/* ── Users Page ── */}
        {activePage === "users" && (
          <>
            <div style={styles.header}>
              <div>
                <p style={styles.headerSub}>ADMIN PANEL</p>
                <h1 style={styles.pageTitle}>User Management</h1>
              </div>
              <div style={styles.totalBadge}>
                <span style={styles.totalNum}>{total}</span> {/*يعرض عدد اليوزرز*/} 
                <span style={styles.totalLabel}>Total Users</span>
              </div>
            </div>
            {loading
              ? <p style={styles.loading}>Loading...</p>
              : <UserTable users={users} />
            }
          </>
        )}

        {/* ── Statistics Page ── */}
        {activePage === "stats" && (
          <>
            <div style={styles.header}>
              <div>
                <p style={styles.headerSub}>FINANCIAL ANALYSIS</p>
                <h1 style={styles.pageTitle}>Statistics</h1>
              </div>

              {/* Month / Year Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <select
                  value={statsMonth}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setStatsMonth(m);
                    fetchStats(m, statsYear);
                  }}
                  style={styles.select}
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={statsYear}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setStatsYear(y);
                    fetchStats(statsMonth, y);
                  }}
                  style={styles.select}
                >
                  {Array.from(
                    { length: new Date().getFullYear() - 2024 + 3 },
                    (_, i) => 2024 + i
                  ).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
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
                  {/* Expenses Breakdown */}
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

                  {/* Cash Flow */}
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
                          <div style={{ fontSize: "11px", color: "#2563EB", fontWeight: "700" }}>INCOME</div>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>${stats.totalIncome.toLocaleString()}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{Math.round(stats.totalIncome / (stats.totalIncome + stats.totalExpenses) * 100) || 0}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#F59E0B", fontWeight: "700" }}>EXPENSES</div>
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