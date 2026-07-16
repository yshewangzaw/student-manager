import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/api/students/profile", {
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

    getProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 text-red-600 rounded-lg">{error}</div>
    );
  }

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex justify-center items-start p-6">
      <div
        className="
      w-full
      max-w-4xl
      mt-6
    "
      >
        {/* Header */}
        <div className="mb-6">
          <h1
            className="
          text-3xl 
          font-bold 
          text-gray-800
        "
          >
            Student Dashboard
          </h1>

          <p className="text-gray-500 mt-2">View your academic information</p>
        </div>

        {/* Student Card */}
        <div
          className="
  bg-white
  rounded-xl
  shadow-md
  p-8
  border
  border-gray-100
"
        >
          {/* Avatar */}
          <div
            className="
flex 
items-center 
gap-5 
mb-8
px-2
"
          >
            <div
              className="
            w-20
            h-20
            rounded-full
            bg-blue-600
            flex
            items-center
            justify-center
            text-white
            text-2xl
            font-bold
          "
            >
              {student.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <h2
                className="
              text-2xl
              font-bold
              text-gray-800
            "
              >
                {student.name}
              </h2>

              <span
                className="
              inline-block
              mt-2
              px-3
              py-1
              rounded-full
              bg-green-100
              text-green-700
              text-sm
            "
              >
                {student.status}
              </span>
            </div>
          </div>

          {/* Details */}
          <div
            className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-5
          px-1
        "
          >
            {[
              ["Email", student.email],
              ["Course", student.course],
              ["Batch", student.batch],
              ["Gender", student.gender],
              ["Phone", student.phone],
              ["Address", student.address],
            ].map(([label, value]) => (
              <div
                key={label}
                className="
                bg-gray-50
                rounded-lg
                p-4
              "
              >
                <p
                  className="
                text-sm
                text-gray-500
              "
                >
                  {label}
                </p>

                <p
                  className="
                mt-1
                font-medium
                text-gray-800
              "
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
