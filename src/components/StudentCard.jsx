import { useAppContext } from "../context/AppContext";
import "../styles/StudentCard.css";

const STATUS_LABEL = {
  active: "Active",
  inactive: "Inactive",
  graduated: "Graduated",
};

export default function StudentCard({ student, onViewDetail, phone, email }) {
  const { deleteStudent, setEditingStudent, loading } = useAppContext();

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="student-card fade-in"
      onClick={() => onViewDetail && onViewDetail(student)}
    >
      <div className="student-card-top">
        <div className="student-avatar">{initials}</div>
        <div className="student-card-badges">
          <span className={`badge badge-${student.status}`}>
            {STATUS_LABEL[student.status] || student.status}
          </span>
          {student.gpa != null && (
            <span className="gpa-pill">GPA {student.gpa.toFixed(2)}</span>
          )}
        </div>
      </div>

      <h2 className="student-name">{student.name}</h2>
      <div className="student-meta-grid">
        <div className="student-meta-item">
          <span className="meta-label">Course</span>
          <span>{student.course}</span>
        </div>
        <div className="student-meta-item">
          <span className="meta-label">Batch</span>
          <span>{student.batch}</span>
        </div>
        <div className="student-meta-item">
          <span className="meta-label">Age</span>
          <span>{student.age}</span>
        </div>
        <div className="student-meta-item">
          <span className="meta-label">Age</span>
          <span>{phone}</span>
        </div>

        {student.gender && (
          <div className="student-meta-item">
            <span className="meta-label">Gender</span>
            <span>{student.gender}</span>
          </div>
        )}
        {student.email && (
          <div className="student-meta-item" style={{ gridColumn: "1 / -1" }}>
            <span className="meta-label">Email</span>
            <span className="student-email">{student.email}</span>
          </div>
        )}
      </div>

      <div
        className="student-card-actions"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn btn-primary"
          onClick={() => setEditingStudent(student)}
          disabled={loading}
        >
          ✏️ Edi
        </button>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (window.confirm(`Delete ${student.name}?`))
              deleteStudent(student.id);
          }}
          disabled={loading}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}
