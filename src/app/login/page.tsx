"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { PALETTE } from "@/lib/palette";
import { Wordmark, Card, TextField, PrimaryButton, SecondaryButton, Eyebrow } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        setCheckEmail(true);
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh" }} className="w-full flex justify-center px-6 py-16">
      <div className="w-full flex flex-col items-center" style={{ maxWidth: 400 }}>
        <Wordmark />

        <div className="w-full mt-8">
          {checkEmail ? (
            <Card>
              <div className="p-5">
                <Eyebrow color={PALETTE.accent}>Almost there</Eyebrow>
                <div className="text-sm">
                  We sent a confirmation link to <strong>{email}</strong>. Click it, then come back here
                  and sign in.
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-5">
                <Eyebrow color={PALETTE.accent}>{mode === "signin" ? "Welcome back" : "Create your account"}</Eyebrow>
                <TextField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
                <TextField label="Password" value={password} onChange={setPassword} placeholder="••••••••" />
                {error && (
                  <div className="text-sm mb-4" style={{ color: PALETTE.accent }}>
                    {error}
                  </div>
                )}
                <PrimaryButton onClick={submit} disabled={loading} icon={mode === "signin" ? LogIn : UserPlus}>
                  {loading ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
                </PrimaryButton>
              </div>
            </Card>
          )}

          {!checkEmail && (
            <SecondaryButton onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}>
              {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
            </SecondaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
