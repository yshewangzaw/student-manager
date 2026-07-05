import { useState } from "react";
import StudentForm from "../components/StudentForm";
import StudentCard from "../components/StudentCard";
import StudentModal from "../components/StudentModal";
import { useAppContext } from "../context/AppContext";
import "../styles/Students.css";

export default function Students() {
  const { students, editingStudent, setEditingStudent, stats } =
    useAppContext();
  const [search, setSearch] = useState("");
  const [filterCourse, setCourse] = useState("");
  const [filterStatus, setStatus] = useState("");
  const [filterGender, setGender] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showForm, setShowForm] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  const courses = [...new Set(students.map((s) => s.course))]
    .filter(Boolean)
    .sort();

  let filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase());
    const matchCourse = !filterCourse || s.course === filterCourse;
    const matchStatus = !filterStatus || s.status === filterStatus;
    const matchGender = !filterGender || s.gender === filterGender;
    return matchSearch && matchCourse && matchStatus && matchGender;
  });

  filtered.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "gpa") return (b.gpa || 0) - (a.gpa || 0);
    if (sortBy === "batch") return b.batch.localeCompare(a.batch);
    if (sortBy === "age") return a.age - b.age;
    return 0;
  });

  function handleOpenAdd() {
    setEditingStudent(null);
    setShowForm(true);
  }

  return (
    <div className="students-page fade-in">
      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Students</h1>
          <p className="section-subtitle">
            {stats.totalStudents} students · {stats.activeStudents} active
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          ➕ Add Student
        </button>
      </div>

      {/* ── Form ── */}
      {(showForm || editingStudent) && (
        <StudentForm
          onClose={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
          onclick={() => {
            console.log("Student added/updated");
          }}
        />
      )}

      {/* ── Filters ── */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="🔍 Search by name, email, course…"
          className="form-input search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select filter-select"
          value={filterCourse}
          onChange={(e) => setCourse(e.target.value)}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="form-select filter-select"
          value={filterStatus}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
        <select
          className="form-select filter-select"
          value={filterGender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <select
          className="form-select filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort: Name</option>
          <option value="gpa">Sort: GPA ↓</option>
          <option value="batch">Sort: Batch</option>
          <option value="age">Sort: Age</option>
        </select>
      </div>

      {/* ── Results count ── */}
      <div className="results-count">
        Showing {filtered.length} of {students.length} students
      </div>

      {/* ── Cards ── */}
      {filtered.length === 0 ? (
        <div className="empty-state" style={{ minHeight: "200px" }}>
          <span className="empty-icon">🎓</span>
          <span>No students match your filters</span>
        </div>
      ) : (
        <div className="students-grid">
          {filtered.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onViewDetail={setViewStudent}
              phone={"08877777777"}
            />
          ))}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {viewStudent && (
        <StudentModal
          student={viewStudent}
          onClose={() => setViewStudent(null)}
        />
      )}
    </div>
  );
}
