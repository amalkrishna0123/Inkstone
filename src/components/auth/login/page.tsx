"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { googleLogin, login } from "@/src/lib/inkstone-api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleButtonMobileRef = useRef<HTMLDivElement>(null);
  const googleLoginRef = useRef<(credential: string) => Promise<void>>(async () => undefined);

  useEffect(() => {
    if (localStorage.getItem("inkstone_access")) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    googleLoginRef.current = async (credential) => {
      setLoading(true);
      setError("");
      try {
        await googleLogin(credential);
        router.push("/");
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Unable to sign in with Google");
      } finally {
        setLoading(false);
      }
    };
  }, [router]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const renderGoogleButtons = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => void googleLoginRef.current(response.credential),
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.replaceChildren();
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          width: 320,
        });
      }

      if (googleButtonMobileRef.current) {
        googleButtonMobileRef.current.replaceChildren();
        window.google.accounts.id.renderButton(googleButtonMobileRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          width: "100%",
        });
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      if (window.google) renderGoogleButtons();
      else existingScript.addEventListener("load", renderGoogleButtons, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderGoogleButtons, { once: true });
    document.head.appendChild(script);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#000] md:bg-[#f0f0f0] md:pt-20 md:pb-10 flex flex-col md:items-center md:justify-center">
      
      
      <div className="flex md:hidden flex-col w-full min-h-screen relative bg-[#000] overflow-x-hidden">
        
        {/* Top Header & Organic Background Artwork */}
        <div className="relative w-full h-[220px] sm:h-[250px] shrink-0 overflow-hidden flex items-center justify-center px-6">
          {/* Organic curves SVG */}
          <svg
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            viewBox="0 0 400 240"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Grain / Stipple filter */}
              <filter id="mobile-art-grain" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
                <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.12 0" />
                <feBlend mode="multiply" in="SourceGraphic" result="blend" />
              </filter>
            </defs>

            {/* Base Terracotta */}
            <rect width="400" height="240" fill="#de6a45" />

            {/* Left Gold/Olive Curve */}
            <path
              d="M -40 -30 C 50 -10, 110 50, 85 140 C 65 210, -20 260, -60 250 Z"
              fill="#d1b764"
            />

            {/* Right Mint/Sage Green Curve */}
            <path
              d="M 300 250 C 290 190, 360 120, 430 110 C 470 105, 490 150, 480 250 Z"
              fill="#5da88b"
            />

            {/* Noise grain overlay */}
            <rect width="400" height="240" filter="url(#mobile-art-grain)" opacity="0.85" />
          </svg>

          {/* Centered Heading */}
          <h1 className="relative z-10 text-white text-[32px] sm:text-[36px] font-bold text-center leading-[1.18] tracking-tight drop-shadow-sm select-none">
            Sign in to<br />account
          </h1>
        </div>

        {/* White Card Container */}
        <div className="flex-1 w-full bg-white rounded-t-[36px] sm:rounded-t-[40px] px-6 pt-7 pb-10 shadow-2xl flex flex-col justify-between -mt-3 z-10 relative">
          
          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            
            {/* Google Sign In Button */}
            <div className="w-full relative mb-1">
              <div
                ref={googleButtonMobileRef}
                className="google-btn-container w-full flex justify-center [&>div]:!w-full [&>div>iframe]:!w-full [&>div>iframe]:!rounded-full"
              />
              
              {/* Fallback Google Button if GIS not rendered */}
              {!GOOGLE_CLIENT_ID && (
                <button
                  type="button"
                  onClick={() => setError("Google Client ID not configured")}
                  className="w-full h-12 rounded-full border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.99] transition flex items-center justify-center gap-3 shadow-xs"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-[15px] font-medium text-gray-700">Sign in with Google</span>
                </button>
              )}
            </div>

            {/* Centered 'or' */}
            <div className="text-center text-gray-400 text-sm font-normal my-4 select-none">
              or
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs text-center border border-red-100">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="mb-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full bg-[#f3f4f6] text-gray-800 placeholder-gray-400 text-[15px] rounded-2xl px-5 py-4 outline-none transition focus:bg-[#edeff2] focus:ring-1 focus:ring-gray-300"
              />
            </div>

            {/* Password Field + Eye Toggle */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="flex-1 min-w-0 bg-[#f3f4f6] text-gray-800 placeholder-gray-400 text-[15px] rounded-2xl px-5 py-4 outline-none transition focus:bg-[#edeff2] focus:ring-1 focus:ring-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="w-14 h-[54px] shrink-0 bg-[#f3f4f6] rounded-2xl flex items-center justify-center text-gray-600 hover:text-black hover:bg-[#eaecee] active:scale-95 transition"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember & Forgot Password (subtle & functional) */}
            <div className="flex items-center justify-between px-1 mb-5 text-xs text-gray-400 select-none">
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-600 transition">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="hover:text-black hover:underline transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* Black Pill Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-neutral-900 active:scale-[0.99] text-white font-semibold py-4 rounded-full text-[16px] transition duration-200 shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Bottom Legal & Switcher */}
          <div className="mt">
            {/* Legal / Policy Text */}
            <p className="text-[13px] text-gray-500 text-center leading-relaxed px-1 mb-6 select-none">
              Signing into a <span className="logo-font mx-1">Inkstone</span> account means you agree to the{" "}
              <a href="#" className="underline underline-offset-2 text-gray-700 hover:text-black">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-2 text-gray-700 hover:text-black">
                Terms of Service
              </a>
              .
            </p>

            {/* Switcher */}
            <p className="text-center text-[14px] text-gray-800 select-none">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="font-semibold text-[#ffea00] underline underline-offset-2 hover:opacity-80 transition cursor-pointer"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (>= md) - Preserves existing desktop panel design          */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full max-w-5xl bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex-col lg:flex-row min-h-[600px]">
        
        {/* ── Left Panel ── */}
        <div className="relative flex flex-1 min-h-72 lg:min-h-0 overflow-hidden bg-[#ffea00]" />

        {/* ── Right Panel ── */}
        <div className="flex-1 flex flex-col justify-between bg-white/80 backdrop-blur px-8 py-10 lg:px-12">
          <form onSubmit={handleSubmit}>
            {/* Heading */}
            <h2 className="text-3xl tracking-[-1px] text-start md:text-6xl md:tracking-[-4px] text-gray-900 mb-1">
              Make your <span className="font-bold text-[#ffea00]">way in</span>
            </h2>
            <p className="text-sm text-gray-400 mb-8 text-start">
              Sign in to access your unified inbox
            </p>
            {error && <p className="text-sm text-red-600 mb-4 text-start">{error}</p>}

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#ffea00] focus-within:border-transparent transition">
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#ffea00] focus-within:border-transparent transition">
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${
                    rememberMe ? "bg-[#ffea00] border-[#ffea00]" : "border-gray-300"
                  }`}
                >
                  {rememberMe && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-500">Remember me</span>
              </label>
              <button type="button" className="text-sm text-gray-500 hover:text-[#ffea00] transition">
                Forgot Password?
              </button>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#000] to-[#222222e0] active:scale-[.98] text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-gray-200 mb-4 disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4 w-full">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">Or Continue With</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div ref={googleButtonRef} className="flex min-h-10 justify-center" />
          </form>

          {/* Bottom section */}
          <div className="mt-8">
            <p className="text-center text-sm text-gray-400 mb-6">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-black font-semibold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}