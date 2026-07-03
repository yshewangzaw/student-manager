import { useAppContext } from "../context/AppContext";
import "../styles/Toast.css";

const ICONS = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
  warning: "⚠",
};

export default function ToastNotification() {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type || "success"} slide-in`}
          role="alert"
        >
          <span className="toast-icon">{ICONS[toast.type] || ICONS.success}</span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
