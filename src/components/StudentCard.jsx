export default function StudentCredentialsModal({
  open,
  credentials,
  onClose,
}) {
  if (!open || !credentials) return null;

  const copyPassword = async () => {
    await navigator.clipboard.writeText(credentials.password);
    alert("Password copied!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_.25s_ease]">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-5 text-white">
          <h2 className="text-2xl font-bold">
            🎉 Student Created Successfully
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            Share these login credentials with the student.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 font-semibold text-gray-800 break-all">
              {credentials.email}
            </p>
          </div>

          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Generated Password</p>

            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-lg font-bold text-blue-600">
                {credentials.password}
              </span>

              <button
                onClick={copyPassword}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-700">
              ⚠️ This password will only be shown once. Please copy it before
              closing this window.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
