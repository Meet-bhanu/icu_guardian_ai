import LoginLayout from "@/components/LoginLayout";

export default function PatientLogin() {
  return (
    <LoginLayout
      title="Patient Login"
      subtitle="Access your health records and monitoring data"
      role="patient"
      imageGradient="bg-gradient-to-br from-blue-600 to-primary"
      imageLabel="Your Health, Our Priority"
    />
  );
}
