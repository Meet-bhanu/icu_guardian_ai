import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { Heart, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIcuAuth } from "@/hooks/useIcuAuth";
import { getDashboardForRole } from "@/lib/authApi";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "patient", label: "Patient" },
] as const;

const DEMO_CREDENTIALS: Record<
  (typeof ROLES)[number]["value"],
  { username: string; password: string }
> = {
  admin: { username: "superadmin", password: "SuperAdmin@2026" },
  doctor: { username: "doc0001", password: "Doctor@2026" },
  patient: { username: "icu0001", password: "Patient@2026" },
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, user, loading } = useIcuAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("admin");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const u = params.get("username");
    const r = params.get("role");
    if (u) setUsername(u);
    if (r === "patient" || r === "doctor" || r === "admin") setRole(r);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Redirect to={getDashboardForRole(user.role)} />;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    const submittedUsername = String(formData.get("username") ?? username).trim();
    const submittedPassword = String(formData.get("password") ?? password).trim();

    if (!submittedUsername) {
      setErrors({ username: "Username is required" });
      return;
    }
    if (!submittedPassword) {
      setErrors({ password: "Password is required" });
      return;
    }

    setSubmitting(true);
    try {
      const loggedIn = await login({
        username: submittedUsername,
        password: submittedPassword,
        role: role as "admin" | "doctor" | "patient",
      });
      toast.success("Login successful");
      setLocation(getDashboardForRole(loggedIn.role));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md hh-card-elevated p-8 sm:p-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 hh-gradient-bg rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">HealthHalo</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Sign In</h1>
            <p className="text-muted-foreground mt-2 font-medium">
              Secure access to ICU Guardian AI
            </p>
          </div>

          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-xs space-y-2">
            <p className="font-semibold text-amber-800 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Login Credentials
            </p>
            <p className="text-amber-700 text-[11px]">First time? Run <span className="font-mono font-bold">npm run seed:demo</span> in terminal.</p>
            <div className="space-y-1.5 text-amber-700">
              <p><span className="font-semibold">Admin:</span> <span className="font-mono font-bold text-amber-900">superadmin</span> / <span className="font-mono font-bold text-amber-900">SuperAdmin@2026</span></p>
              <p><span className="font-semibold">Doctor:</span> <span className="font-mono font-bold text-amber-900">doc0001</span> / <span className="font-mono font-bold text-amber-900">Doctor@2026</span></p>
              <p><span className="font-semibold">Patient:</span> <span className="font-mono font-bold text-amber-900">icu0001</span> / <span className="font-mono font-bold text-amber-900">Patient@2026</span></p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
              onClick={() => {
                const demo = DEMO_CREDENTIALS[role as keyof typeof DEMO_CREDENTIALS];
                if (demo) {
                  setUsername(demo.username);
                  setPassword(demo.password);
                  toast.success("Demo credentials filled — click Login");
                }
              }}
            >
              Fill demo credentials for selected role
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="h-11">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={cn("h-11", errors.username && "border-red-500")}
                autoComplete="off"
              />
              {errors.username && (
                <p className="text-xs font-semibold text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn("h-11 pr-10", errors.password && "border-red-500")}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground font-medium cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-primary font-semibold hover:underline"
                onClick={() => toast.info("Contact your administrator to reset your password.")}
              >
                Forgot Password
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-md shadow-primary/20"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 hh-gradient-bg items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(1_0_0/0.15),transparent_50%)]" />
        <div className="relative z-10 text-center text-white px-12">
          <div className="w-36 h-36 mx-auto mb-8 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/25 shadow-2xl">
            <Heart className="w-20 h-20 drop-shadow-lg" />
          </div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">ICU Guardian AI</h2>
          <p className="text-lg text-white/95 max-w-sm mx-auto font-medium leading-relaxed">
            Advanced AI-powered patient monitoring for critical care excellence
          </p>
        </div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-sm" />
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-white/10 blur-sm" />
      </div>
    </div>
  );
}
