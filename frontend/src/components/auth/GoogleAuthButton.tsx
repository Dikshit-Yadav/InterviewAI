import { AuthService } from "@/services/authService";

export default function GoogleAuthButton() {
  return (
    <button
      type="button"
      className="w-full rounded-md border border-border bg-surface py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
      onClick={AuthService.googleLogin}
    >
      <span className="mr-2 font-bold text-brand" aria-hidden="true">
        G
      </span>
      Continue with Google
    </button>
  );
}
