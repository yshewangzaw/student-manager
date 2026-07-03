import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/Attendance.css";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Attendance() {
  const { students, attendance, saveAttendance, getAttendanceRate, loading } = useAppContext();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [records, setRecords]           = useState({});   // { studentId: status }
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState("mark"); // "mark" | "history"

  // Load existing records for selected date
  useEffect(() => {
    const existing = {};
    students.forEach(s => { existing[s.id] = "present"; });
    attendance
      .filter(a => a.date === selectedDate)
      .forEach(a => { existing[a.studentId] = a.status; });
    setRecords(existing);
  }, [selectedDate, attendance, students]);

  function setStatus(studentId, status) {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  }

  function handleMarkAll(status) {
    const next = {};
    students.forEach(s => { next[s.id] = status; });
    setRecords(next);
  }

  function handleSave() {
    const entries = students.map(s => ({
      studentId: s.id,
      date: selectedDate,
      status: records[s.id] || "present",
    }));
    saveAttendance(entries);
  }

  // Per-student attendance summary for history tab
  const summaryRows = students
    .map(s => {
      const rate = getAttendanceRate(s.id);
      const recs = attendance.filter(a => a.studentId === s.id);
      const present = recs.filter(a => a.status === "present").length;
      const absent  = recs.filter(a => a.status === "absent").length;
      const late    = recs.filter(a => a.status === "late").length;
      return { ...s, rate, total: recs.length, present, absent, late };
    })
    .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));

  // Active student filter
  const activeStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === "" || records[s.id] === filterStatus)
  );

  const countPresent = students.filter(s => records[s.id] === "present").length;
  const countAbsent  = students.filter(s => records[s.id] === "absent").length;
  const countLate    = students.filter(s => records[s.id] === "late").length;

  const overallRate = attendance.length
    ? Math.round(
        (attendance.filter(a => a.status === "present" || a.status === "late").length / attendance.length) * 100
      )
    : 0;

  return (
    <div className="attendance-page fade-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">Attendance</h1>
          <p className="section-subtitle">Track daily attendance — {attendance.length} total records</p>
        </div>
        <div className="overall-rate-badge">
          <span className="overall-rate-label">Overall Rate</span>
          <span className="overall-rate-value">{overallRate}%</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="att-tabs">
        <button className={`att-tab ${activeTab === "mark" ? "att-tab--active" : ""}`} onClick={() => setActiveTab("mark")}>
          📅 Mark Attendance
        </button>
        <button className={`att-tab ${activeTab === "history" ? "att-tab--active" : ""}`} onClick={() => setActiveTab("history")}>
          📋 Student Summary
        </button>
      </div>

      {/* ═══ MARK TAB ═══ */}
      {activeTab === "mark" && (
        <div className="mark-panel scale-in">
          {/* Controls */}
          <div className="mark-controls">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" style={{ width: "auto" }}
                value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>

            <div className="att-day-summary">
              <span className="att-day-chip att-day-present">✅ {countPresent} Present</span>
              <span className="att-day-chip att-day-absent">❌ {countAbsent} Absent</span>
              <span className="att-day-chip att-day-late">⏰ {countLate} Late</span>
            </div>

            <div className="mark-bulk">
              <span className="form-label" style={{ margin: 0 }}>Mark All:</span>
              <button className="btn btn-success" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                onClick={() => handleMarkAll("present")}>✅ Present</button>
              <button className="btn btn-danger" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                onClick={() => handleMarkAll("absent")}>❌ Absent</button>
            </div>
          </div>

          {/* Search + filter */}
          <div className="mark-filters">
            <input type="text" placeholder="🔍 Search student…" className="form-input"
              style={{ flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" style={{ width: "auto" }}
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>

          {/* Student list */}
          <div className="mark-list">
            {activeStudents.length === 0 && (
              <div className="empty-state" style={{ minHeight: "120px" }}>
                <span className="empty-icon">🔍</span>No students match
              </div>
            )}
            {activeStudents.map(s => (
              <div key={s.id} className={`mark-row mark-row--${records[s.id] || "present"}`}>
                <div className="mark-student">
                  <div className="mark-avatar">{s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                  <div>
                    <div className="mark-name">{s.name}</div>
                    <div className="mark-meta">{s.course} · Batch {s.batch}</div>
                  </div>
                </div>
                <div className="mark-buttons">
                  {["present", "absent", "late"].map(st => (
                    <button
                      key={st}
                      className={`mark-btn mark-btn--${st} ${records[s.id] === st ? "mark-btn--active" : ""}`}
                      onClick={() => setStatus(s.id, st)}
                    >
                      {st === "present" ? "✅" : st === "absent" ? "❌" : "⏰"} {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mark-save-bar">
            <button className="btn btn-primary" onClick={handleSave} disabled={loading || students.length === 0}>
              {loading ? <><span className="loading-spinner" /> Saving…</> : "💾 Save Attendance"}
            </button>
            <span className="mark-save-note">Saves attendance for {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      )}

      {/* ═══ HISTORY TAB ═══ */}
      {activeTab === "history" && (
        <div className="history-panel scale-in">
          {summaryRows.length === 0 ? (
            <div className="empty-state" style={{ minHeight: "200px" }}>
              <span className="empty-icon">📋</span>No attendance records yet
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Total Days</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="grade-student-cell">
                          <div className="grade-student-avatar">
                            {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          {s.name}
                        </div>
                      </td>
                      <td>{s.course}</td>
                      <td>{s.total}</td>
                      <td><span style={{ color: "var(--clr-success)", fontWeight: 700 }}>{s.present}</span></td>
                      <td><span style={{ color: "var(--clr-danger)",  fontWeight: 700 }}>{s.absent}</span></td>
                      <td><span style={{ color: "var(--clr-warning)", fontWeight: 700 }}>{s.late}</span></td>
                      <td>
                        {s.rate != null ? (
                          <div className="rate-cell">
                            <div className="rate-bar-wrap">
                              <div className="rate-bar" style={{ width: `${s.rate}%`,
                                background: s.rate >= 80 ? "var(--clr-success)" : s.rate >= 60 ? "var(--clr-warning)" : "var(--clr-danger)" }} />
                            </div>
                            <span className="rate-pct" style={{
                              color: s.rate >= 80 ? "var(--clr-success)" : s.rate >= 60 ? "var(--clr-warning)" : "var(--clr-danger)"
                            }}>{s.rate}%</span>
                          </div>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
