import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Alert({
  type = 'info',
  message,
  onClose,
  autoClose = false,
  duration = 5000,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const styles = {
    success: 'bg-green-900/50 border-green-500/50 text-green-100',
    error: 'bg-red-900/50 border-red-500/50 text-red-100',
    warning: 'bg-yellow-900/50 border-yellow-500/50 text-yellow-100',
    info: 'bg-blue-900/50 border-blue-500/50 text-blue-100',
  };

  return (
    <div
      className={`
        ${styles[type]}
        border backdrop-blur-xl rounded-xl p-4 flex items-start gap-3 shadow-lg
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 text-sm">{message}</div>
      {onClose && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function Toast({
  type = 'info',
  message,
  onClose,
}: Omit<AlertProps, 'autoClose' | 'duration'>) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
      <Alert
        type={type}
        message={message}
        onClose={onClose}
        autoClose
        duration={5000}
      />
    </div>
  );
}
