import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

function StatCard({ title, value, sub, icon, color, to }) {
  return (
    <Link to={to || "#"} className={`stat-card stat-card--${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </Link>
  );
}

function GradeBar({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="grade-bar-row">
      <span className="grade-bar-label">{label}</span>
      <div className="grade-bar-track">
        <div
          className="grade-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="grade-bar-count">{count}</span>
    </div>
  );
}

export default function Dashboard() {
  const {
    students,
    teachers,
    courses,
    grades,
    attendance,
    stats,
    calcLetterGrade,
  } = useAppContext();

  // Course distribution
  const courseDist = courses
    .map((c) => ({
      name: c.name,
      code: c.code,
      count: students.filter((s) => s.course === c.code || s.course === c.name)
        .length,
    }))
    .filter((c) => c.count > 0);

  const gradeDist = grades.reduce((acc, g) => {
    const letter = calcLetterGrade(g.score).letter[0]; // A, B, C, D, F
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {});

  const totalPresent = attendance.filter(
    (a) => a.status === "present" || a.status === "late",
  ).length;
  const attendanceRate = attendance.length
    ? Math.round((totalPresent / attendance.length) * 100)
    : 0;

  // Recent activity (last 5 students)
  const recentStudents = [...students].reverse().slice(0, 5);

  const gradeColors = {
    A: "#22c55e",
    B: "#38bdf8",
    C: "#f59e0b",
    D: "#fb923c",
    F: "#ef4444",
  };

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="dashboard-date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          sub={`${stats.activeStudents} active`}
          icon="🎓"
          color="purple"
          to="/students"
        />
        <StatCard
          title="Teachers"
          value={stats.totalTeachers}
          sub="Faculty members"
          icon="👨‍🏫"
          color="blue"
          to="/teachers"
        />
        <StatCard
          title="Courses"
          value={stats.totalCourses}
          sub="Active courses"
          icon="📚"
          color="teal"
          to="/courses"
        />
        <StatCard
          title="Avg GPA"
          value={stats.avgGpa || "—"}
          sub="Across all students"
          icon="📊"
          color="green"
          to="/grades"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          sub={`${attendance.length} records`}
          icon="📅"
          color="orange"
          to="/attendance"
        />
        <StatCard
          title="Graduated"
          value={stats.graduatedStudents}
          sub="Alumni"
          icon="🏆"
          color="gold"
          to="/students"
        />
      </div>

      <div className="dashboard-grid">
        {/* ── Top Students ── */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🏆 Top Students</h2>
            <Link to="/students" className="card-link">
              View all
            </Link>
          </div>
          <div className="top-students-list">
            {stats.topStudents.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📭</span>No grades yet
              </div>
            )}
            {stats.topStudents.map((s, i) => (
              <div key={s.id} className="top-student-row">
                <span
                  className={`rank rank--${i < 3 ? ["gold", "silver", "bronze"][i] : "plain"}`}
                >
                  #{i + 1}
                </span>
                <div className="top-student-info">
                  <div className="top-student-name">{s.name}</div>
                  <div className="top-student-meta">
                    {s.course} · Batch {s.batch}
                  </div>
                </div>
                <span className="gpa-badge">{s.gpa?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Grade Distribution ── */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Grade Distribution</h2>
            <Link to="/grades" className="card-link">
              View all
            </Link>
          </div>
          {grades.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>No grades recorded
            </div>
          ) : (
            <div className="grade-bars">
              {["A", "B", "C", "D", "F"].map((l) => (
                <GradeBar
                  key={l}
                  label={l}
                  count={gradeDist[l] || 0}
                  total={grades.length}
                  color={gradeColors[l]}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Course Enrollment ── */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📚 Course Enrollment</h2>
            <Link to="/courses" className="card-link">
              Manage
            </Link>
          </div>
          {courses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>No courses
            </div>
          ) : (
            <div className="course-dist-list">
              {courses.map((c) => {
                const count = students.filter(
                  (s) =>
                    s.course === c.code ||
                    s.course === c.name ||
                    s.course === c.code.replace(/\d+/g, "").trim(),
                ).length;
                const teacher = teachers.find((t) => t.id === c.teacherId);
                return (
                  <div key={c.id} className="course-dist-row">
                    <div>
                      <div className="course-dist-name">
                        {c.code} — {c.name}
                      </div>
                      <div className="course-dist-teacher">
                        {teacher?.name || "Unassigned"}
                      </div>
                    </div>
                    <span className="course-dist-count">{count} students</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Recent Students ── */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🎓 Recent Students</h2>
            <Link to="/students" className="card-link">
              View all
            </Link>
          </div>
          <div className="recent-list">
            {recentStudents.map((s) => (
              <div key={s.id} className="recent-row">
                <div className="recent-avatar">{s.name[0]}</div>
                <div className="recent-info">
                  <div className="recent-name">{s.name}</div>
                  <div className="recent-meta">
                    {s.course} · Batch {s.batch}
                  </div>
                </div>
                <span className={`badge badge-${s.status}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
