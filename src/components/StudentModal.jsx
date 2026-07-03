import { useAppContext } from "../context/AppContext";
import "../styles/StudentModal.css";

export default function StudentModal({ student, onClose }) {
  const { grades, attendance, courses, calcLetterGrade, getAttendanceRate } = useAppContext();

  if (!student) return null;

  const studentGrades = grades.filter(g => g.studentId === student.id);
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const attendanceRate = getAttendanceRate(student.id);
  const initials = student.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const statusCounts = { present: 0, absent: 0, late: 0 };
  studentAttendance.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });

  return (
    <div className="modal-backdrop scale-in" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-avatar">{initials}</div>
          <div>
            <h2 className="modal-name">{student.name}</h2>
            <div className="modal-meta-row">
              <span className={`badge badge-${student.status}`}>{student.status}</span>
              {student.gpa != null && <span className="gpa-pill">GPA {student.gpa.toFixed(2)}</span>}
              <span className="modal-course">{student.course} · Batch {student.batch}</span>
            </div>
          </div>
        </div>

        {/* ── Info Grid ── */}
        <div className="modal-info-grid">
          {[
            ["Age",         student.age],
            ["Gender",      student.gender || "—"],
            ["Email",       student.email || "—"],
            ["Phone",       student.phone || "—"],
            ["Enrolled",    student.enrollmentDate || "—"],
            ["Attendance",  attendanceRate != null ? `${attendanceRate}%` : "—"],
          ].map(([label, val]) => (
            <div key={label} className="modal-info-item">
              <span className="modal-info-label">{label}</span>
              <span className="modal-info-val">{val}</span>
            </div>
          ))}
        </div>

        <div className="modal-sections">
          {/* ── Grades ── */}
          <div className="modal-section">
            <h3 className="modal-section-title">📊 Grades</h3>
            {studentGrades.length === 0 ? (
              <div className="empty-state" style={{ padding: "1rem" }}>
                <span className="empty-icon">📭</span> No grades recorded
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Semester</th>
                      <th>Score</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentGrades.map(g => {
                      const course = courses.find(c => c.id === g.courseId);
                      const { letter } = calcLetterGrade(g.score);
                      return (
                        <tr key={g.id}>
                          <td>{course ? `${course.code} — ${course.name}` : `Course #${g.courseId}`}</td>
                          <td>{g.semester}</td>
                          <td><strong>{g.score}</strong>/100</td>
                          <td><span className={`badge badge-${letter.replace("+","plus").replace("-","minus")}`}>{letter}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Attendance ── */}
          <div className="modal-section">
            <h3 className="modal-section-title">📅 Attendance Summary</h3>
            <div className="attendance-summary">
              <div className="att-pill att-present">✅ Present: {statusCounts.present}</div>
              <div className="att-pill att-absent">❌ Absent: {statusCounts.absent}</div>
              <div className="att-pill att-late">⏰ Late: {statusCounts.late}</div>
            </div>
            {studentAttendance.length > 0 && (
              <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
                <table>
                  <thead>
                    <tr><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {[...studentAttendance].reverse().slice(0, 10).map(a => (
                      <tr key={a.id}>
                        <td>{new Date(a.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td>
                          <span className={`badge badge-att-${a.status}`}>
                            {a.status === "present" ? "✅" : a.status === "absent" ? "❌" : "⏰"} {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
