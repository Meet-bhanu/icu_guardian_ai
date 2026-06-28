import LoginLayout from "@/components/LoginLayout";

export default function DoctorLogin() {
  return (
    <LoginLayout
      title="Doctor Login"
      subtitle="Sign in to access the ICU monitoring dashboard"
      role="doctor"
      imageGradient="bg-gradient-to-br from-primary to-green-700"
      imageLabel="Hospital Monitoring System"
    />
  );
}
