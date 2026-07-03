"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconEye, IconEyeOff, IconLock } from "@tabler/icons-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Background from "@/app/_components/background";
import { toast } from "sonner";
import { Turnstile } from "@/components/cloudflare";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace("/");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
          token,
          cloudflare: turnstileToken,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Something went wrong");
        return;
      }

      setSuccess(true);
    } catch {
      toast.error("Couldn't reach the server, try again");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <Background />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-5">
        <Image
          src="/logo.webp"
          alt="Jury"
          width={48}
          height={48}
          className="rounded-xl"
        />
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[22px] font-bold tracking-tight">
            {success ? "Password reset" : "Set a new password"}
          </h1>
          <p className="text-sm text-white/40">
            {success ? (
              <>
                You can now{" "}
                <Link
                  href="/auth"
                  className="text-white/80 font-medium hover:text-white transition-colors"
                >
                  log in
                </Link>
              </>
            ) : (
              "Choose a new password for your account"
            )}
          </p>
        </div>

        {!success && (
          <div className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-4">
            <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] font-semibold text-white/80">
                  New password
                </Label>
                <InputGroup className="py-4 px-1">
                  <InputGroupAddon>
                    <IconLock size={15} className="text-white/30" />
                  </InputGroupAddon>
                  <InputGroupInput
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    className="!pl-2 text-white text-sm"
                    minLength={8}
                    maxLength={128}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? (
                        <IconEyeOff size={15} />
                      ) : (
                        <IconEye size={15} />
                      )}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] font-semibold text-white/80">
                  Confirm password
                </Label>
                <InputGroup className="py-4 px-1">
                  <InputGroupAddon>
                    <IconLock size={15} className="text-white/30" />
                  </InputGroupAddon>
                  <InputGroupInput
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="!pl-2 text-white text-sm"
                    minLength={8}
                    maxLength={128}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <IconEyeOff size={15} />
                      ) : (
                        <IconEye size={15} />
                      )}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                options={{ size: "flexible" }}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
              />

              <Button
                type="submit"
                variant="outline"
                className="h-10 text-sm"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
