import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/Attendance.css";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Ethiopian calendar helpers ───────────────────────────────
const ETH_MONTHS = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
];

function isGregorianLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

// Ethiopian leap years (Pagume has 6 days instead of 5) follow: year % 4 === 3
function isEthiopianLeap(ethYear) {
  return ethYear % 4 === 3;
}

function daysInEthMonth(month, ethYear) {
  if (month === 13) return isEthiopianLeap(ethYear) ? 6 : 5;
  return 30;
}

// Gregorian Date -> { year, month, day } in Ethiopian calendar
function gregorianToEthiopian(date) {
  const gYear = date.getFullYear();

  const newYearDayThisGYear = isGregorianLeap(gYear + 1) ? 12 : 11;
  const newYearDateThisGYear = new Date(gYear, 8, newYearDayThisGYear); // Sept

  let ethYear, newYearRef;
  if (date >= newYearDateThisGYear) {
    ethYear = gYear - 7;
    newYearRef = newYearDateThisGYear;
  } else {
    const newYearDayPrevGYear = isGregorianLeap(gYear) ? 12 : 11;
    newYearRef = new Date(gYear - 1, 8, newYearDayPrevGYear);
    ethYear = gYear - 8;
  }

  const diffDays = Math.floor((date - newYearRef) / 86400000);
  const month = Math.floor(diffDays / 30) + 1; // 1–13
  const day = (diffDays % 30) + 1;

  return { year: ethYear, month, day };
}

// { year, month, day } in Ethiopian calendar -> Gregorian Date
function ethiopianToGregorian(ethYear, ethMonth, ethDay) {
  const gYear = ethYear + 7;
  const newYearDay = isGregorianLeap(gYear + 1) ? 12 : 11;
  const newYearRef = new Date(gYear, 8, newYearDay); // Sept

  const offsetDays = (ethMonth - 1) * 30 + (ethDay - 1);
  const result = new Date(newYearRef);
  result.setDate(result.getDate() + offsetDays);
  return result;
}

function dateToStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatEthiopianDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const { year, month, day } = gregorianToEthiopian(d);
  return `${day} ${ETH_MONTHS[month - 1]} ${year}`;
}

function formatGregorianDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDate(dateStr, calendarType) {
  return calendarType === "ethiopian"
    ? formatEthiopianDate(dateStr)
    : formatGregorianDate(dateStr);
}
// ────────────────────────────────────────────────────────────

