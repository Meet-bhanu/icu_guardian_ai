import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Heart, Eye, EyeOff, RefreshCw, Info, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { setPatientSession } from "@/lib/patientSession";
import { cn } from "@/lib/utils";

interface LoginLayoutProps {
  title: string;
  subtitle: string;
  role: "admin" | "patient";
  imageGradient: string;
  imageLabel: string;
}

export default function LoginLayout({
  title,
  subtitle,
  role,
  imageGradient,
  imageLabel,
}: LoginLayoutProps) {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(""); // acts as email address
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setCaptchaInput("");
    setCaptchaError("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setCaptchaError("");

    // 1. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      setEmailError("enter a valid email");
      return;
    }

    // 2. Password Strength Validation
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least 1 uppercase letter");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError("Password must contain at least 1 lowercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError("Password must contain at least 1 numerical character");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError("Password must contain at least 1 special character");
      return;
    }

    // 3. Captcha Validation
    if (captchaInput.trim().toUpperCase() !== captchaText) {
      setCaptchaError("enter valid captcha");
      generateCaptcha();
      return;
    }

    if (role === "patient") {
      const match = username.match(/^p(\d+)/i);
      const patientId = match ? `P${match[1].padStart(3, "0")}` : "P001";
      sessionStorage.removeItem("icu-admin-logged-in");
      setPatientSession({
        patientId,
        name: username.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
        email: username,
        role: "patient",
        bedNo: `ICU-0${patientId.replace(/\D/g, "") || "1"}`,
      });
      setLocation("/patient/dashboard");
      return;
    }
    sessionStorage.removeItem("icu-patient-session");
    sessionStorage.setItem("icu-admin-logged-in", "true");
    setLocation("/dashboard");
  };

  const handleOAuthLogin = () => {
    const url = getLoginUrl();
    if (url !== "#") {
      window.location.href = url;
    } else if (role === "patient") {
      setPatientSession({
        patientId: "P001",
        name: "John Smith",
        email: "patient@healthhalo.com",
        role: "patient",
        bedNo: "ICU-01",
      });
      setLocation("/patient/dashboard");
    } else {
      sessionStorage.setItem("icu-admin-logged-in", "true");
      setLocation("/dashboard");
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
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-2 font-medium">{subtitle}</p>
          </div>

          {role === "patient" && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  Patient Portal Access
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Welcome to your secure patient workspace. Here you can monitor your health metrics, view prescribed medication logs, consult assigned doctors, and view family contact listings.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Live Health Vitals
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Assigned Doctors
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Medication Schedules
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Family Alert Feed
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-xs space-y-1">
                <p className="font-semibold text-amber-800 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  Demonstration Credentials:
                </p>
                <p className="text-amber-700 mt-1">
                  Email: <span className="font-mono font-bold select-all text-amber-900 bg-amber-100/50 px-1 py-0.5 rounded">p001@patient.healthhalo.com</span>
                </p>
                <p className="text-amber-700">
                  Password: <span className="font-mono font-bold select-all text-amber-900 bg-amber-100/50 px-1 py-0.5 rounded">SecureP@ss123</span>
                </p>
              </div>
            </div>
          )}
          {role === "admin" && (
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-xs space-y-1">
              <p className="font-semibold text-amber-800 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Admin Demonstration Credentials:
              </p>
              <p className="text-amber-700 mt-1">
                Email: <span className="font-mono font-bold select-all text-amber-900 bg-amber-100/50 px-1 py-0.5 rounded">admin@healthhalo.com</span>
              </p>
              <p className="text-amber-700">
                Password: <span className="font-mono font-bold select-all text-amber-900 bg-amber-100/50 px-1 py-0.5 rounded">AdminP@ss123</span>
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Email Address</Label>
              <Input
                id="username"
                type="email"
                placeholder={role === "admin" ? "admin@healthhalo.com" : "p001@patient.healthhalo.com"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={cn("h-11", emailError && "border-red-500 focus-visible:ring-red-400")}
              />
              {emailError && (
                <p className="text-xs font-semibold text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn("h-11 pr-10", passwordError && "border-red-500 focus-visible:ring-red-400")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs font-semibold text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            {/* Captcha Section */}
            <div className="space-y-2">
              <Label htmlFor="captcha">Verification Code</Label>
              <div className="flex gap-2 items-center">
                <div
                  className="h-11 flex-1 bg-gray-100 rounded-md flex items-center justify-center font-mono text-xl font-bold tracking-widest text-primary border border-dashed border-gray-300 select-none relative overflow-hidden"
                  style={{
                    textDecoration: "line-through",
                    fontStyle: "italic",
                    background: "linear-gradient(45deg, #f3f4f6 25%, #e5e7eb 25%, #e5e7eb 50%, #f3f4f6 50%, #f3f4f6 75%, #e5e7eb 75%, #e5e7eb 100%)",
                    backgroundSize: "20px 20px"
                  }}
                >
                  <span className="relative z-10 text-gray-700 drop-shadow">{captchaText}</span>
                  <div className="absolute inset-0 bg-black/5 mix-blend-overlay pointer-events-none" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={generateCaptcha}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <Input
                id="captcha"
                placeholder="Enter captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className={cn("h-11", captchaError && "border-red-500 focus-visible:ring-red-400")}
              />
              {captchaError && (
                <p className="text-xs font-semibold text-red-500 mt-1">{captchaError}</p>
              )}
            </div>

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

            <Button type="submit" className="w-full h-11 font-semibold shadow-md shadow-primary/20">
              Login
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-3 text-muted-foreground font-medium">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 font-semibold border-border"
            onClick={handleOAuthLogin}
          >
            Sign in with SSO
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {role === "admin" ? (
              <>
                Patient login?{" "}
                <button
                  onClick={() => setLocation("/login/patient")}
                  className="text-primary font-semibold hover:underline"
                >
                  Click here
                </button>
              </>
            ) : (
              <>
                Admin login?{" "}
                <button
                  onClick={() => setLocation("/login/admin")}
                  className="text-primary font-semibold hover:underline"
                >
                  Click here
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 hh-gradient-bg items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(1_0_0/0.15),transparent_50%)]" />
        <div className="relative z-10 text-center text-white px-12">
          <div className="w-36 h-36 mx-auto mb-8 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/25 shadow-2xl">
            <Heart className="w-20 h-20 drop-shadow-lg" />
          </div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight drop-shadow-sm">{imageLabel}</h2>
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
