"use client";
import { Suspense, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconUser,
  IconSendFilled,
} from "@tabler/icons-react";
import { FaDiscord } from "react-icons/fa6";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Background from "@/app/_components/background";
import { toast } from "sonner";
import { Turnstile } from "@/components/cloudflare";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ForgotPasswordDialog() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const resetTurnstileRef = useRef<{
    reset: () => void;
    getResponse: () => string | null;
  }>(null);

  const handleSendReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = resetToken;

    if (!token) {
      toast.error("Please complete the verification challenge");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          cloudflare: token,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errors = json.error;
        if (typeof errors === "object" && errors) {
          const first = Object.values(errors)[0] as string[];
          toast.error(first?.[0] ?? "Something went wrong");
        } else {
          toast.error(json.error ?? "Something went wrong");
        }
        resetTurnstileRef.current?.reset();
        setResetToken(null);
        return;
      }

      toast.success("If that email exists, a reset link is on its way.");
      setOpen(false);
      setEmail("");
    } catch {
      toast.error("Couldn't reach the server, try again");
      resetTurnstileRef.current?.reset();
      setResetToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setEmail("");
          setResetToken(null);
          resetTurnstileRef.current?.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <span className="text-xs text-white/30 cursor-pointer hover:text-white/50 transition-colors">
          Forgot password?
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Reset Your Password</DialogTitle>
        <form className="flex flex-col gap-3.5" onSubmit={handleSendReset}>
          <InputGroup className="py-4 px-1">
            <InputGroupAddon>
              <IconMail size={15} className="text-white/30" />
            </InputGroupAddon>
            <InputGroupInput
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!pl-2 text-white text-sm placeholder:text-white/20"
              placeholder="you@example.com"
              required
            />
          </InputGroup>
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            options={{ size: "flexible" }}
            onSuccess={(token) => setResetToken(token)}
            onExpire={() => setResetToken(null)}
          />
          <Button type="submit" disabled={loading || !resetToken}>
            <IconSendFilled />
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isRegister = searchParams.get("mode") === "register";
  const prefillUsername = searchParams.get("url") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef<{
    reset: () => void;
    getResponse: () => string | null;
  }>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = turnstileToken;
    if (!token) {
      toast.error("Please complete the verification challenge");
      return;
    }

    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          cloudflare: token,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const errors = json.error;
        if (typeof errors === "object") {
          const first = Object.values(errors)[0] as string[];
          toast.error(first?.[0] ?? "Something went wrong");
        } else {
          toast.error(json.error ?? "Something went wrong");
        }
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }

      if (isRegister) {
        toast.success("Account created! You can now log in.");
        router.push("/auth");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Couldn't reach the server, try again");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <Background />
      <TooltipProvider>
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
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-white/40">
              {isRegister ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/auth"
                    className="text-white/80 font-medium hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth?mode=register"
                    className="text-white/80 font-medium hover:text-white transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </p>
          </div>

          <div className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-4">
            <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
              {isRegister && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[13px] font-semibold text-white/80">
                      URL{" "}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-pink-500 cursor-help">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Your profile will be at this URL
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <InputGroup className="py-4 px-1">
                      <InputGroupAddon>
                        <span className="text-xs text-white/30 font-medium">
                          jury.lat/
                        </span>
                      </InputGroupAddon>
                      <InputGroupInput
                        name="url"
                        className="!pl-2 text-white text-sm placeholder:text-white/20"
                        placeholder="..."
                        defaultValue={prefillUsername}
                        required
                      />
                    </InputGroup>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[13px] font-semibold text-white/80">
                      Username{" "}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-pink-500 cursor-help">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Choose a unique username for your profile
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <InputGroup className="py-4 px-1">
                      <InputGroupAddon>
                        <IconUser size={15} className="text-white/30" />
                      </InputGroupAddon>
                      <InputGroupInput
                        name="username"
                        className="!pl-2 text-white text-sm placeholder:text-white/20"
                        placeholder=""
                        defaultValue={prefillUsername}
                        required
                      />
                    </InputGroup>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] font-semibold text-white/80">
                  {isRegister ? (
                    <>
                      Email{" "}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-pink-500 cursor-help">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            We&apos;ll use this to verify your account
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    "Email"
                  )}
                </Label>
                <InputGroup className="py-4 px-1">
                  <InputGroupAddon>
                    <IconMail size={15} className="text-white/30" />
                  </InputGroupAddon>
                  <InputGroupInput
                    name="email"
                    type="email"
                    className="!pl-2 text-white text-sm placeholder:text-white/20"
                    placeholder="you@example.com"
                    required
                  />
                </InputGroup>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[13px] font-semibold text-white/80">
                    Password{" "}
                    {isRegister && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-pink-500 cursor-help">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Must be at least 8 characters
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </Label>
                  {!isRegister && <ForgotPasswordDialog />}
                </div>
                <InputGroup className="py-4 px-1">
                  <InputGroupAddon>
                    <IconLock size={15} className="text-white/30" />
                  </InputGroupAddon>
                  <InputGroupInput
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="!pl-2 text-white text-sm"
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
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                options={{ size: "flexible" }}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
              />
              <Button
                type="submit"
                variant={"outline"}
                className="h-10 text-sm"
                disabled={loading}
              >
                {loading
                  ? isRegister
                    ? "Creating..."
                    : "Logging in..."
                  : isRegister
                    ? "Create Account"
                    : "Log in"}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-[11px] text-white/25 uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            <Button
              variant="discord"
              className="w-full h-10 text-sm font-medium gap-2.5"
              disabled
            >
              <FaDiscord size={15} />
              Continue with Discord
            </Button>
          </div>

          {isRegister && (
            <p className="text-[11px] text-white/25 text-center">
              By creating an account, you agree to our{" "}
              <Link
                href="/legal/terms"
                className="hover:text-white/45 transition-colors"
              >
                Terms of Service
              </Link>
            </p>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
