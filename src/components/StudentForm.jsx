import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import "../styles/StudentForm.css";

const EMPTY = { name: "", age: "", course: "", batch: "", email: "", phone: "", gender: "", status: "active", enrollmentDate: "" };

export default function StudentForm({ onClose }) {
  const { addStudent, updateStudent, editingStudent, setEditingStudent, loading } = useAppContext();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(editingStudent ? { ...EMPTY, ...editingStudent } : EMPTY);
    setErrors({});
  }, [editingStudent]);

  function validate() {
    const e = {};
    if (!form.name.trim())           e.name  = "Name is required";
    if (!form.age || form.age < 1)   e.age   = "Valid age required";
    if (!form.course.trim())         e.course = "Course is required";
    if (!form.batch.trim())          e.batch  = "Batch is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email";
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
    if (editingStudent) updateStudent({ ...form, age: Number(form.age) });
    else                addStudent({ ...form, age: Number(form.age) });
    setForm(EMPTY);
    if (onClose) onClose();
  }

  function handleCancel() {
    setEditingStudent(null);
    setForm(EMPTY);
    if (onClose) onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="student-form scale-in" noValidate>
      <div className="form-section-title">
        {editingStudent ? "✏️ Edit Student" : "➕ Add New Student"}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange}
            placeholder="e.g. John Doe" className={`form-input ${errors.name ? "input-error" : ""}`} />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Age *</label>
          <input name="age" type="number" min="1" max="100" value={form.age} onChange={handleChange}
            placeholder="e.g. 20" className={`form-input ${errors.age ? "input-error" : ""}`} />
          {errors.age && <span className="field-error">{errors.age}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Course *</label>
          <input name="course" value={form.course} onChange={handleChange}
            placeholder="e.g. CS, Math, Engineering" className={`form-input ${errors.course ? "input-error" : ""}`} />
          {errors.course && <span className="field-error">{errors.course}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Batch / Year *</label>
          <input name="batch" value={form.batch} onChange={handleChange}
            placeholder="e.g. 2024" className={`form-input ${errors.batch ? "input-error" : ""}`} />
          {errors.batch && <span className="field-error">{errors.batch}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="student@email.com" className={`form-input ${errors.email ? "input-error" : ""}`} />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange}
            placeholder="+1-555-0000" className="form-input" />
        </div>

        <div className="form-group">
          <label className="form-label">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="form-select">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Enrollment Date</label>
          <input name="enrollmentDate" type="date" value={form.enrollmentDate} onChange={handleChange} className="form-input" />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? <><span className="loading-spinner" /> Saving…</> : editingStudent ? "Update Student" : "Add Student"}
        </button>
        {editingStudent && (
          <button type="button" onClick={handleCancel} disabled={loading} className="btn btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
