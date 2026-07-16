import { useEffect, useState } from "react";

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/api/students/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        setStudent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <h2>Loading profile...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>My Profile</h1>

      <div>
        <h2>{student.name}</h2>

        <p>Email: {student.email}</p>

        <p>Course: {student.course}</p>

        <p>Batch: {student.batch}</p>

        <p>Gender: {student.gender}</p>

        <p>Phone: {student.phone}</p>

        <p>Address: {student.address}</p>
      </div>
    </div>
  );
}
