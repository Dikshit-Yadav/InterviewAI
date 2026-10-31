import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthService } from "@/services/authService";
import { toast } from "react-toastify";
import GoogleAuthButton from "./GoogleAuthButton";
import { loginSchema } from "@/lib/validation";
import { getErrorMessage } from "@/lib/apiError";
import { Sparkles } from "lucide-react";

import { useEffect, useState } from "react";

export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget =
    searchParams.get("redirect") ||
    sessionStorage.getItem("auth_redirect") ||
    "/dashboard";
  const isSharedInterview = redirectTarget.includes("/join/");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveringPassword, setRecoveringPassword] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("oauth_error");
    if (!oauthError) return;

    toast.error(
      oauthError === "cancelled"
        ? "Google sign-in was cancelled."
        : "Google sign-in failed. Please try again.",
    );
    params.delete("oauth_error");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
    );
  }, []);

  const requestPasswordReset = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await AuthService.requestPasswordReset(email);
      setResetCodeSent(true);
      toast.info(result.message);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not request a reset code."));
    } finally {
      setLoading(false);
    }
  };

  const submitPasswordReset = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await AuthService.resetPassword(
        email,
        resetCode,
        newPassword,
      );
      toast.success(result.message);
      setRecoveringPassword(false);
      setResetCodeSent(false);
      setResetCode("");
      setNewPassword("");
      setPassword("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not reset your password."));
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      await AuthService.login(validation.data);

      toast.success("Login successful!");
      sessionStorage.removeItem("auth_redirect");
      navigate(redirectTarget, { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Something went wrong. Please try again."));
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-xl border border-border bg-surface">
      {/* Title */}
      <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
      <p className="text-gray-400 mb-6">Sign in to continue your prep.</p>

      {/* Shared Interview Banner if accessing via link */}
      {isSharedInterview && (
        <div className="mb-5 rounded-xl border border-brand/30 bg-brand/10 p-3.5 text-xs space-y-1">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            Interview Assessment Access
          </p>
          <p className="text-100 leading-relaxed">
            Please sign in to access your shared interview assessment. Don't have an account? Click "Create one" below to sign up.
          </p>
        </div>
      )}

      {recoveringPassword ? (
        <>
          <div className="mb-4">
            <label className="text-sm text-gray-300">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setResetCodeSent(false);
                setResetCode("");
                setNewPassword("");
              }}
              placeholder="you@university.edu"
              autoComplete="email"
              className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          {!resetCodeSent ? (
            <Button
              className="w-full py-5 text-base bg-brand text-primary-foreground hover:bg-brand-hover"
              onClick={requestPasswordReset}
              loading={loading}
            >
              Send reset code
            </Button>
          ) : (
            <>
              <div className="mb-4">
                <label className="text-sm text-gray-300">Reset code</label>
                <Input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="mb-4">
                <label className="text-sm text-gray-300">New password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                className="w-full py-5 text-base bg-brand text-primary-foreground hover:bg-brand-hover"
                onClick={submitPasswordReset}
                loading={loading}
              >
                Reset password
              </Button>
            </>
          )}
          <p className="text-center text-sm text-gray-400 mt-6">
            Remembered your password?{" "}
            <span
              className="text-brand cursor-pointer hover:underline"
              onClick={() => {
                setRecoveringPassword(false);
                setResetCodeSent(false);
                setResetCode("");
                setNewPassword("");
              }}
            >
              Back to sign in
            </span>
          </p>
        </>
      ) : (
        <>
          {/* Email input */}
          <div className="mb-4">
            <label className="text-sm text-gray-300">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              autoComplete="email"
              className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Password input */}
          <div className="mb-2">
            <label className="text-sm text-gray-300">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="mb-6 flex justify-end">
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-white"
              onClick={() => {
                setRecoveringPassword(true);
                setResetCodeSent(false);
                setResetCode("");
                setNewPassword("");
              }}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit button */}
          <Button
            className="w-full py-5 text-base bg-brand text-primary-foreground hover:bg-brand-hover"
            onClick={submit}
            loading={loading}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
            <span className="h-px flex-1 bg-white/10" />
            OR
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <GoogleAuthButton />

          <p className="text-center text-sm text-gray-400 mt-6">
            New to InterviewAI?{" "}
            <span
              className="text-brand cursor-pointer hover:underline font-semibold"
              onClick={() =>
                navigate(
                  redirectTarget && redirectTarget !== "/dashboard"
                    ? `/signup?redirect=${encodeURIComponent(redirectTarget)}`
                    : "/signup",
                )
              }
            >
              Create one
            </span>
          </p>
        </>
      )}
    </div>
  );
}
