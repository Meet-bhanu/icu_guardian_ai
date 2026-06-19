import LoginLayout from "@/components/LoginLayout";

export default function PatientLogin() {
  return (
    <LoginLayout
      title="Patient Login"
      subtitle="Sign in to access your health records and monitoring data"
      role="patient"
      imageGradient="bg-gradient-to-br from-primary to-green-700"
      imageLabel="Hospital Monitoring System"
    />
  );
}
