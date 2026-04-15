"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Smartphone,
  X,
} from "lucide-react";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPhoneNumber,
} from "firebase/auth";
import { signIn } from "next-auth/react";
import { getFirebaseClientAuth } from "@/lib/firebase-client";
import { isPlaceholderValue } from "@/lib/envCheck";

interface LoginViewProps {
  onLogin: () => void;
  onClose: () => void;
}

type LoginStep =
  | "welcome"
  | "phone-entry"
  | "phone-otp"
  | "email-entry"
  | "email-otp";

type LastLogin = {
  provider: "phone" | "email" | "google";
  label: string;
  phone?: string;
  email?: string;
  name?: string;
};

type AuthResponse = {
  success: boolean;
  message?: string;
  user?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  devOtp?: string;
  resendAfterSeconds?: number;
};

const LAST_LOGIN_KEY = "rentro_last_login";
const EMAIL_LINK_KEY = "rentro_email_link";
const OTP_LENGTH = 6;
const PHONE_LOGIN_ENABLED = false;

const CAROUSEL_ITEMS = [
  {
    title: "Rent everything you need for college from your seniors.",
    icon: (
      <div className="flex items-center justify-center gap-1">
        <div className="relative">
          <div className="w-16 h-16 bg-blue-100 rounded-[1.5rem] flex items-center justify-center rotate-3 transform shadow-lg text-blue-600">
            <span className="text-2xl font-black">R</span>
          </div>
          <div className="absolute -top-4 -right-4 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center opacity-70 text-emerald-600">
            <div className="font-black text-xs">OTP</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Find books, calculators, and laptops in one place.",
    icon: (
      <div className="flex items-center justify-center text-slate-300">
        <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <Mail size={64} strokeWidth={1.5} />
        </div>
      </div>
    ),
  },
  {
    title: "Safe and verified marketplace for your campus.",
    icon: (
      <div className="flex items-center justify-center text-blue-500">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 blur-2xl rounded-full"></div>
          <Smartphone size={64} className="relative z-10" />
        </div>
      </div>
    ),
  },
];

function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return `+${digits}`;
}

function isPhoneValid(phone: string): boolean {
  return /^\+?[1-9]\d{7,14}$/.test(phone);
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// isPlaceholderEnv replaced by imported isPlaceholderValue from envCheck.ts

function mapFirebasePhoneError(error: unknown): string {
  const firebaseCode =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (!firebaseCode.startsWith("auth/")) {
    if (error instanceof Error) {
      return error.message;
    }
    return "Failed to send phone OTP. Check Firebase setup and try again.";
  }

  switch (firebaseCode) {
    case "auth/invalid-api-key":
      return "Firebase API key invalid hai. .env me NEXT_PUBLIC_FIREBASE_API_KEY update karo.";
    case "auth/app-not-authorized":
      return "Ye domain Firebase Auth me authorized nahi hai. Firebase console me localhost add karo.";
    case "auth/invalid-phone-number":
      return "Phone format invalid hai. Country code ke sath number do, jaise +918887589166.";
    case "auth/too-many-requests":
      return "Too many OTP requests. Thodi der baad retry karo.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA verify nahi hua. Page refresh karke dobara try karo.";
    case "auth/missing-app-credential":
      return "OTP session invalid ho gaya. Dobara Send OTP karo.";
    case "auth/network-request-failed":
      return "Network issue aaya. Internet check karke dobara try karo.";
    case "auth/configuration-not-found":
      return "Firebase Authentication project configured nahi hai. Firebase Console > Authentication me jaakar sign-in setup complete karo aur Phone provider enable karo.";
    case "auth/operation-not-allowed":
      return "Phone auth abhi enable nahi hai. Firebase Console > Authentication > Sign-in method > Phone enable karo.";
    default:
      return error instanceof Error
        ? error.message
        : "Failed to send phone OTP. Check Firebase setup and try again.";
  }
}

function mapGoogleSignInError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Google sign in failed. Please try again.";
}

