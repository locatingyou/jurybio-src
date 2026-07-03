"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  IconUser,
  IconMail,
  IconLink,
  IconLock,
  IconKey,
  IconLinkOff,
  IconEye,
  IconEyeOff,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconX,
  IconArrowRight,
} from "@tabler/icons-react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaDiscord, FaSpotify } from "react-icons/fa6";
import Link from "next/link";
import { SettingsSaveBar } from "./_components/SettingsSaveBar";
import { useUser } from "../_user-provider";
import { updateAccount } from "@/lib/api/data/users/updateAccount";

interface User {
  username: string;
  email: string;
  url: string;
  discordId?: string | null;
  discordUsername?: string | null;
  spotifyId?: string | null;
  spotifyDisplayName?: string | null;
}

interface SessionRow {
  id: string;
  os: string | null;
  browser: string | null;
  ip: string | null;
  isActive: boolean;
  lastActive: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

function formatSessionDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function sessionDeviceLabel(s: Pick<SessionRow, "os" | "browser">) {
  if (s.os && s.browser) return `${s.os} - ${s.browser}`;
  return s.os ?? s.browser ?? "Unknown device";
}

function SessionDeviceIcon({ os }: { os: string | null }) {
  const mobile = os ? /android|ios|iphone|ipad/i.test(os) : false;
  return mobile ? (
    <IconDeviceMobile size={18} className="text-muted-foreground" />
  ) : (
    <IconDeviceDesktop size={18} className="text-muted-foreground" />
  );
}

export default function SettingsClientPage({
  initialUser,
  initialSessions,
}: {
  initialUser: User;
  initialSessions: SessionRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: globalUser, setUser: setGlobalUser } = useUser();
  const [user, setUser] = useState<User>(initialUser);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDisconnectingDiscord, setIsDisconnectingDiscord] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState("ABCDEF123456");
  const [twoFASetupCode, setTwoFASetupCode] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isDisconnectingSpotify, setIsDisconnectingSpotify] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>(initialSessions);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );
  const [isRevokingAllSessions, setIsRevokingAllSessions] = useState(false);
  const [isSessionsDialogOpen, setIsSessionsDialogOpen] = useState(false);

  const currentSession = sessions.find((s) => s.isCurrent) ?? null;
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  const handleSyncBadges = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/badges/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sync");
      toast.success("Discord successfully synced!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to sync Discord",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const discordConnected = searchParams.get("discord_connected");
    const spotifyConnected = searchParams.get("spotify_connected");
    const error = searchParams.get("error");
    if (discordConnected === "true") {
      toast.success("Successfully connected Discord account!");
      router.replace("/dashboard/settings");
    } else if (spotifyConnected === "true") {
      toast.success("Successfully connected Spotify account!");
      router.replace("/dashboard/settings");
    } else if (error) {
      toast.error(`Connection failed: ${error.replace(/_/g, " ")}`);
      router.replace("/dashboard/settings");
    }
  }, [searchParams, router]);

  const handleDisconnectDiscord = async () => {
    setIsDisconnectingDiscord(true);
    try {
      const res = await fetch("/api/discord/disconnect", {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Disconnected Discord account");
      setUser((prev) => ({ ...prev, discordId: null, discordUsername: null }));
    } catch {
      toast.error("Failed to disconnect Discord account");
    } finally {
      setIsDisconnectingDiscord(false);
    }
  };

  const handleDisconnectSpotify = async () => {
    setIsDisconnectingSpotify(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disconnectProvider: "spotify" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Disconnected Spotify account");
      setUser((prev) => ({
        ...prev,
        spotifyId: null,
        spotifyDisplayName: null,
      }));
    } catch {
      toast.error("Failed to disconnect Spotify account");
    } finally {
      setIsDisconnectingSpotify(false);
    }
  };

  const handleFieldChange = (field: keyof User, value: string) => {
    const sanitized = field === "url" ? value.replace(/\s+/g, "") : value;
    setUser((prev) => {
      const next = { ...prev, [field]: sanitized };
      const dirty =
        next.username !== initialUser.username ||
        next.email !== initialUser.email ||
        next.url !== initialUser.url;
      setIsDirty(dirty);
      return next;
    });
  };

  const handleSaveAccount = async () => {
    if (!user.username || user.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      throw new Error();
    }
    if (!/^[a-z0-9-]+$/i.test(user.username)) {
      toast.error("Username can only contain letters, numbers, and hyphens");
      throw new Error();
    }
    if (!user.email || !user.email.includes("@")) {
      toast.error("Please enter a valid email address");
      throw new Error();
    }
    if (!user.url || user.url.trim().length === 0) {
      toast.error("URL is required");
      throw new Error();
    }

    setIsSaving(true);
    try {
      const result = await updateAccount({
        username: user.username,
        email: user.email,
        url: user.url,
      });

      if (result?.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to save settings",
        );
        throw new Error();
      }

      setIsDirty(false);
      setGlobalUser({ ...globalUser, username: user.username });
    } catch (err) {
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAccount = () => {
    setUser(initialUser);
    setIsDirty(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: {
            oldPassword,
            newPassword,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update password");
        return;
      }

      toast.success("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    setRevokingSessionId(id);
    try {
      const res = await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revokeSessionId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke session");

      if (data.revokedCurrent) {
        toast.success("Session revoked. Logging out...");
        router.replace("/auth");
        return;
      }

      toast.success("Session revoked");
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke session",
      );
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setIsRevokingAllSessions(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revokeAllOtherSessions: true }),
      });
      const data = await res.json();
      console.log("response:", data);
      console.log("sessions before:", sessions);
      if (!res.ok) throw new Error(data.error || "Failed to revoke sessions");
      toast.success("Signed out of all other sessions");
      setSessions((prev) => {
        const next = prev.filter((s) => s.isCurrent);
        console.log("sessions after filter:", next);
        return next;
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke other sessions",
      );
    } finally {
      setIsRevokingAllSessions(false);
    }
  };

  return (
    <main className="py-6 px-4 md:px-8 w-full">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-foreground font-bold text-2xl">
            Account Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your account credentials, login email, and password.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="border border-white/5 h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
                <CardDescription className="text-xs">
                  Update your login email, username, and custom bio page URL.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold">Username</Label>
                  <InputGroup className="py-4.5 px-1 bg-black/20 border-white/10">
                    <InputGroupAddon>
                      <IconUser size={16} className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      className="ml-0 !pl-2 text-white bg-transparent"
                      value={user.username}
                      onChange={(e) =>
                        handleFieldChange("username", e.target.value)
                      }
                    />
                  </InputGroup>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold">Email Address</Label>
                  <InputGroup className="py-4.5 px-1 bg-black/20 border-white/10">
                    <InputGroupAddon>
                      <IconMail size={16} className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      className={`ml-0 !pl-2 text-white bg-transparent transition-all duration-300 ${!isEmailVisible ? "blur-[5px] select-none" : ""}`}
                      type={isEmailVisible ? "email" : "text"}
                      value={user.email}
                      onChange={(e) =>
                        setUser((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <button
                        type="button"
                        onClick={() => setIsEmailVisible((v) => !v)}
                        className="text-muted-foreground hover:text-white transition-colors mr-2 cursor-pointer"
                      >
                        {isEmailVisible ? (
                          <IconEyeOff size={16} />
                        ) : (
                          <IconEye size={16} />
                        )}
                      </button>
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold">
                    Custom Page URL
                  </Label>
                  <InputGroup className="py-4.5 px-1 bg-black/20 border-white/10">
                    <InputGroupAddon>
                      <IconLink size={16} className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      className="ml-0 !pl-2 text-white bg-transparent"
                      value={user.url}
                      onChange={(e) => handleFieldChange("url", e.target.value)}
                    />
                  </InputGroup>
                  <p className="text-[11px] text-muted-foreground">
                    This determines your public profile path: jury.lat/
                    {user.url}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className="relative isolate border h-full flex flex-col overflow-hidden"
                style={{
                  borderColor: "rgba(88, 101, 242, 0.25)",
                  background:
                    "radial-gradient(140% 120% at 0% 0%, rgba(88,101,242,0.16) 0%, rgba(88,101,242,0.04) 40%, transparent 70%)",
                }}
              >
                <div className="absolute -right-8 -bottom-8 -z-10 text-[#5865F2]/[0.18] pointer-events-none">
                  <FaDiscord size={170} />
                </div>
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <FaDiscord className="text-[#5865F2] size-5" />
                      Discord Connection
                    </CardTitle>
                    <CardDescription className="text-xs text-white/70">
                      Connect your account to enable Discord status presence and
                      sync your badges.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  {user.discordId ? (
                    <div className="flex flex-col h-full pt-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          Connected
                        </span>
                        <span className="text-xs text-white/50">
                          Linked as @{user.discordUsername}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-auto justify-end">
                        <Button
                          onClick={handleSyncBadges}
                          disabled={isSyncing}
                          variant="outline"
                          size="lg"
                          className="rounded-xl flex items-center gap-2 cursor-pointer bg-black/30 border-white/10"
                        >
                          {isSyncing ? (
                            <>
                              <AiOutlineLoading3Quarters className="h-3.5 w-3.5 animate-spin" />{" "}
                              Syncing
                            </>
                          ) : (
                            <>Sync</>
                          )}
                        </Button>
                        <Button
                          onClick={handleDisconnectDiscord}
                          disabled={isDisconnectingDiscord}
                          variant="destructive"
                          className="rounded-xl flex items-center gap-2 cursor-pointer"
                          size="lg"
                        >
                          <IconLinkOff size={14} /> Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">
                          Not Connected
                        </span>
                        <span className="text-xs text-white/50">
                          Link your Discord account to get started.
                        </span>
                      </div>
                      <Button
                        asChild
                        variant="discord"
                        className="rounded-xl flex items-center gap-2 self-start md:self-auto cursor-pointer"
                        size="lg"
                      >
                        <Link href="/api/auth/discord">
                          <FaDiscord size={16} /> Connect Discord
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card
                className="relative isolate border h-full flex flex-col overflow-hidden transition-colors duration-500 opacity-60"
                style={{
                  borderColor: user.spotifyId
                    ? "rgba(30, 215, 96, 0.35)"
                    : "rgba(30, 215, 96, 0.2)",
                  background:
                    "radial-gradient(140% 120% at 0% 0%, rgba(30,215,96,0.16) 0%, rgba(30,215,96,0.04) 40%, transparent 70%)",
                }}
              >
                <div className="absolute -right-8 -bottom-8 -z-10 text-[#1ED760]/[0.18] pointer-events-none">
                  <FaSpotify size={170} />
                </div>
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <FaSpotify className="text-[#1ED760] size-5" />
                      Spotify Connection
                    </CardTitle>
                    <CardDescription className="text-xs text-white/70">
                      Connect your Spotify account to show what you&apos;re
                      listening to on your profile.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  {user.spotifyId ? (
                    <div className="flex flex-col h-full justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#1ED760] animate-pulse" />
                          Connected
                        </span>
                        <span className="text-xs text-white/50">
                          Linked as @{user.spotifyDisplayName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-auto justify-end">
                        <Button
                          onClick={handleDisconnectSpotify}
                          disabled={isDisconnectingSpotify}
                          variant="destructive"
                          className="rounded-xl flex items-center gap-2 cursor-pointer"
                          size="lg"
                        >
                          <IconLinkOff size={16} /> Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">
                          Not Connected
                        </span>
                        <span className="text-xs text-white/50">
                          Link your Spotify account to get started.
                        </span>
                      </div>
                      <Button
                        className="rounded-xl flex items-center gap-2 self-start md:self-auto cursor-pointer bg-[#1ED760] hover:bg-[#1ED760]/90 text-black border-0"
                        size="lg"
                        disabled
                      >
                        <FaSpotify size={16} /> Connect Spotify
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="border border-white/5 h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Security & Password</CardTitle>
                <CardDescription className="text-xs">
                  Change your password to secure your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleUpdatePassword}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">
                      Current Password
                    </Label>
                    <InputGroup className="py-4.5 px-1 bg-black/20 border-white/10">
                      <InputGroupAddon>
                        <IconKey size={16} className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        className="ml-0 !pl-2 text-white bg-transparent"
                        type="password"
                        placeholder="••••••••"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                    </InputGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-semibold">
                        New Password
                      </Label>
                      <InputGroup className="py-4.5 px-1 bg-black/20 border-white/10">
                        <InputGroupAddon>
                          <IconLock
                            size={16}
                            className="text-muted-foreground"
                          />
                        </InputGroupAddon>
                        <InputGroupInput
                          className="ml-0 !pl-2 text-white bg-transparent"
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </InputGroup>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-semibold">
                        Confirm New Password
                      </Label>
                      <InputGroup className="py-4.5 px-1 bg-black/20 border-white/10">
                        <InputGroupAddon>
                          <IconLock
                            size={16}
                            className="text-muted-foreground"
                          />
                        </InputGroupAddon>
                        <InputGroupInput
                          className="ml-0 !pl-2 text-white bg-transparent"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </InputGroup>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full md:w-auto self-end mt-2 rounded-xl cursor-pointer"
                    size="lg"
                    variant="outline"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>

                {/* --- Session Management (inlined) --- */}
                <div className="mt-6 border-t border-white/5 pt-6 flex flex-col gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Session Management
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      View and manage your active login sessions.
                    </p>
                  </div>

                  {currentSession ? (
                    <div className="bg-black/60 border border-white/10 rounded-xl px-4 py-4 flex items-center gap-3">
                      <div className="bg-white/5 rounded-lg p-2.5 shrink-0">
                        <SessionDeviceIcon os={currentSession.os} />
                      </div>
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span className="text-sm font-semibold text-white flex items-center gap-2 flex-wrap">
                          {sessionDeviceLabel(currentSession)}
                          <span className="text-[10px] uppercase tracking-wide bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        </span>
                        <span className="text-xs text-white/50 truncate">
                          {currentSession.ip ?? "Unknown"} · Last active:{" "}
                          {formatSessionDate(currentSession.lastActive)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black/20 border border-white/10 rounded-xl px-4 py-6 text-center text-xs text-muted-foreground">
                      No active session found.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsSessionsDialogOpen(true)}
                    className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors cursor-pointer self-start"
                  >
                    Manage All <IconArrowRight size={14} />
                  </button>

                  <Dialog
                    open={isSessionsDialogOpen}
                    onOpenChange={setIsSessionsDialogOpen}
                  >
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Active Sessions</DialogTitle>
                        <DialogDescription>
                          These are the devices currently signed in to your
                          account.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="flex flex-col gap-2 mt-2 max-h-[60vh] overflow-y-auto pr-1">
                        {sessions.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between gap-3 bg-black/20 border border-white/10 rounded-xl px-4 py-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <SessionDeviceIcon os={s.os} />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-white flex items-center gap-2 truncate">
                                  {sessionDeviceLabel(s)}
                                  {s.isCurrent && (
                                    <span className="text-[10px] uppercase tracking-wide bg-white/10 text-white/80 px-1.5 py-0.5 rounded-md shrink-0">
                                      Current
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-white/50 truncate">
                                  {s.ip ?? "Unknown"} · Last active:{" "}
                                  {formatSessionDate(s.lastActive)}
                                </span>
                              </div>
                            </div>

                            {!s.isCurrent && (
                              <Button
                                onClick={() => handleRevokeSession(s.id)}
                                disabled={revokingSessionId === s.id}
                                variant="ghost"
                                size="icon"
                                className="rounded-xl shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
                              >
                                {revokingSessionId === s.id ? (
                                  <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                                ) : (
                                  <IconX size={16} />
                                )}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {otherSessions.length > 0 && (
                        <Button
                          onClick={handleRevokeAllOtherSessions}
                          disabled={isRevokingAllSessions}
                          variant="destructive"
                          className="w-full rounded-xl cursor-pointer mt-2"
                        >
                          {isRevokingAllSessions ? (
                            <>
                              <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                              Revoking...
                            </>
                          ) : (
                            "Sign out all other sessions"
                          )}
                        </Button>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <SettingsSaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSaveAccount}
        onReset={handleResetAccount}
      />
    </main>
  );
}
