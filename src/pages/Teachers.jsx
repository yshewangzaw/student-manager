import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/Teachers.css";

const EMPTY = { name: "", subject: "", email: "", phone: "", experience: "", qualification: "" };

export default function Teachers() {
  const { teachers, addTeacher, deleteTeacher, editingTeacher, setEditingTeacher, updateTeacher, loading, courses } = useAppContext();
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [search, setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (editingTeacher) { setForm({ ...EMPTY, ...editingTeacher }); setShowForm(true); }
    else                { setForm(EMPTY); }
    setErrors({});
  }, [editingTeacher]);

  function validate() {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
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
    const data = { ...form, experience: form.experience ? Number(form.experience) : "" };
    if (editingTeacher) updateTeacher(data);
    else                addTeacher(data);
    setForm(EMPTY);
    setShowForm(false);
  }

  function handleCancel() {
    setEditingTeacher(null);
    setForm(EMPTY);
    setShowForm(false);
  }

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  function getTeacherCourses(teacherId) {
    return courses.filter(c => c.teacherId === teacherId);
  }

  return (
    <div className="teachers-page fade-in">
      <div className="section-header">
        <div>
          <h1 className="section-title">Teachers</h1>
          <p className="section-subtitle">{teachers.length} faculty members</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingTeacher(null); setShowForm(true); }}>
          ➕ Add Teacher
        </button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="teacher-form scale-in" noValidate>
          <div className="form-section-title">{editingTeacher ? "✏️ Edit Teacher" : "➕ Add New Teacher"}</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Dr. John Smith" className={`form-input ${errors.name ? "input-error" : ""}`} />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Subject / Dept. *</label>
              <input name="subject" value={form.subject} onChange={handleChange}
                placeholder="Computer Science" className={`form-input ${errors.subject ? "input-error" : ""}`} />
              {errors.subject && <span className="field-error">{errors.subject}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="teacher@school.edu" className={`form-input ${errors.email ? "input-error" : ""}`} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+1-555-0000" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input name="experience" type="number" min="0" value={form.experience} onChange={handleChange}
                placeholder="e.g. 8" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input name="qualification" value={form.qualification} onChange={handleChange}
                placeholder="PhD in Computer Science" className="form-input" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <><span className="loading-spinner" /> Saving…</> : editingTeacher ? "Update Teacher" : "Add Teacher"}
            </button>
            <button type="button" onClick={handleCancel} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* ── Search ── */}
      <input type="text" placeholder="🔍 Search teachers…" className="form-input"
        style={{ marginBottom: "1rem" }} value={search} onChange={e => setSearch(e.target.value)} />

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "180px" }}>
          <span className="empty-icon">👨‍🏫</span>No teachers found
        </div>
      ) : (
        <div className="teachers-grid">
          {filtered.map(t => {
            const tc = getTeacherCourses(t.id);
            return (
              <div key={t.id} className="teacher-card fade-in">
                <div className="teacher-card-top">
                  <div className="teacher-avatar">{t.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                  <div className="teacher-card-actions">
                    <button className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "0.35rem 0.7rem" }}
                      onClick={() => setEditingTeacher(t)} disabled={loading}>✏️</button>
                    <button className="btn btn-danger" style={{ fontSize: "0.78rem", padding: "0.35rem 0.7rem" }}
                      onClick={() => { if (window.confirm(`Delete ${t.name}?`)) deleteTeacher(t.id); }}
                      disabled={loading}>🗑</button>
                  </div>
                </div>
                <h2 className="teacher-name">{t.name}</h2>
                <p className="teacher-subject">{t.subject}</p>
                <div className="teacher-details">
                  {t.email && <div className="teacher-detail">📧 {t.email}</div>}
                  {t.phone && <div className="teacher-detail">📞 {t.phone}</div>}
                  {t.experience && <div className="teacher-detail">🎓 {t.experience} yrs experience</div>}
                  {t.qualification && <div className="teacher-detail">🏅 {t.qualification}</div>}
                </div>
                {tc.length > 0 && (
                  <div className="teacher-courses">
                    <div className="teacher-courses-label">Courses</div>
                    <div className="teacher-courses-list">
                      {tc.map(c => (
                        <span key={c.id} className="course-chip">{c.code}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
