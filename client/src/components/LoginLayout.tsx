import { useState } from "react";
import { useLocation } from "wouter";
import { Heart, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";

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
    setLocation("/dashboard");
  };

  const handleOAuthLogin = () => {
    const url = getLoginUrl();
    if (url !== "#") {
      window.location.href = url;
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Login Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">ICU Guardian AI</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-500 mt-2">{subtitle}</p>
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
              <Label htmlFor="remember" className="text-sm text-gray-600 font-normal cursor-pointer">
                Remember me
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold">
              Login
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-500">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11"
            onClick={handleOAuthLogin}
          >
            Sign in with SSO
          </Button>

          <p className="text-center text-sm text-gray-500">
            {role === "admin" ? (
              <>
                Patient login?{" "}
                <button
                  onClick={() => setLocation("/login/patient")}
                  className="text-primary font-medium hover:underline"
                >
                  Click here
                </button>
              </>
            ) : (
              <>
                Admin login?{" "}
                <button
                  onClick={() => setLocation("/login/admin")}
                  className="text-primary font-medium hover:underline"
                >
                  Click here
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Image Side */}
      <div
        className={`hidden lg:flex flex-1 ${imageGradient} items-center justify-center relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white px-12">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Heart className="w-16 h-16" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{imageLabel}</h2>
          <p className="text-lg text-white/80 max-w-sm mx-auto">
            Advanced AI-powered patient monitoring for critical care excellence
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
