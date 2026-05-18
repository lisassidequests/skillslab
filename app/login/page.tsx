"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowRight, KeyRound, Loader2 } from "lucide-react";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.toLowerCase().endsWith(".gov.sg")) {
      setError("Only .gov.sg email addresses are accepted.");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setLoading(false);

    if (authError) {
      setError("Invalid or expired code. Please try again.");
      return;
    }

    router.push("/skills");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Singapore Government Skills Lab
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Discover and download AI skills for your team
          </p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          {step === "email" ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 leading-tight">
                    Sign in
                  </h2>
                  <p className="text-xs text-gray-500">
                    A one-time code will be sent to your email
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Work email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@agency.gov.sg"
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Send code <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-5">
                Only .gov.sg email addresses are accepted
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <KeyRound size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 leading-tight">
                    Enter your code
                  </h2>
                  <p className="text-xs text-gray-500">
                    Sent to {email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    6-digit code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    required
                    autoFocus
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Verify & sign in"
                  )}
                </button>
              </form>

              <button
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                }}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition text-center"
              >
                Use a different email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