export default function Attendance() {
  const { students, attendance, saveAttendance, getAttendanceRate, loading } =
    useAppContext();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [records, setRecords] = useState({}); // { studentId: status }
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("mark"); // "mark" | "history"
  const [calendarType, setCalendarType] = useState("gregorian"); // "gregorian" | "ethiopian"

  // Ethiopian picker state, kept in sync with selectedDate
  const [ethDate, setEthDate] = useState(() =>
    gregorianToEthiopian(new Date()),
  );

  // Whenever the underlying selectedDate changes (from either picker), refresh ethDate
  useEffect(() => {
    const g = new Date(selectedDate + "T00:00:00");
    setEthDate(gregorianToEthiopian(g));
  }, [selectedDate]);

  // Load existing records for selected date
  useEffect(() => {
    const existing = {};
    students.forEach((s) => {
      existing[s.id] = "present";
    });
    attendance
      .filter((a) => a.date === selectedDate)
      .forEach((a) => {
        existing[a.studentId] = a.status;
      });
    setRecords(existing);
  }, [selectedDate, attendance, students]);

  function setStatus(studentId, status) {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  }

  function handleMarkAll(status) {
    const next = {};
    students.forEach((s) => {
      next[s.id] = status;
    });
    setRecords(next);
  }

  function handleSave() {
    const entries = students.map((s) => ({
      studentId: s.id,
      date: selectedDate,
      status: records[s.id] || "present",
    }));
    saveAttendance(entries);
  }

  // Called when user changes any part of the Ethiopian picker
  function updateEthDate(partial) {
    const next = { ...ethDate, ...partial };
    // clamp day if month changed to one with fewer days
    const maxDay = daysInEthMonth(next.month, next.year);
    if (next.day > maxDay) next.day = maxDay;
    setEthDate(next);
    const gDate = ethiopianToGregorian(next.year, next.month, next.day);
    setSelectedDate(dateToStr(gDate));
  }

  // Per-student attendance summary for history tab
  const summaryRows = students
    .map((s) => {
      const rate = getAttendanceRate(s.id);
      const recs = attendance.filter((a) => a.studentId === s.id);
      const present = recs.filter((a) => a.status === "present").length;
      const absent = recs.filter((a) => a.status === "absent").length;
      const late = recs.filter((a) => a.status === "late").length;
      return { ...s, rate, total: recs.length, present, absent, late };
    })
    .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));

  // Active student filter
  const activeStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterStatus === "" || records[s.id] === filterStatus),
  );

  const countPresent = students.filter(
    (s) => records[s.id] === "present",
  ).length;
  const countAbsent = students.filter((s) => records[s.id] === "absent").length;
  const countLate = students.filter((s) => records[s.id] === "late").length;

  const overallRate = attendance.length
    ? Math.round(
        (attendance.filter((a) => a.status === "present" || a.status === "late")
          .length /
          attendance.length) *
          100,
      )
    : 0;

  // Options for the Ethiopian year dropdown (current eth year ± 5)
  const currentEthYear = gregorianToEthiopian(new Date()).year;
  const ethYearOptions = [];
  for (let y = currentEthYear - 5; y <= currentEthYear + 1; y++)
    ethYearOptions.push(y);

  const ethDayCount = daysInEthMonth(ethDate.month, ethDate.year);
  const ethDayOptions = Array.from({ length: ethDayCount }, (_, i) => i + 1);

  return (
    <div className="attendance-page fade-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">Attendance</h1>
          <p className="section-subtitle">
            Track daily attendance — {attendance.length} total records
          </p>
        </div>
        <div className="overall-rate-badge">
          <span className="overall-rate-label">Overall Rate</span>
          <span className="overall-rate-value">{overallRate}%</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="att-tabs">
        <button
          className={`att-tab ${activeTab === "mark" ? "att-tab--active" : ""}`}
          onClick={() => setActiveTab("mark")}
        >
          📅 Mark Attendance
        </button>
        <button
          className={`att-tab ${activeTab === "history" ? "att-tab--active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  flexWrap: "wrap",
                }}
              >
                {/* Calendar toggle */}
                <div
                  className="att-calendar-toggle"
                  style={{
                    display: "inline-flex",
                    border: "1px solid var(--clr-border, #ddd)",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCalendarType("gregorian")}
                    style={{
                      padding: "0.35rem 0.7rem",
                      fontSize: "0.78rem",
                      border: "none",
                      cursor: "pointer",
                      background:
                        calendarType === "gregorian"
                          ? "var(--clr-primary, #2563eb)"
                          : "transparent",
                      color: calendarType === "gregorian" ? "#fff" : "inherit",
                    }}
                  >
                    Gregorian
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarType("ethiopian")}
                    style={{
                      padding: "0.35rem 0.7rem",
                      fontSize: "0.78rem",
                      border: "none",
                      cursor: "pointer",
                      background:
                        calendarType === "ethiopian"
                          ? "var(--clr-primary, #2563eb)"
                          : "transparent",
                      color: calendarType === "ethiopian" ? "#fff" : "inherit",
                    }}
                  >
                    Ethiopian
                  </button>
                </div>

                {/* Gregorian native picker */}
                {calendarType === "gregorian" && (
                  <input
                    type="date"
                    className="form-input"
                    style={{ width: "auto" }}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                )}

                {/* Ethiopian dropdown picker */}
                {calendarType === "ethiopian" && (
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <select
                      className="form-select"
                      style={{ width: "auto" }}
                      value={ethDate.day}
                      onChange={(e) =>
                        updateEthDate({ day: Number(e.target.value) })
                      }
                    >
                      {ethDayOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <select
                      className="form-select"
                      style={{ width: "auto" }}
                      value={ethDate.month}
                      onChange={(e) =>
                        updateEthDate({ month: Number(e.target.value) })
                      }
                    >
                      {ETH_MONTHS.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="form-select"
                      style={{ width: "auto" }}
                      value={ethDate.year}
                      onChange={(e) =>
                        updateEthDate({ year: Number(e.target.value) })
                      }
                    >
                      {ethYearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <span
                  className="mark-meta"
                  style={{ fontSize: "0.8rem", opacity: 0.75 }}
                >
                  {formatDate(selectedDate, calendarType)}
                </span>
              </div>
            </div>

            <div className="att-day-summary">
              <span className="att-day-chip att-day-present">
                ✅ {countPresent} Present
              </span>
              <span className="att-day-chip att-day-absent">
                ❌ {countAbsent} Absent
              </span>
              <span className="att-day-chip att-day-late">
                ⏰ {countLate} Late
              </span>
            </div>

            <div className="mark-bulk">
              <span className="form-label" style={{ margin: 0 }}>
                Mark All:
              </span>
              <button
                className="btn btn-success"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                onClick={() => handleMarkAll("present")}
              >
                ✅ Present
              </button>
              <button
                className="btn btn-danger"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                onClick={() => handleMarkAll("absent")}
              >
                ❌ Absent
              </button>
            </div>
          </div>

          <div className="mark-filters">
            <input
              type="text"
              placeholder="🔍 Search student…"
              className="form-input"
              style={{ flex: 1 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-select"
              style={{ width: "auto" }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>

          <div className="mark-list">
            {activeStudents.length === 0 && (
              <div className="empty-state" style={{ minHeight: "120px" }}>
                <span className="empty-icon">🔍</span>No students match
              </div>
            )}
            {activeStudents.map((s) => (
              <div
                key={s.id}
                className={`mark-row mark-row--${records[s.id] || "present"}`}
              >
                <div className="mark-student">
                  <div className="mark-avatar">
                    {s.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="mark-name">{s.name}</div>
                    <div className="mark-meta">
                      {s.course} · Batch {s.batch}
                    </div>
                  </div>
                </div>
                <div className="mark-buttons">
                  {["present", "absent", "late"].map((st) => (
                    <button
                      key={st}
                      className={`mark-btn mark-btn--${st} ${records[s.id] === st ? "mark-btn--active" : ""}`}
                      onClick={() => setStatus(s.id, st)}
                    >
                      {st === "present" ? "✅" : st === "absent" ? "❌" : "⏰"}{" "}
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mark-save-bar">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading || students.length === 0}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" /> Saving…
                </>
              ) : (
                "💾 Save Attendance"
              )}
            </button>
            <span className="mark-save-note">
              Saves attendance for {formatDate(selectedDate, calendarType)}
            </span>
          </div>
        </div>
      )}

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
                  {summaryRows.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="grade-student-cell">
                          <div className="grade-student-avatar">
                            {s.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          {s.name}
                        </div>
                      </td>
                      <td>{s.course}</td>
                      <td>{s.total}</td>
                      <td>
                        <span
                          style={{
                            color: "var(--clr-success)",
                            fontWeight: 700,
                          }}
                        >
                          {s.present}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            color: "var(--clr-danger)",
                            fontWeight: 700,
                          }}
                        >
                          {s.absent}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            color: "var(--clr-warning)",
                            fontWeight: 700,
                          }}
                        >
                          {s.late}
                        </span>
                      </td>
                      <td>
                        {s.rate != null ? (
                          <div className="rate-cell">
                            <div className="rate-bar-wrap">
                              <div
                                className="rate-bar"
                                style={{
                                  width: `${s.rate}%`,
                                  background:
                                    s.rate >= 80
                                      ? "var(--clr-success)"
                                      : s.rate >= 60
                                        ? "var(--clr-warning)"
                                        : "var(--clr-danger)",
                                }}
                              />
                            </div>
                            <span
                              className="rate-pct"
                              style={{
                                color:
                                  s.rate >= 80
                                    ? "var(--clr-success)"
                                    : s.rate >= 60
                                      ? "var(--clr-warning)"
                                      : "var(--clr-danger)",
                              }}
                            >
                              {s.rate}%
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
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
