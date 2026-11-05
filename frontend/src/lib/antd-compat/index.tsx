import React from "react";
import { Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

// 1. ConfigProvider
export const ConfigProvider = ({
  children,
}: {
  theme?: object;
  children: React.ReactNode;
}) => {
  return <div className="antd-root">{children}</div>;
};

// 2. Button
export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "size"> & {
  type?: "primary" | "default" | "dashed" | "link" | "text";
  danger?: boolean;
  size?: "large" | "middle" | "small";
  loading?: boolean;
  icon?: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = "default",
      danger = false,
      size = "middle",
      loading = false,
      icon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses =
      size === "large"
        ? "px-5 py-2.5 text-base"
        : size === "small"
        ? "px-2.5 py-1 text-xs"
        : "px-3.5 py-1.5 text-sm";

    let variantClasses = "border border-white/15 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white";

    if (type === "primary") {
      variantClasses = danger
        ? "bg-red-600 text-white hover:bg-red-500 border-0 shadow-sm"
        : "bg-indigo-600 text-white hover:bg-indigo-500 border-0 shadow-sm";
    } else if (danger) {
      variantClasses = "border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300";
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin shrink-0" size={14} /> : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// 4. Tag
export const Tag = ({
  color,
  children,
  className = "",
}: {
  color?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    cyan: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
    purple: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    orange: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    gold: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    geekblue: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
    green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    red: "bg-red-500/15 text-red-400 border border-red-500/30",
  };

  const badgeStyle = color && colorMap[color] ? colorMap[color] : "bg-neutral-800 text-neutral-300 border border-white/10";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badgeStyle} ${className}`}
    >
      {children}
    </span>
  );
};

// 5. Badge
export const Badge = ({
  count,
  children,
  className = "",
}: {
  count?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) => (
  <div className={`relative inline-flex items-center ${className}`}>
    {children}
    {count !== undefined && count !== null && (
      <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
        {count}
      </span>
    )}
  </div>
);

// 6. Tooltip
export const Tooltip = ({
  title,
  children,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative group inline-block">
      {children}
      {title && (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex z-50 whitespace-nowrap rounded-md bg-neutral-900 border border-white/15 px-2.5 py-1 text-xs text-neutral-200 shadow-xl">
          {title}
        </div>
      )}
    </div>
  );
};

// 7. Alert
export const Alert = ({
  message,
  description,
  type = "info",
  showIcon = false,
  icon,
  className = "",
}: {
  message?: React.ReactNode;
  description?: React.ReactNode;
  type?: "info" | "success" | "warning" | "error";
  showIcon?: boolean;
  icon?: React.ReactNode;
  className?: string;
}) => {
  const typeMap = {
    info: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    error: "border-red-500/30 bg-red-500/10 text-red-300",
  };

  const defaultIconMap = {
    info: <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />,
    error: <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />,
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-xs sm:text-sm ${
        typeMap[type] || typeMap.info
      } ${className}`}
    >
      {showIcon && (icon || defaultIconMap[type])}
      <div className="space-y-0.5 flex-1">
        {message && <div className="font-semibold text-neutral-100">{message}</div>}
        {description && <div className="text-xs leading-relaxed opacity-90">{description}</div>}
      </div>
    </div>
  );
};

export const Spin = ({
  size = "default",
  className = "",
}: {
  size?: "small" | "default" | "large";
  className?: string;
}) => {
  const px = size === "small" ? 14 : size === "large" ? 24 : 18;
  return <Loader2 className={`animate-spin text-indigo-400 ${className}`} size={px} />;
};

export const Select = ({
  value,
  onChange,
  options = [],
  className = "",
  size = "middle",
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
}) => {
  const sizeClasses =
    size === "small"
      ? "px-2 py-0.5 text-[11px]"
      : size === "large"
      ? "px-3 py-1.5 text-sm"
      : "px-2.5 py-1 text-xs";

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`rounded-lg border border-white/15 bg-neutral-900 font-medium text-neutral-200 outline-none hover:border-indigo-500 focus:border-indigo-500 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses} ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-neutral-900 text-neutral-200">
          {opt.label}
        </option>
      ))}
    </select>
  );
};

type ModalProps = {
  open: boolean;
  onCancel?: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode[];
  centered?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
};

export const Modal = ({
  open,
  onCancel,
  title,
  children,
  footer,
}: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-neutral-900 p-6 shadow-2xl space-y-4">
        {title && (
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="text-base font-semibold text-white">{title}</div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-neutral-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="py-1">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.confirm = ({
  title,
  content,
  onOk,
}: {
  title: React.ReactNode;
  content: React.ReactNode;
  onOk?: () => Promise<void> | void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  okButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}) => {
  const confirmed = window.confirm(
    typeof content === "string" ? `${title}\n\n${content}` : String(title)
  );
  if (confirmed && onOk) {
    onOk();
  }
};

export const Progress = ({
  percent = 0,
  className = "",
}: {
  percent?: number;
  className?: string;
}) => (
  <div className={`h-2 w-full overflow-hidden rounded-full bg-neutral-800 ${className}`}>
    <div
      className="h-full bg-indigo-500 transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

export const Statistic = ({
  title,
  value,
  prefix,
  className = "",
}: {
  title?: React.ReactNode;
  value?: React.ReactNode;
  prefix?: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-1 ${className}`}>
    {title && <span className="text-xs text-neutral-400 block">{title}</span>}
    <div className="flex items-center gap-1.5 text-xl font-bold text-white">
      {prefix}
      <span>{value}</span>
    </div>
  </div>
);
