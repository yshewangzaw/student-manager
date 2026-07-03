import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/Grades.css";

const EMPTY_GRADE = { studentId: "", courseId: "", score: "", semester: "" };

export default function Grades() {
  const { grades, students, courses, addGrade, updateGrade, deleteGrade, calcLetterGrade, loading } = useAppContext();

  const [form, setForm]         = useState(EMPTY_GRADE);
  const [editId, setEditId]     = useState(null);
  const [errors, setErrors]     = useState({});
  const [showForm, setShowForm] = useState(false);
  const [filterStudent, setFilterStudent] = useState("");
  const [filterCourse,  setFilterCourse]  = useState("");

  function validate() {
    const e = {};
    if (!form.studentId) e.studentId = "Select a student";
    if (!form.courseId)  e.courseId  = "Select a course";
    if (!form.score && form.score !== 0) e.score = "Score is required";
    if (Number(form.score) < 0 || Number(form.score) > 100) e.score = "Score must be 0–100";
    if (!form.semester.trim()) e.semester = "Semester is required";
    return e;
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    const data = { ...form, studentId: Number(form.studentId), courseId: Number(form.courseId), score: Number(form.score) };
    if (editId) { updateGrade({ ...data, id: editId }); setEditId(null); }
    else        { addGrade(data); }
    setForm(EMPTY_GRADE);
    setShowForm(false);
  }

  function handleEdit(g) {
    setForm({ studentId: String(g.studentId), courseId: String(g.courseId), score: String(g.score), semester: g.semester });
    setEditId(g.id);
    setShowForm(true);
    setErrors({});
  }

  function handleCancel() {
    setForm(EMPTY_GRADE);
    setEditId(null);
    setShowForm(false);
    setErrors({});
  }

  // Filter grades
  const filtered = grades.filter(g => {
    const matchStudent = !filterStudent || g.studentId === Number(filterStudent);
    const matchCourse  = !filterCourse  || g.courseId  === Number(filterCourse);
    return matchStudent && matchCourse;
  });

  // Sort: most recent first
  const sorted = [...filtered].reverse();

  // Per-student GPA summary
  const studentSummary = students
    .map(s => {
      const sg = grades.filter(g => g.studentId === s.id);
      if (!sg.length) return null;
      const avg = sg.reduce((sum, g) => sum + calcLetterGrade(g.score).points, 0) / sg.length;
      return { ...s, count: sg.length, gpaCalc: Math.round(avg * 100) / 100 };
    })
    .filter(Boolean)
    .sort((a, b) => b.gpaCalc - a.gpaCalc);

  return (
    <div className="grades-page fade-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">Grades</h1>
          <p className="section-subtitle">{grades.length} grade records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setForm(EMPTY_GRADE); setShowForm(true); }}>
          ➕ Record Grade
        </button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="grade-form scale-in" noValidate>
          <div className="form-section-title">{editId ? "✏️ Edit Grade" : "➕ Record Grade"}</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Student *</label>
              <select name="studentId" value={form.studentId} onChange={handleChange}
                className={`form-select ${errors.studentId ? "input-error" : ""}`}>
                <option value="">Select student…</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.course})</option>)}
              </select>
              {errors.studentId && <span className="field-error">{errors.studentId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Course *</label>
              <select name="courseId" value={form.courseId} onChange={handleChange}
                className={`form-select ${errors.courseId ? "input-error" : ""}`}>
                <option value="">Select course…</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
              {errors.courseId && <span className="field-error">{errors.courseId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Score (0–100) *</label>
              <input name="score" type="number" min="0" max="100" value={form.score} onChange={handleChange}
                placeholder="e.g. 87" className={`form-input ${errors.score ? "input-error" : ""}`} />
              {errors.score && <span className="field-error">{errors.score}</span>}
              {form.score !== "" && !errors.score && (
                <span className="score-preview">
                  → {calcLetterGrade(Number(form.score)).letter} ({calcLetterGrade(Number(form.score)).points.toFixed(1)} GPA pts)
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Semester *</label>
              <input name="semester" value={form.semester} onChange={handleChange}
                placeholder="e.g. 2024-S1" className={`form-input ${errors.semester ? "input-error" : ""}`} />
              {errors.semester && <span className="field-error">{errors.semester}</span>}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <><span className="loading-spinner" /> Saving…</> : editId ? "Update Grade" : "Record Grade"}
            </button>
            <button type="button" onClick={handleCancel} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="grades-layout">
        {/* ── Left: Grades Table ── */}
        <div className="grades-main">
          {/* Filters */}
          <div className="grades-filters">
            <select className="form-select" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
              <option value="">All Students</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="form-select" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
            <span className="results-count" style={{ alignSelf: "center" }}>{sorted.length} records</span>
          </div>

          {sorted.length === 0 ? (
            <div className="empty-state" style={{ minHeight: "180px" }}>
              <span className="empty-icon">📊</span>No grade records found
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>GPA Pts</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(g => {
                    const student = students.find(s => s.id === g.studentId);
                    const course  = courses.find(c => c.id === g.courseId);
                    const { letter, points } = calcLetterGrade(g.score);
                    const badgeKey = letter.replace("+", "plus").replace("-", "minus");
                    return (
                      <tr key={g.id}>
                        <td>
                          <div className="grade-student-cell">
                            <div className="grade-student-avatar">
                              {student?.name.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                            </div>
                            <span>{student?.name || `#${g.studentId}`}</span>
                          </div>
                        </td>
                        <td>
                          <span className="course-chip">{course?.code || `#${g.courseId}`}</span>
                          <div className="grade-course-name">{course?.name}</div>
                        </td>
                        <td><span className="semester-tag">{g.semester}</span></td>
                        <td>
                          <div className="score-bar-wrap">
                            <span className="score-value">{g.score}</span>
                            <div className="score-bar">
                              <div className="score-fill" style={{
                                width: `${g.score}%`,
                                background: g.score >= 80 ? "var(--clr-success)" : g.score >= 60 ? "var(--clr-warning)" : "var(--clr-danger)"
                              }} />
                            </div>
                          </div>
                        </td>
                        <td><span className={`badge badge-${badgeKey}`}>{letter}</span></td>
                        <td><span className="gpa-pts">{points.toFixed(1)}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button className="btn btn-ghost" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                              onClick={() => handleEdit(g)} disabled={loading}>✏️</button>
                            <button className="btn btn-danger" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                              onClick={() => { if (window.confirm("Delete this grade?")) deleteGrade(g.id); }}
                              disabled={loading}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Right: GPA Leaderboard ── */}
        <div className="grades-sidebar">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🏆 GPA Leaderboard</h2>
            </div>
            {studentSummary.length === 0 ? (
              <div className="empty-state" style={{ padding: "1rem" }}>
                <span className="empty-icon">📭</span>No data yet
              </div>
            ) : (
              <div className="leaderboard">
                {studentSummary.map((s, i) => (
                  <div key={s.id} className="leaderboard-row">
                    <span className={`rank rank--${i < 3 ? ["gold", "silver", "bronze"][i] : "plain"}`}>#{i + 1}</span>
                    <div className="leaderboard-info">
                      <div className="leaderboard-name">{s.name}</div>
                      <div className="leaderboard-meta">{s.count} courses</div>
                    </div>
                    <span className="gpa-badge">{s.gpaCalc.toFixed(2)}</span>
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
