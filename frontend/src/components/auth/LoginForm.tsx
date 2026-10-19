import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/authService"
import {toast } from "react-toastify";
import GoogleAuthButton from "./GoogleAuthButton";
import { z } from "zod";

import { useEffect, useState } from "react";

const loginSchema = z
  .object({
    email: z.string().trim(),
    password: z.string(),
  })
  .superRefine(({ email, password }, ctx) => {
    if (!email && !password) {
      ctx.addIssue({ code: "custom", message: "All fields are required" });
      return;
    }

    if (!password) {
      ctx.addIssue({ code: "custom", message: "Password is required" });
    } else if (password.trim().length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters",
      });
    }

    if (!email) {
      ctx.addIssue({ code: "custom", message: "Email is required" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid email" });
    }
  });

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("oauth_error");
    if (!oauthError) return;

    toast.error(
      oauthError === "cancelled"
        ? "Google sign-in was cancelled."
        : "Google sign-in failed. Please try again."
    );
    params.delete("oauth_error");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    );
  }, []);

  const submit = async () => {
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
    try {
      await AuthService.login(validation.data);

      toast.success("Login successful!");
      navigate("/dashboard");

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">

      {/* title */}
      <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
      <p className="text-gray-400 mb-6">
        Sign in to continue your prep.
      </p>

      {/* email */}
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

      {/* password */}
      <div className="mb-6">
        <label className="text-sm text-gray-300">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      {/* btn */}
      <Button className="w-full py-5 text-base bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90" onClick={submit} loading={loading}>
        {loading ? "Signing in..." : "Sign in →"}
      </Button>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-white/10" />
        OR
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <GoogleAuthButton />

      {/* footer */}
      <p className="text-center text-sm text-gray-400 mt-6">
        New to InterviewAI?{" "}
        <span className="text-purple-400 cursor-pointer hover:underline" onClick={() => navigate("/signup")}>
          Create one
        </span>
      </p>
    </div>
  );
}