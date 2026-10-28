import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/authService";
import { toast } from "react-toastify";
import GoogleAuthButton from "./GoogleAuthButton";
import { loginSchema } from "@/lib/validation";
import { getErrorMessage } from "@/lib/apiError";

import { useEffect, useState } from "react";

export default function LoginForm() {
  const navigate = useNavigate();
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
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Something went wrong. Please try again."));
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-xl border border-border bg-surface">
      {/* title */}
      <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
      <p className="text-gray-400 mb-6">Sign in to continue your prep.</p>

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
                <label className="text-sm text-gray-300">Email code</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) =>
                    setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6-digit code"
                  className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="mb-6">
                <label className="text-sm text-gray-300">New password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Use at least 8 characters, including uppercase and lowercase letters, a number, and a special character.
                </p>
              </div>
              <Button
                className="w-full py-5 text-base bg-brand text-primary-foreground hover:bg-brand-hover"
                onClick={submitPasswordReset}
                loading={loading}
              >
                Reset password
              </Button>
              <button
                type="button"
                className="mt-3 w-full text-sm text-brand hover:underline"
                onClick={requestPasswordReset}
                disabled={loading}
              >
                Resend code
              </button>
            </>
          )}
          <button
            type="button"
            className="mt-5 w-full text-sm text-brand hover:underline"
            onClick={() => {
              setRecoveringPassword(false);
              setResetCodeSent(false);
              setResetCode("");
              setNewPassword("");
            }}
          >
            Back to sign in
          </button>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label className="text-sm text-gray-300">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="mb-2">
            <label className="text-sm text-gray-300">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              Use at least 8 characters, including uppercase and lowercase letters, a number, and a special character.
            </p>
          </div>
          <button
            type="button"
            className="mb-6 block ml-auto text-sm text-brand hover:underline"
            onClick={() => setRecoveringPassword(true)}
          >
            Forgot password?
          </button>

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
              className="text-brand cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Create one
            </span>
          </p>
        </>
      )}
    </div>
  );
}
