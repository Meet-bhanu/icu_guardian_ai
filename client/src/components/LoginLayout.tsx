import { useState } from "react";
import { useLocation } from "wouter";
import { Heart, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { setPatientSession } from "@/lib/patientSession";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "patient") {
      const patientId = username.trim() || "P001";
      setPatientSession({
        patientId,
        name: username.trim() || "John Smith",
        email: `${patientId.toLowerCase()}@patient.healthhalo.com`,
        role: "patient",
        bedNo: "ICU-01",
      });
      setLocation("/dashboard");
      return;
    }
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
      setLocation("/dashboard");
    } else {
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">
                {role === "admin" ? "Admin ID / Username" : "Patient ID / Username"}
              </Label>
              <Input
                id="username"
                placeholder={role === "admin" ? "Enter admin ID" : "Enter patient ID"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
              />
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
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
