import React, { useState } from "react";
import { Mail, Lock, User, ArrowRight, Moon, Sun, Sparkles, Eye, EyeOff } from "lucide-react";
import InteractiveGrid from "./InteractiveGrid";

export default function SignUp({ onSignUp, onSwitchToSignIn, theme, toggleTheme }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeToTerms) return;
    // Simulated authentication
    onSignUp();
  };

  return (
    <div className="min-h-screen w-full bg-surface flex flex-col items-center justify-center relative p-4 selection:bg-accent-indigo/30 overflow-hidden">
      {/* Interactive Moving Grid & Spotlight */}
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

      {/* Dynamic Fluid Animated Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#6366F1]/15 dark:bg-[#6366F1]/10 rounded-full filter blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#D946EF]/10 dark:bg-[#D946EF]/5 rounded-full filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-[#06B6D4]/10 dark:bg-[#06B6D4]/5 rounded-full filter blur-[120px] animate-blob animation-delay-4000 pointer-events-none"></div>

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
              <h2 className="text-lg font-bold text-on-heading">Create Account</h2>
              <p className="text-xs text-on-variant font-inter">
              Get immediate access to elite-tier trading insights
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-inter">
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
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field w-full pl-10 text-sm"
                />
              </div>
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
                  required
                  placeholder="janedoe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-10 text-sm"
                />
              </div>
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
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-variant hover:text-on-heading transition-colors p-0.5 focus:outline-none cursor-pointer"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2 py-1">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-surface-border bg-surface-lowest text-accent-indigo focus:ring-accent-indigo/30 cursor-pointer accent-accent-indigo"
              />
              <label
                htmlFor="terms"
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

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={!agreeToTerms}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3 text-sm font-bold tracking-wide shadow-lg shadow-indigo-500/10 border border-[#6366F1]/20 disabled:hover:opacity-30"
            >
              Create Account
              <ArrowRight size={16} />
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
