import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/Courses.css";

const EMPTY = { code: "", name: "", teacherId: "", credits: "", description: "", semester: "" };

export default function Courses() {
  const { courses, teachers, students, addCourse, updateCourse, deleteCourse, editingCourse, setEditingCourse, loading } = useAppContext();
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (editingCourse) { setForm({ ...EMPTY, ...editingCourse, teacherId: editingCourse.teacherId ?? "" }); setShowForm(true); }
    else setForm(EMPTY);
    setErrors({});
  }, [editingCourse]);

  function validate() {
    const e = {};
    if (!form.code.trim()) e.code = "Code required";
    if (!form.name.trim()) e.name = "Name required";
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
    const data = { ...form, credits: form.credits ? Number(form.credits) : 3, teacherId: form.teacherId ? Number(form.teacherId) : null };
    if (editingCourse) updateCourse(data);
    else addCourse(data);
    setForm(EMPTY);
    setShowForm(false);
  }

  function handleCancel() {
    setEditingCourse(null);
    setForm(EMPTY);
    setShowForm(false);
  }

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  function getEnrolledCount(course) {
    return students.filter(s =>
      s.course === course.code ||
      s.course === course.name ||
      s.course === course.code.replace(/\d+/g, "").trim()
    ).length;
  }

  return (
    <div className="courses-page fade-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">Courses</h1>
          <p className="section-subtitle">{courses.length} courses offered</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingCourse(null); setShowForm(true); }}>
          ➕ Add Course
        </button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="course-form scale-in" noValidate>
          <div className="form-section-title">{editingCourse ? "✏️ Edit Course" : "➕ New Course"}</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Course Code *</label>
              <input name="code" value={form.code} onChange={handleChange}
                placeholder="e.g. CS101" className={`form-input ${errors.code ? "input-error" : ""}`} />
              {errors.code && <span className="field-error">{errors.code}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Course Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Introduction to CS" className={`form-input ${errors.name ? "input-error" : ""}`} />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Teacher</label>
              <select name="teacherId" value={form.teacherId} onChange={handleChange} className="form-select">
                <option value="">Unassigned</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Credits</label>
              <input name="credits" type="number" min="1" max="6" value={form.credits} onChange={handleChange}
                placeholder="3" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <input name="semester" value={form.semester} onChange={handleChange}
                placeholder="e.g. 2024-S1" className="form-input" />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Description</label>
              <input name="description" value={form.description} onChange={handleChange}
                placeholder="Brief course description…" className="form-input" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <><span className="loading-spinner" /> Saving…</> : editingCourse ? "Update Course" : "Add Course"}
            </button>
            <button type="button" onClick={handleCancel} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <input type="text" placeholder="🔍 Search courses…" className="form-input"
        style={{ marginBottom: "1rem" }} value={search} onChange={e => setSearch(e.target.value)} />

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "180px" }}>
          <span className="empty-icon">📚</span>No courses found
        </div>
      ) : (
        <div className="courses-grid">
          {filtered.map(c => {
            const teacher = teachers.find(t => t.id === c.teacherId);
            const enrolled = getEnrolledCount(c);
            return (
              <div key={c.id} className="course-card fade-in">
                <div className="course-card-top">
                  <div className="course-code-badge">{c.code}</div>
                  <div className="course-card-actions">
                    <button className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "0.35rem 0.7rem" }}
                      onClick={() => setEditingCourse(c)} disabled={loading}>✏️</button>
                    <button className="btn btn-danger" style={{ fontSize: "0.78rem", padding: "0.35rem 0.7rem" }}
                      onClick={() => { if (window.confirm(`Delete course "${c.name}"?`)) deleteCourse(c.id); }}
                      disabled={loading}>🗑</button>
                  </div>
                </div>
                <h2 className="course-name">{c.name}</h2>
                {c.description && <p className="course-description">{c.description}</p>}
                <div className="course-meta">
                  <span className="course-meta-item">👨‍🏫 {teacher?.name || "Unassigned"}</span>
                  {c.credits && <span className="course-meta-item">⭐ {c.credits} credits</span>}
                  {c.semester && <span className="course-meta-item">📅 {c.semester}</span>}
                  <span className="course-enrolled">{enrolled} students</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
