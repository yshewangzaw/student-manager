import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
const API_URL = "http://localhost:3000/api/students";
const AppContext = createContext();

// ─── helpers ───────────────────────────────────────────────────────────────
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const setValue = (value) => {
    const val = typeof value === "function" ? value(storedValue) : value;
    setStoredValue(val);
    window.localStorage.setItem(key, JSON.stringify(val));
  };
  return [storedValue, setValue];
}

function calcLetterGrade(score) {
  if (score >= 90) return { letter: "A+", points: 4.0 };
  if (score >= 85) return { letter: "A", points: 4.0 };
  if (score >= 80) return { letter: "A-", points: 3.7 };
  if (score >= 75) return { letter: "B+", points: 3.3 };
  if (score >= 70) return { letter: "B", points: 3.0 };
  if (score >= 65) return { letter: "B-", points: 2.7 };
  if (score >= 60) return { letter: "C+", points: 2.3 };
  if (score >= 55) return { letter: "C", points: 2.0 };
  if (score >= 50) return { letter: "D", points: 1.0 };
  return { letter: "F", points: 0.0 };
}

// ─── seed data ─────────────────────────────────────────────────────────────
const SEED_COURSES = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    teacherId: 1,
    credits: 3,
    description: "Fundamentals of programming and computation",
    semester: "2024-S1",
  },
  {
    id: 2,
    code: "MATH201",
    name: "Calculus II",
    teacherId: 2,
    credits: 4,
    description: "Integrals, series and differential equations",
    semester: "2024-S1",
  },
  {
    id: 3,
    code: "ENG102",
    name: "English Composition",
    teacherId: 3,
    credits: 2,
    description: "Academic writing and communication",
    semester: "2024-S1",
  },
  {
    id: 4,
    code: "CS301",
    name: "Data Structures & Algorithms",
    teacherId: 1,
    credits: 4,
    description: "Core algorithms and data structures",
    semester: "2024-S2",
  },
];

const SEED_TEACHERS = [
  {
    id: 1,
    name: "Dr. Alan Smith",
    subject: "Computer Science",
    email: "asmith@school.edu",
    phone: "+1-555-0101",
    experience: 12,
    qualification: "PhD in CS",
  },
  {
    id: 2,
    name: "Prof. Maria Santos",
    subject: "Mathematics",
    email: "msantos@school.edu",
    phone: "+1-555-0102",
    experience: 8,
    qualification: "MSc Mathematics",
  },
  {
    id: 3,
    name: "Mrs. Linda Johnson",
    subject: "English",
    email: "ljohnson@school.edu",
    phone: "+1-555-0103",
    experience: 6,
    qualification: "MA English Literature",
  },
];

const SEED_STUDENTS = [
  {
    id: 1,
    name: "Alice Chen",
    age: 20,
    course: "CS",
    batch: "2023",
    email: "alice@student.edu",
    phone: "+1-555-1001",
    gender: "Female",
    status: "active",
    enrollmentDate: "2023-09-01",
    gpa: 3.8,
  },
  {
    id: 2,
    name: "Bob Martinez",
    age: 22,
    course: "Math",
    batch: "2022",
    email: "bob@student.edu",
    phone: "+1-555-1002",
    gender: "Male",
    status: "active",
    enrollmentDate: "2022-09-01",
    gpa: 3.2,
  },
  {
    id: 3,
    name: "Carol White",
    age: 21,
    course: "CS",
    batch: "2023",
    email: "carol@student.edu",
    phone: "+1-555-1003",
    gender: "Female",
    status: "active",
    enrollmentDate: "2023-09-01",
    gpa: 3.5,
  },
  {
    id: 4,
    name: "David Brown",
    age: 23,
    course: "Eng",
    batch: "2021",
    email: "david@student.edu",
    phone: "+1-555-1004",
    gender: "Male",
    status: "graduated",
    enrollmentDate: "2021-09-01",
    gpa: 3.1,
  },
  {
    id: 5,
    name: "Eva Kim",
    age: 20,
    course: "CS",
    batch: "2024",
    email: "eva@student.edu",
    phone: "+1-555-1005",
    gender: "Female",
    status: "active",
    enrollmentDate: "2024-01-15",
    gpa: 3.9,
  },
  {
    id: 6,
    name: "Frank Lee",
    age: 21,
    course: "Math",
    batch: "2023",
    email: "frank@student.edu",
    phone: "+1-555-1006",
    gender: "Male",
    status: "inactive",
    enrollmentDate: "2023-09-01",
    gpa: 2.7,
  },
];

