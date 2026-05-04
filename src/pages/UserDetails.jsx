import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Users, BarChart2, LogOut, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import api from "../api/axios";
import styles from "../styles/userDetailsStyles"; // ✅ استيراد الـ styles

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth]     = useState(new Date().getMonth() + 1);
  const [year, setYear]       = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, statsRes] = await Promise.all([
          api.get(`/admin/users/${id}`),
          api.get(`/admin/users/${id}/stats?month=${month}&year=${year}`),
        ]);
        
        setUser(userRes.data.data.user);
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
  }, [id, month, year]);

  if (loading) return <div style={{ padding: "2rem", color: "#94a3b8", fontFamily: "'Segoe UI', sans-serif" }}>Loading...</div>;
  if (!user)   return <div style={{ padding: "2rem" }}>User not found</div>;

  const income        = stats?.summary?.income?.total               || 0;
  const totalExpenses = stats?.summary?.expenses?.total             || 0;
  const fixed         = stats?.summary?.expenses?.fixed?.total      || 0;
  const variable      = stats?.summary?.expenses?.variable?.total   || 0;
  const balance       = stats?.summary?.balance                     || 0;
  const recent        = stats?.recent                               || [];

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navBrand}>
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
          <div style={{ flex: 1 }}>
            <div style={styles.userName}>{user.fullName}</div>
            <div style={styles.userMeta}>{user.email} · {user.phone}</div>
            <div style={styles.userDate}>
              Joined: {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* Month/Year Selector */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={styles.select}>
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={styles.select}>
              {Array.from(
                { length: new Date().getFullYear() - 2024 + 3 },
                (_, i) => 2024 + i
              ).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
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
            {/* <div style={{ maxHeight: "300px", overflowY: "auto" }}></div> */}
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

          {/* Transactions */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              Transactions
              <span style={{ fontSize: "12px", fontWeight: "400", color: "#94a3b8", marginLeft: "8px" }}>
                ({recent.length})
              </span>
            </div>
            {recent.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>No transactions found</p>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {recent.map((t) => (
                  <div key={t.id} style={styles.txItem}>
                    <div style={{ ...styles.txIcon, background: t.type === "income" ? "#eff6ff" : "#fffbeb", color: t.type === "income" ? "#2563EB" : "#F59E0B" }}>
                      {t.type === "income" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}