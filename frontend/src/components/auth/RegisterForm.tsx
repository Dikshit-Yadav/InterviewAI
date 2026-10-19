import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/authService"
import {toast } from "react-toastify";
import GoogleAuthButton from "./GoogleAuthButton";
import { registerSchema } from "@/lib/validation";

import { useState } from "react";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const validation = registerSchema.safeParse({
      name,
      email,
      password,
      targetRole,
    });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      await AuthService.register(validation.data);

      toast.success("Registration successful!");
      navigate("/login");

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-xl border border-border bg-surface">

      {/* title */}
      <h2 className="text-2xl font-semibold mb-2">
        Create your account
      </h2>
      <p className="text-gray-400 mb-6">
        Start practicing in under a minute.
      </p>

      {/* name */}
      <div className="mb-4">
        <label className="text-sm text-gray-300">Name</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Lovelace"
          className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

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
      <div className="mb-4">
        <label className="text-sm text-gray-300">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-2 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      {/* target role */}
      <div className="mb-6">
        <label className="text-sm text-gray-300">Target role</label>
        <select
          className="mt-2 w-full p-3 rounded-md bg-black/40 border border-white/10 text-gray-300 focus:outline-none"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        >
          <option value="">Pick your target role</option>
          <option>MERN Developer</option>
          <option>Frontend Developer</option>
          <option>Backend Developer</option>
          <option>Full Stack Developer</option>
          <option>Data Structures & Algorithms</option>
        </select>
      </div>

      {/* btn */}
      <Button className="w-full py-5 text-base bg-brand text-primary-foreground hover:bg-brand-hover" onClick={submit} loading={loading}>
        {loading ? "Creating account..." : "Create account →"}
      </Button>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-white/10" />
        OR
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <GoogleAuthButton />

      {/* footer */}
      <p className="text-center text-sm text-gray-400 mt-6">
        Already have an account?{" "}
        <span className="text-brand cursor-pointer hover:underline" onClick={() => navigate("/login")}>
          Sign in
        </span>
      </p>
    </div>
  );
}