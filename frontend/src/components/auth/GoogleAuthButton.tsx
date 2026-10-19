import { AuthService } from "@/services/authService";

export default function GoogleAuthButton() {
  return (
    <button
      type="button"
      className="w-full rounded-md border border-white/15 bg-black/30 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
      onClick={AuthService.googleLogin}
    >
      <span className="mr-2 font-bold text-blue-400" aria-hidden="true">
        G
      </span>
      Continue with Google
    </button>
  );
}
