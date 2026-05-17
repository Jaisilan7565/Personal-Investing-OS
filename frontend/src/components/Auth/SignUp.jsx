import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Moon,
  Sun,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import InteractiveGrid from "./InteractiveGrid";
import { authService } from "../../services/authService";
import { useToast } from "../../hooks/useToast";

export default function SignUp({
  onSignUp,
  onSwitchToSignIn,
  theme,
  toggleTheme,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Formik configuration with Yup Validation schema
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      agreeToTerms: false,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("Full Name is required"),
      email: Yup.string()
        .email("Please provide a valid email address")
        .required("Email address is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      agreeToTerms: Yup.boolean()
        .oneOf([true], "You must agree to the Terms & Privacy Policy")
        .required(),
    }),
    onSubmit: async (values) => {
      setError(null);
      setLoading(true);

      try {
        const data = await authService.register(
          values.name,
          values.email,
          values.password,
        );

        // Successful registration
        const { token, username } = data.data;
        toast.success(`Account created successfully! Welcome, ${username}!`);
        onSignUp(token, username);
      } catch (err) {
        console.error("Registration submission error:", err);
        setError(err.message);
        toast.error(
          err.message || "Failed to create account. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-[100dvh] w-full bg-surface flex flex-col items-center justify-center relative p-4 selection:bg-accent-indigo/30 overflow-hidden">
      {/* Interactive Moving Grid & Spotlight (Optimized for mobile) */}
      <InteractiveGrid />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full border border-surface-border bg-surface-container text-on-variant hover:text-on-heading transition-all duration-200 shadow-sm hover:scale-105 cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Dynamic Fluid Animated Background (Optimized for performance) */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full animate-blob pointer-events-none will-change-transform"
        style={{
          background: `radial-gradient(circle, ${theme === "dark" ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.15)"} 0%, transparent 70%)`,
        }}
      ></div>
      <div
        className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full animate-blob animation-delay-2000 pointer-events-none will-change-transform"
        style={{
          background: `radial-gradient(circle, ${theme === "dark" ? "rgba(217,70,239,0.05)" : "rgba(217,70,239,0.10)"} 0%, transparent 70%)`,
        }}
      ></div>
      <div
        className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full animate-blob animation-delay-4000 pointer-events-none will-change-transform"
        style={{
          background: `radial-gradient(circle, ${theme === "dark" ? "rgba(6,182,212,0.05)" : "rgba(6,182,212,0.10)"} 0%, transparent 70%)`,
        }}
      ></div>

      <div className="w-full max-w-[400px] flex flex-col gap-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold tracking-tight text-on-heading font-sora">
            Investing OS
          </h1>
          <p className="text-[11px] text-on-variant font-medium mt-1 tracking-[0.05em] uppercase">
            Institutional Grade Analysis
          </p>
        </div>

        {/* Sign Up Card Container */}
        <div className="relative">
          {/* Sign Up Card */}
          <div className="glass-card p-8 flex flex-col gap-6 shadow-xl relative z-10">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-bold text-on-heading">
                Create Account
              </h2>
              <p className="text-xs text-on-variant font-inter">
                Get immediate access to elite-tier trading insights
              </p>
            </div>

            {/* Error Alert Display */}
            {error && (
              <div className="p-3.5 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-200 text-xs flex gap-2.5 items-center font-inter animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle
                  size={16}
                  className="text-red-600 dark:text-red-400 shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4 font-inter"
            >
              {/* Name Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wide text-on-variant uppercase text-[10px]">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-variant"
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Jane Doe"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`input-field w-full pl-10 text-sm ${
                      formik.touched.name && formik.errors.name
                        ? "border-red-500/40 focus:border-red-500"
                        : ""
                    }`}
                    disabled={loading}
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <span className="text-[10px] text-red-400 font-semibold tracking-wide mt-0.5 ml-1">
                    {formik.errors.name}
                  </span>
                )}
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wide text-on-variant uppercase text-[10px]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-variant"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="janedoe@example.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`input-field w-full pl-10 text-sm ${
                      formik.touched.email && formik.errors.email
                        ? "border-red-500/40 focus:border-red-500"
                        : ""
                    }`}
                    disabled={loading}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <span className="text-[10px] text-red-400 font-semibold tracking-wide mt-0.5 ml-1">
                    {formik.errors.email}
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wide text-on-variant uppercase text-[10px]">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-variant"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`input-field w-full pl-10 pr-10 text-sm ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500/40 focus:border-red-500"
                        : ""
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-variant hover:text-on-heading transition-colors p-0.5 focus:outline-none cursor-pointer"
                    tabIndex="-1"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <span className="text-[10px] text-red-400 font-semibold tracking-wide mt-0.5 ml-1">
                    {formik.errors.password}
                  </span>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2 py-1">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formik.values.agreeToTerms}
                  onChange={formik.handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-surface-border bg-surface-lowest text-accent-indigo focus:ring-accent-indigo/30 cursor-pointer accent-accent-indigo"
                  disabled={loading}
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-xs font-medium text-on-variant cursor-pointer select-none leading-tight"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-accent-indigo font-bold hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Terms
                  </a>{" "}
                  &{" "}
                  <a
                    href="#"
                    className="text-accent-indigo font-bold hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
                <span className="text-[10px] text-red-400 font-semibold tracking-wide ml-1">
                  {formik.errors.agreeToTerms}
                </span>
              )}

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading || !formik.isValid}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3 text-sm font-bold tracking-wide shadow-lg shadow-indigo-500/10 border border-[#6366F1]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Create Account"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Nav */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-2 delay-300 duration-500 fill-mode-both">
          <p className="text-xs text-on-variant font-medium font-inter">
            Already have an account?{" "}
            <button
              onClick={onSwitchToSignIn}
              className="text-accent-indigo font-bold hover:underline tracking-wide"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
