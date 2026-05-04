import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserTable({ users }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  return (
    <div>
      <div style={styles.searchWrap}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search by User, Email or Phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4" style={styles.empty}>
                  {search ? "No users match your search" : "No users registered yet"}
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user._id} style={styles.tr} onClick={() => navigate(`/user/${user._id}`)}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.avatar}>{user.fullName.charAt(0)}</div>
                      <span style={styles.userName}>{user.fullName}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.phone}</td>
                  <td style={styles.td}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  searchWrap: { 
    marginBottom: "1rem" 
  },
  searchInput: { 
    width: "100%", 
    padding: "12px 16px", 
    borderRadius: "12px", 
    border: "none", 
    fontSize: "14px", 
    color: "#1e293b", 
    background: "#fff", 
    boxSizing: "border-box", 
    outline: "none", 
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)" 
  },
  tableWrap: { 
    background: "#fff", 
    borderRadius: "16px", 
    overflow: "hidden", 
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)" 
  },
  table: { 
    width: "100%", 
    borderCollapse: "collapse" 
  },
  thead: { 
    background: "#f8fafc" 
  },
  th: { 
    padding: "13px 16px", 
    textAlign: "left", 
    fontSize: "11px", 
    color: "#94a3b8", 
    fontWeight: "700", 
    textTransform: "uppercase", 
    letterSpacing: "0.07em", 
    borderBottom: "1px solid #f1f5f9" 
  },
  tr: { 
    borderBottom: "1px solid #f8fafc", 
    cursor: "pointer", 
    transition: "background 0.15s" 
  },
  td: { 
    padding: "13px 16px", 
    fontSize: "14px", 
    color: "#334155" 
  },
  empty: { 
    padding: "3rem", 
    textAlign: "center", 
    color: "#94a3b8", 
    fontSize: "14px" 
  },
  userCell: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px" 
  },
  avatar: { 
    width: "36px", 
    height: "36px", 
    borderRadius: "50%", 
    background: "#eff6ff", 
    color: "#2563EB", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontWeight: "700", 
    fontSize: "14px" 
  },
  userName: { 
    fontWeight: "600", 
    color: "#1e293b" 
  },
};