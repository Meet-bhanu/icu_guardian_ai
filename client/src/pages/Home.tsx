import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Heart, Activity, AlertCircle, Pill, Users, Building2, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">ICU Guardian AI</span>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="font-semibold text-gray-900 hover:text-primary transition">Home</a>
            <a href="#about" className="font-semibold text-gray-900 hover:text-primary transition">About Us</a>
            <a href="#contact" className="font-semibold text-gray-900 hover:text-primary transition">Contact Us</a>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                <Link href={user?.role === "doctor" ? "/doctor/dashboard" : user?.role === "patient" ? "/patient/dashboard" : "/dashboard"}>
                  <Button variant="default" className="bg-primary hover:bg-primary/90">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-50">
                    Log In
                  </Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Sign Up
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">
                Hospital <span className="text-primary">Monitoring</span>
              </h1>
              <p className="text-xl text-gray-600">
                Reaching the Community with Quality Care
              </p>
              <div className="flex gap-4 pt-4">
                <a href={getLoginUrl()}>
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg">
                    Get Started
                  </Button>
                </a>
                <a href="#about">
                  <Button variant="outline" className="border-gray-300 px-8 py-6 text-lg">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Visual - Teal Circular Background */}
            <div className="relative h-96 md:h-full">
              <div className="absolute inset-0 bg-primary rounded-full opacity-20 blur-3xl"></div>
              <div className="relative z-10 bg-primary rounded-full w-80 h-80 mx-auto flex items-center justify-center">
                <div className="text-center text-white">
                  <Heart className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Real-Time Monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Does Monitoring Mean Section */}
      <section id="about" className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Image/Visual */}
            <div className="space-y-6">
              <div className="bg-primary/10 rounded-lg p-8 min-h-64 flex items-center justify-center">
                <Activity className="w-32 h-32 text-primary opacity-30" />
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                What does monitoring mean?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Monitor patient health continuously through integrated medical devices, live camera surveillance, intelligent waveform analysis, and predictive healthcare insights. Instantly detect emergencies, notify doctors and family members, track recovery trends, and ensure timely medication administration—all from a single centralized platform.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                  <p className="text-gray-700">Real-time vital sign tracking</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                  <p className="text-gray-700">AI-powered fall and bed-exit detection</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                  <p className="text-gray-700">Automated emergency escalation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why is it Important Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="bg-primary h-2 w-32 mb-4"></div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                Why is it Important in real time
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                ICU Guardian AI is an intelligent healthcare platform designed to support doctors, nurses, and hospital operators with continuous patient monitoring and automated emergency response. By combining medical telemetry, computer vision, artificial intelligence, and predictive analytics, the platform helps improve patient safety and reduce response times during critical situations.
              </p>
              <div className="pt-4">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6">
                  Explore Features <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Image/Visual */}
            <div className="relative h-96">
              <div className="absolute inset-0 bg-primary/10 rounded-lg"></div>
              <div className="relative z-10 h-full flex items-center justify-center">
                <AlertCircle className="w-32 h-32 text-primary opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ICU Guardian AI Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="bg-primary h-2 w-32 mb-4"></div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              Why Choose ICU Guardian AI?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-primary rounded-lg p-8 text-white space-y-6">
              <h3 className="text-2xl font-bold italic">Patients and Families</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>Live Patient Surveillance</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>Real-Time Vital Tracking</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>AI Fall & Bed Exit Detection</span>
                </li>
              </ul>
              <div className="pt-4">
                <Heart className="w-12 h-12 opacity-50" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-primary rounded-lg p-8 text-white space-y-6">
              <h3 className="text-2xl font-bold italic">Referring Doctors</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>Medication Compliance Monitoring</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>Health Trend Analytics</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>Hospital-Grade Security</span>
                </li>
              </ul>
              <div className="pt-4">
                <Pill className="w-12 h-12 opacity-50" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-primary rounded-lg p-8 text-white space-y-6">
              <h3 className="text-2xl font-bold italic">Local Communities</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>Automated Emergency Escalation</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>Family & Doctor Notifications</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">✓</span>
                  <span>Reduced Response Times</span>
                </li>
              </ul>
              <div className="pt-4">
                <Building2 className="w-12 h-12 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Do We Provide Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-16">
            What do we provide?
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div className="flex gap-8">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-2xl font-bold">
                  1
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Real-Time Patient Monitoring</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor every patient continuously through connected medical devices and intelligent sensors. The system collects and displays vital health parameters in real time, allowing doctors and nurses to instantly assess patient conditions without manually checking multiple devices.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-8">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-2xl font-bold">
                  2
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Referring Doctors Dashboard</h3>
                <p className="text-gray-600 leading-relaxed">
                  ICU Guardian AI provides a secure live camera feed integrated directly into the monitoring dashboard. Medical staff can observe patients remotely while the AI system continuously analyzes patient movement and behavior for early warning signs.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-8">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-2xl font-bold">
                  3
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Critical Alert System</h3>
                <p className="text-gray-600 leading-relaxed">
                  Automatically detect life-threatening vital sign thresholds and escalate alerts across digital platforms. Doctors and family members receive instant notifications to ensure no critical event goes unnoticed.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-8">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-2xl font-bold">
                  4
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Medication Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Automated medication reminders ensure patients never miss a dose. The system tracks compliance and alerts doctors to any missed medications, maintaining accurate health records and improving patient outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black">
            Ready to Transform Patient Care?
          </h2>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Join hospitals and healthcare providers using ICU Guardian AI to save lives and reduce response times.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href={getLoginUrl()}>
              <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                Get Started Now
              </Button>
            </a>
            <a href="#contact">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold">
                Contact Sales
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Contact</h3>
              <p className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+1234567890" className="hover:text-primary transition">+1 (234) 567-890</a>
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Email</h3>
              <p className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:support@icuguardian.ai" className="hover:text-primary transition">support@icuguardian.ai</a>
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Website</h3>
              <p className="flex items-center gap-2">
                <span>🌐</span>
                <a href="https://icuguardian.ai" className="hover:text-primary transition">www.icuguardian.ai</a>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2026 ICU Guardian AI. All rights reserved. | Advancing Healthcare with AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
