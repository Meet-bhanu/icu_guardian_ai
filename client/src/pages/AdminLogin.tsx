import LoginLayout from "@/components/LoginLayout";

export default function AdminLogin() {
  return (
    <LoginLayout
      title="Admin Login"
      subtitle="Sign in to access the ICU monitoring dashboard"
      role="admin"
      imageGradient="bg-gradient-to-br from-primary to-green-700"
      imageLabel="Hospital Monitoring System"
    />
  );
}
