"use client";
import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FacebookIcon } from "@/components/ui/facebook-icon";
import { Zap, Check } from "lucide-react";

const FEATURES = [
  "14-day free trial, no credit card required",
  "Schedule posts to Facebook automatically",
  "AI-powered content generation",
  "Lead capture & CRM dashboard",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", email: "", password: "" });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [fbLoading, setFbLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/api/auth/register", form);
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        setError("Registration succeeded but sign-in failed. Please log in.");
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {/* Left: features */}
      <div className="hidden md:block">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">FB Auto Revenue Suite</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Automate your Facebook marketing
        </h2>
        <p className="text-gray-500 mb-6">
          Schedule posts, capture leads, and grow your revenue — all from one powerful dashboard.
        </p>
        <ul className="space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-gray-700">
              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Create your account</h3>
        <p className="text-sm text-gray-500 mb-6">Start your 14-day free trial today</p>

        <Button
          className="w-full bg-[#1877F2] hover:bg-[#166FE5] mb-6"
          onClick={() => { setFbLoading(true); signIn("facebook", { callbackUrl: "/dashboard" }); }}
          loading={fbLoading}
        >
          <FacebookIcon className="h-5 w-5" />
          Continue with Facebook
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
            or register with email
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            type="password"
            placeholder="Password (min. 8 characters)"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
          />
          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
        <p className="text-center text-sm text-gray-500 mt-3">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
