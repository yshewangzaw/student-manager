export default function LoginCredentialModal({ credentials, onClose }) {
  if (!credentials) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 w-[400px]">
        <h2 className="text-2xl font-bold text-center mb-6">
          🎓 Student Created Successfully
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-semibold">{credentials.email}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Temporary Password</p>

            <p className="font-semibold text-blue-600">
              {credentials.password}
            </p>
          </div>

          <p className="text-sm text-red-500">
            Tell this password to the student. The student should change it
            after login.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