const SEED_GRADES = [
  { id: 1, studentId: 1, courseId: 1, score: 92, semester: "2024-S1" },
  { id: 2, studentId: 1, courseId: 3, score: 88, semester: "2024-S1" },
  { id: 3, studentId: 2, courseId: 2, score: 75, semester: "2024-S1" },
  { id: 4, studentId: 3, courseId: 1, score: 85, semester: "2024-S1" },
  { id: 5, studentId: 3, courseId: 4, score: 90, semester: "2024-S2" },
  { id: 6, studentId: 5, courseId: 1, score: 95, semester: "2024-S1" },
  { id: 7, studentId: 5, courseId: 4, score: 93, semester: "2024-S2" },
  { id: 8, studentId: 6, courseId: 2, score: 62, semester: "2024-S1" },
];

const today = new Date();
function dateOffset(days) {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const SEED_ATTENDANCE = [
  { id: 1, studentId: 1, date: dateOffset(0), status: "present" },
  { id: 2, studentId: 2, date: dateOffset(0), status: "present" },
  { id: 3, studentId: 3, date: dateOffset(0), status: "absent" },
  { id: 4, studentId: 5, date: dateOffset(0), status: "present" },
  { id: 5, studentId: 6, date: dateOffset(0), status: "late" },
  { id: 6, studentId: 1, date: dateOffset(1), status: "present" },
  { id: 7, studentId: 2, date: dateOffset(1), status: "absent" },
  { id: 8, studentId: 3, date: dateOffset(1), status: "present" },
  { id: 9, studentId: 5, date: dateOffset(1), status: "present" },
  { id: 10, studentId: 6, date: dateOffset(1), status: "absent" },
];

// ─── provider ──────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [students, setStudents] = useLocalStorage("sm_students", SEED_STUDENTS);
  const [teachers, setTeachers] = useLocalStorage("sm_teachers", SEED_TEACHERS);
  const [courses, setCourses] = useLocalStorage("sm_courses", SEED_COURSES);
  const [grades, setGrades] = useLocalStorage("sm_grades", SEED_GRADES);
  const [attendance, setAttendance] = useLocalStorage(
    "sm_attendance",
    SEED_ATTENDANCE,
  );

  const [editingStudent, setEditingStudent] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  // ── toast helpers ──────────────────────────────────────────────────────
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── GPA recalculation ─────────────────────────────────────────────────
  function recalcGpa(studentId, updatedGrades) {
    const sg = updatedGrades.filter((g) => g.studentId === studentId);
    if (!sg.length) return null;
    const avg =
      sg.reduce((sum, g) => sum + calcLetterGrade(g.score).points, 0) /
      sg.length;
    return Math.round(avg * 100) / 100;
  }

  // ── students ──────────────────────────────────────────────────────────
  function addStudent(data) {
    setLoading(true);
    setTimeout(() => {
      setStudents((prev) => [...prev, { ...data, id: Date.now(), gpa: null }]);
      setLoading(false);
      addToast(`${data.name} added successfully`);
    }, 600);
  }

  function updateStudent(data) {
    setLoading(true);
    setTimeout(() => {
      setStudents((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      setEditingStudent(null);
      setLoading(false);
      addToast(`${data.name} updated successfully`);
    }, 600);
  }

  function deleteStudent(id) {
    setLoading(true);
    setTimeout(() => {
      const student = students.find((s) => s.id === id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setGrades((prev) => prev.filter((g) => g.studentId !== id));
      setAttendance((prev) => prev.filter((a) => a.studentId !== id));
      setLoading(false);
      addToast(`${student?.name || "Student"} deleted`, "error");
    }, 600);
  }

  // ── teachers ──────────────────────────────────────────────────────────
  function addTeacher(data) {
    setLoading(true);
    setTimeout(() => {
      setTeachers((prev) => [...prev, { ...data, id: Date.now() }]);
      setLoading(false);
      addToast(`${data.name} added successfully`);
    }, 600);
  }

  function updateTeacher(data) {
    setLoading(true);
    setTimeout(() => {
      setTeachers((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      setEditingTeacher(null);
      setLoading(false);
      addToast(`${data.name} updated successfully`);
    }, 600);
  }

  function deleteTeacher(id) {
    setLoading(true);
    setTimeout(() => {
      const teacher = teachers.find((t) => t.id === id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setLoading(false);
      addToast(`${teacher?.name || "Teacher"} deleted`, "error");
    }, 600);
  }

  // ── courses ───────────────────────────────────────────────────────────
  function addCourse(data) {
    setLoading(true);
    setTimeout(() => {
      setCourses((prev) => [...prev, { ...data, id: Date.now() }]);
      setLoading(false);
      addToast(`Course "${data.name}" added`);
    }, 600);
  }

  function updateCourse(data) {
    setLoading(true);
    setTimeout(() => {
      setCourses((prev) => prev.map((c) => (c.id === data.id ? data : c)));
      setEditingCourse(null);
      setLoading(false);
      addToast(`Course "${data.name}" updated`);
    }, 600);
  }

  function deleteCourse(id) {
    setLoading(true);
    setTimeout(() => {
      const course = courses.find((c) => c.id === id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setLoading(false);
      addToast(`Course "${course?.name || ""}" deleted`, "error");
    }, 600);
  }

  // ── grades ────────────────────────────────────────────────────────────
  function addGrade(data) {
    setLoading(true);
    setTimeout(() => {
      const newGrade = { ...data, id: Date.now(), score: Number(data.score) };
      const newGrades = [...grades, newGrade];
      setGrades(newGrades);
      const newGpa = recalcGpa(data.studentId, newGrades);
      if (newGpa !== null) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === data.studentId ? { ...s, gpa: newGpa } : s,
          ),
        );
      }
      setLoading(false);
      addToast("Grade recorded successfully");
    }, 600);
  }

  function updateGrade(data) {
    setLoading(true);
    setTimeout(() => {
      const updated = { ...data, score: Number(data.score) };
      const newGrades = grades.map((g) => (g.id === updated.id ? updated : g));
      setGrades(newGrades);
      const newGpa = recalcGpa(data.studentId, newGrades);
      if (newGpa !== null) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === data.studentId ? { ...s, gpa: newGpa } : s,
          ),
        );
      }
      setLoading(false);
      addToast("Grade updated");
    }, 600);
  }

  function deleteGrade(id) {
    setLoading(true);
    setTimeout(() => {
      const grade = grades.find((g) => g.id === id);
      const newGrades = grades.filter((g) => g.id !== id);
      setGrades(newGrades);
      if (grade) {
        const newGpa = recalcGpa(grade.studentId, newGrades);
        setStudents((prev) =>
          prev.map((s) =>
            s.id === grade.studentId ? { ...s, gpa: newGpa ?? s.gpa } : s,
          ),
        );
      }
      setLoading(false);
      addToast("Grade removed", "error");
    }, 600);
  }

  // ── attendance ────────────────────────────────────────────────────────
  function saveAttendance(records) {
    // records: [{ studentId, date, status }]
    setLoading(true);
    setTimeout(() => {
      setAttendance((prev) => {
        const base = prev.filter((a) => a.date !== records[0]?.date);
        const next = records.map((r, i) => ({ ...r, id: Date.now() + i }));
        return [...base, ...next];
      });
      setLoading(false);
      addToast("Attendance saved successfully");
    }, 600);
  }

  function getAttendanceRate(studentId) {
    const records = attendance.filter((a) => a.studentId === studentId);
    if (!records.length) return null;
    const present = records.filter(
      (a) => a.status === "present" || a.status === "late",
    ).length;
    return Math.round((present / records.length) * 100);
  }

  // ── derived stats ──────────────────────────────────────────────────────
  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === "active").length,
    graduatedStudents: students.filter((s) => s.status === "graduated").length,
    totalTeachers: teachers.length,
    totalCourses: courses.length,
    avgGpa: students.length
      ? Math.round(
          (students.reduce((sum, s) => sum + (s.gpa || 0), 0) /
            students.length) *
            100,
        ) / 100
      : 0,
    topStudents: [...students]
      .filter((s) => s.gpa)
      .sort((a, b) => b.gpa - a.gpa)
      .slice(0, 5),
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        toasts,
        addToast,
        removeToast,
        // students
        students,
        editingStudent,
        setEditingStudent,
        addStudent,
        updateStudent,
        deleteStudent,
        // teachers
        teachers,
        editingTeacher,
        setEditingTeacher,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        // courses
        courses,
        editingCourse,
        setEditingCourse,
        addCourse,
        updateCourse,
        deleteCourse,
        // grades
        grades,
        addGrade,
        updateGrade,
        deleteGrade,
        // attendance
        attendance,
        saveAttendance,
        getAttendanceRate,
        // helpers
        calcLetterGrade,
        // stats
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppProvider");
  return context;
}
