import { useNavigate } from "react-router-dom";
import { ShieldAlertOutlined, DashboardOutlined, ClockCircleOutlined } from "@/lib/antd-compat/icons";

type ViolationRecord = {
  type: string;
  timestamp: string | Date;
};

type Props = {
  violations?: ViolationRecord[];
  role?: string;
  onNavigateHome?: () => void;
};

export default function CheaterDetectedScreen({
  violations = [],
  role = "Technical Interview",
  onNavigateHome,
}: Props) {
  const navigate = useNavigate();

  const handleReturnDashboard = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigate("/dashboard");
    }
  };

  const defaultViolations: ViolationRecord[] =
    violations.length > 0
      ? violations
      : [
          { type: "TAB_SWITCH", timestamp: new Date(Date.now() - 60000) },
          { type: "FULLSCREEN_EXIT", timestamp: new Date() },
        ];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8 text-foreground select-none">
      <div className="w-full max-w-xl rounded-2xl border border-destructive/40 bg-card p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fade-in">
        {/* Shield Alert Badge */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-destructive/50 bg-destructive/15 text-destructive shadow-lg animate-pulse">
          <ShieldAlertOutlined className="text-4xl" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="inline-block rounded-full border border-destructive/40 bg-destructive/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-destructive">
            Malpractice Flagged • 2/2 Violations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Assessment Terminated
          </h1>
          <p className="text-sm text-muted-foreground">
            Candidate session for <strong className="text-foreground">{role}</strong> has been permanently closed.
          </p>
        </div>

        {/* Reason Card */}
        <div className="rounded-xl border border-border bg-surface p-4 text-left text-xs leading-relaxed space-y-3">
          <p className="text-foreground font-semibold">
            Security Boundary Violations Logged:
          </p>
          <div className="space-y-2">
            {defaultViolations.slice(0, 2).map((v, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-destructive/20 bg-background/80 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20 text-[11px] font-bold text-destructive">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-foreground">
                    {v.type === "TAB_SWITCH"
                      ? "Browser Tab Switched / Window Inactive"
                      : v.type === "FULLSCREEN_EXIT"
                      ? "Full-Screen Mode Exited"
                      : "Proctoring Violation"}
                  </span>
                </div>
                <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <ClockCircleOutlined className="text-[10px]" />
                  {new Date(v.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/80">
            <strong>Policy Enforced:</strong> Candidates are allowed a maximum of 1 warning. Upon the 2nd violation, the interview terminates immediately and responses are preserved with an integrity penalty for administrative review.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleReturnDashboard}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-hover text-primary-foreground py-3.5 text-sm font-semibold shadow-md transition-all cursor-pointer"
        >
          <DashboardOutlined />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