export default function LoginView({ onLogin, onClose }: LoginViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [step, setStep] = useState<LoginStep>("welcome");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [lastLogin, setLastLogin] = useState<LastLogin | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const isOtpStep = step === "phone-otp" || step === "email-otp";
  const isFirebaseClientConfigured = useMemo(() => {
    return ![
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    ].some((value) => isPlaceholderValue(value));
  }, []);

  useEffect(() => {
    if (step !== "welcome") {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendIn((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendIn]);

  useEffect(() => {
    const saved = localStorage.getItem(LAST_LOGIN_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as LastLogin;
      if (parsed?.provider && parsed?.label) {
        setLastLogin(parsed);
      }
    } catch {
      localStorage.removeItem(LAST_LOGIN_KEY);
    }
  }, []);

  useEffect(() => {
    if (PHONE_LOGIN_ENABLED) {
      return;
    }

    if (step === "phone-entry" || step === "phone-otp") {
      setStep("welcome");
    }
  }, [step]);

  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
      }
    };
  }, []);

  const welcomeTitle = useMemo(() => CAROUSEL_ITEMS[activeIndex].title, [activeIndex]);

  function resetNotice() {
    setError("");
    setInfo("");
  }

  function persistLastLogin(value: LastLogin) {
    localStorage.setItem(LAST_LOGIN_KEY, JSON.stringify(value));
    setLastLogin(value);
  }

  async function loginWithFirebaseToken(params: {
    firebaseToken: string;
    provider: "email" | "google";
    name?: string;
  }) {
    const response = await fetch("/api/auth/firebase-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const payload = (await response.json()) as AuthResponse;
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Firebase login failed");
    }

    return payload;
  }

  async function ensureRecaptchaVerifier() {
    if (recaptchaRef.current) {
      return recaptchaRef.current;
    }

    const auth = getFirebaseClientAuth();
    const verifier = new RecaptchaVerifier(auth, "rentro-recaptcha", {
      size: "invisible",
    });

    await verifier.render();
    recaptchaRef.current = verifier;
    return verifier;
  }

  async function sendPhoneOtp(sourcePhone?: string) {
    if (!isFirebaseClientConfigured) {
      setError("Firebase config missing hai. .env me NEXT_PUBLIC_FIREBASE_* real values add karo.");
      return;
    }

    const phoneInput = normalizePhone(sourcePhone ?? phone);

    if (!isPhoneValid(phoneInput)) {
      setError("Please enter a valid phone number with country code");
      return;
    }

    setIsLoading(true);
    resetNotice();

    try {
      const auth = getFirebaseClientAuth();
      const verifier = await ensureRecaptchaVerifier();
      const result = await signInWithPhoneNumber(auth, phoneInput, verifier);

      setPhone(phoneInput);
      setOtp("");
      setConfirmationResult(result);
      setStep("phone-otp");
      setResendIn(30);
      setInfo(`OTP sent to ${phoneInput}`);
    } catch (error) {
      setError(mapFirebasePhoneError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyPhoneOtp() {
    if (!confirmationResult) {
      setError("OTP session expired. Please request OTP again.");
      return;
    }

    if (otp.trim().length !== OTP_LENGTH) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    resetNotice();

    try {
      const credential = await confirmationResult.confirm(otp.trim());
      const firebaseToken = await credential.user.getIdToken();

      const response = await fetch("/api/auth/phone-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          firebaseToken,
          name: displayName || undefined,
        }),
      });

      const payload = (await response.json()) as AuthResponse;
      if (!response.ok || !payload.success) {
        setError(payload.message || "Phone login failed");
        return;
      }

      persistLastLogin({
        provider: "phone",
        label: payload.user?.name || phone,
        phone,
        name: payload.user?.name,
      });

      onLogin();
      onClose();
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendEmailOtp(sourceEmail?: string) {
    const emailInput = (sourceEmail ?? email).trim().toLowerCase();

    if (!isEmailValid(emailInput)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    resetNotice();

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailInput }),
      });

      const payload = (await response.json()) as AuthResponse;
      if (!response.ok || !payload.success) {
        setError(payload.message || "Unable to send email sign-in link");
        return;
      }

      localStorage.setItem(EMAIL_LINK_KEY, emailInput);
      setEmail(emailInput);
      setOtp("");
      setStep("email-otp");
      setResendIn(payload.resendAfterSeconds ?? 30);
      setInfo(`Sign-in link sent to ${emailInput}. Email open karke link par click karo.`);
    } catch {
      setError("Unable to send email link right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function completeEmailLinkLogin() {
    const auth = getFirebaseClientAuth();
    const href = window.location.href;

    if (!isSignInWithEmailLink(auth, href)) {
      setError("Email link open karne ke baad hi login complete hoga.");
      return;
    }

    const savedEmail = localStorage.getItem(EMAIL_LINK_KEY) || email;
    if (!savedEmail) {
      setError("Email session missing hai. Dobara email link request karo.");
      return;
    }

    setIsLoading(true);
    resetNotice();

    try {
      const credential = await signInWithEmailLink(auth, savedEmail, href);
      const firebaseToken = await credential.user.getIdToken();
      const payload = await loginWithFirebaseToken({
        firebaseToken,
        provider: "email",
        name: displayName || credential.user.displayName || undefined,
      });

      localStorage.removeItem(EMAIL_LINK_KEY);
      window.history.replaceState({}, document.title, window.location.pathname);

      persistLastLogin({
        provider: "email",
        label: payload.user?.name || savedEmail,
        email: savedEmail,
        name: payload.user?.name,
      });

      onLogin();
      onClose();
    } catch {
      setError("Email link verification failed. Dobara link request karo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function continueWithGoogle() {
    setIsLoading(true);
    resetNotice();

    try {
      const callbackUrl = `${window.location.origin}/home`;
      const result = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      persistLastLogin({
        provider: "google",
        label: lastLogin?.label || "Google User",
        email: lastLogin?.email,
        name: lastLogin?.name,
      });

      if (result?.url) {
        window.location.href = result.url;
        return;
      }

      window.location.href = callbackUrl;
    } catch (error) {
      setError(mapGoogleSignInError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleContinueAs() {
    if (!lastLogin) {
      return;
    }

    resetNotice();

    if (lastLogin.provider === "google") {
      await continueWithGoogle();
      return;
    }

    if (lastLogin.provider === "phone" && lastLogin.phone) {
      setError("Phone login abhi temporarily disabled hai. Email OTP ya Google se login karo.");
      setStep("email-entry");
      return;
    }

    if (lastLogin.provider === "email" && lastLogin.email) {
      setEmail(lastLogin.email);
      setStep("email-entry");
      await sendEmailOtp(lastLogin.email);
    }
  }

  function handleResendOtp() {
    if (resendIn > 0) {
      return;
    }

    if (step === "phone-otp") {
      void sendPhoneOtp();
      return;
    }

    if (step === "email-otp") {
      void sendEmailOtp();
    }
  }

  function renderHeader() {
    if (step === "welcome") {
      return null;
    }

    return (
      <div className="w-full flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => {
            resetNotice();
            setOtp("");
            setStep("welcome");
          }}
          className="flex items-center gap-2 text-sm font-bold text-[#002f34]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X size={26} />
        </button>
      </div>
    );
  }

  function renderStatus() {
    if (!error && !info) {
      return null;
    }

    return (
      <div className="w-full mt-4 space-y-2">
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        {info ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {info}
          </div>
        ) : null}
      </div>
    );
  }

  function renderOtpResend() {
    if (!isOtpStep) {
      return null;
    }

    return (
      <button
        type="button"
        onClick={handleResendOtp}
        disabled={resendIn > 0 || isLoading}
        className="mt-3 text-sm font-bold text-[#002f34] disabled:text-slate-400"
      >
        {resendIn > 0
          ? `Resend in ${resendIn}s`
          : step === "email-otp"
            ? "Resend Email Link"
            : "Resend OTP"}
      </button>
    );
  }

  function renderWelcome() {
    return (
      <>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-all"
        >
          <X size={32} strokeWidth={1.5} />
        </button>

        <button
          onClick={() => setActiveIndex((activeIndex - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length)}
          className="absolute left-2 top-[35%] -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={() => setActiveIndex((activeIndex + 1) % CAROUSEL_ITEMS.length)}
          className="absolute right-2 top-[35%] -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
        >
          <ChevronRight size={32} />
        </button>

        <div className="h-48 flex flex-col items-center justify-center mb-6">
          <div className="mb-8 transform transition-all duration-700 animate-in zoom-in-50">
            {CAROUSEL_ITEMS[activeIndex].icon}
          </div>
          <h2 className="text-[19px] font-black text-center text-[#002f34] leading-tight px-4 max-w-[280px] tracking-tight">
            {welcomeTitle}
          </h2>
        </div>

        <div className="flex gap-2 mb-10">
          {CAROUSEL_ITEMS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? "bg-blue-600" : "bg-slate-200"}`}
            ></div>
          ))}
        </div>

        <div className="w-full space-y-3">
          {lastLogin && lastLogin.provider !== "phone" ? (
            <button
              type="button"
              onClick={() => void handleContinueAs()}
              disabled={isLoading}
              className="w-full border border-slate-200 py-3.5 rounded-lg flex items-center justify-between px-4 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[14px]">
                  {lastLogin.label.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[14px] font-bold text-slate-700">
                    Continue as {lastLogin.label}
                  </span>
                  <span className="text-[12px] text-slate-400 mt-0.5">
                    {lastLogin.email || lastLogin.phone || lastLogin.provider}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                ) : (
                  <ChevronRight size={16} className="text-slate-400" />
                )}
                <svg
                  className="w-6 h-6 border p-1 rounded-sm border-slate-100"
                  viewBox="0 0 24 24"
                >
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
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => void continueWithGoogle()}
            disabled={isLoading}
            className="w-full border border-slate-200 py-3.5 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm text-slate-700 font-bold disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => {
              resetNotice();
              setStep("email-entry");
            }}
            className="w-full bg-[#002f34] text-white py-3.5 rounded-lg font-bold hover:opacity-95 transition-opacity"
          >
            Continue with Email OTP
          </button>
        </div>
      </>
    );
  }

  function renderPhoneEntry() {
    if (!isFirebaseClientConfigured) {
      return (
        <div className="w-full">
          <h2 className="text-2xl font-black text-[#002f34] mb-2">Phone Login</h2>
          <p className="text-sm text-slate-500 mb-5">
            Firebase setup complete hone ke baad phone OTP available hoga.
          </p>
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 space-y-2">
            <p className="font-semibold">Firebase client setup pending</p>
            <p>.env me ye values real credentials se set karo:</p>
            <p>NEXT_PUBLIC_FIREBASE_API_KEY</p>
            <p>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</p>
            <p>NEXT_PUBLIC_FIREBASE_PROJECT_ID</p>
            <p>NEXT_PUBLIC_FIREBASE_APP_ID</p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetNotice();
              setStep("email-entry");
            }}
            className="w-full mt-2 border border-slate-200 py-3 rounded-lg font-bold text-[#002f34] hover:bg-slate-50 transition-colors"
          >
            Use Email OTP Instead
          </button>
        </div>
      );
    }

    return (
      <div className="w-full">
        <h2 className="text-2xl font-black text-[#002f34] mb-2">Phone Login</h2>
        <p className="text-sm text-slate-500 mb-5">
          Enter your phone number to receive OTP via Firebase.
        </p>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+919876543210"
          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:ring-4 ring-blue-100"
        />
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Name (optional)"
          className="w-full mt-3 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:ring-4 ring-blue-100"
        />
        <button
          type="button"
          onClick={() => void sendPhoneOtp()}
          disabled={isLoading}
          className="w-full mt-4 bg-[#002f34] text-white py-3 rounded-lg font-bold disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          Send OTP
        </button>
        <button
          type="button"
          onClick={() => {
            resetNotice();
            setStep("email-entry");
          }}
          className="w-full mt-3 border border-slate-200 py-3 rounded-lg font-bold text-[#002f34] hover:bg-slate-50 transition-colors"
        >
          Use Email OTP Instead
        </button>
      </div>
    );
  }

  function renderPhoneOtp() {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-black text-[#002f34] mb-2">Verify Phone OTP</h2>
        <p className="text-sm text-slate-500 mb-5">Enter the 6-digit OTP sent to {phone}</p>
        <input
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={(event) =>
            setOtp(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
          }
          placeholder="123456"
          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-center tracking-[0.3em] text-lg font-bold outline-none focus:ring-4 ring-blue-100"
        />
        <button
          type="button"
          onClick={() => void verifyPhoneOtp()}
          disabled={isLoading}
          className="w-full mt-4 bg-[#002f34] text-white py-3 rounded-lg font-bold disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          Verify OTP
        </button>
        {renderOtpResend()}
      </div>
    );
  }

  function renderEmailEntry() {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-black text-[#002f34] mb-2">Email Login</h2>
        <p className="text-sm text-slate-500 mb-5">
          Enter your email and we will send a secure sign-in link.
        </p>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:ring-4 ring-blue-100"
        />
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Name (optional)"
          className="w-full mt-3 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:ring-4 ring-blue-100"
        />
        <button
          type="button"
          onClick={() => void sendEmailOtp()}
          disabled={isLoading}
          className="w-full mt-4 bg-[#002f34] text-white py-3 rounded-lg font-bold disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          Send Link
        </button>
      </div>
    );
  }

  function renderEmailOtp() {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-black text-[#002f34] mb-2">Check Your Email</h2>
        <p className="text-sm text-slate-500 mb-5">
          We sent a secure sign-in link to {email}. Email open karke us link par click karo.
        </p>
        <button
          type="button"
          onClick={() => void completeEmailLinkLogin()}
          disabled={isLoading}
          className="w-full mt-4 bg-[#002f34] text-white py-3 rounded-lg font-bold disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          I Opened The Link
        </button>
        {renderOtpResend()}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center transition-all animate-in fade-in duration-300">
      <div className="w-full max-w-sm flex flex-col items-center px-8 relative">
        {renderHeader()}

        {step === "welcome" ? renderWelcome() : null}
        {PHONE_LOGIN_ENABLED && step === "phone-entry" ? renderPhoneEntry() : null}
        {PHONE_LOGIN_ENABLED && step === "phone-otp" ? renderPhoneOtp() : null}
        {step === "email-entry" ? renderEmailEntry() : null}
        {step === "email-otp" ? renderEmailOtp() : null}

        {renderStatus()}

        <div className="mt-12 text-center space-y-4 px-4">
          <p className="text-[12px] text-slate-400 font-medium tracking-tight">
            All your personal details are safe with us.
          </p>
          <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
            If you continue, you are accepting
            <span className="text-blue-500 font-bold"> Rentro Terms and Conditions and Privacy Policy</span>
          </p>
        </div>
      </div>

      {PHONE_LOGIN_ENABLED ? (
        <div id="rentro-recaptcha" className="absolute -left-[9999px] -top-[9999px]" />
      ) : null}
    </div>
  );
}
