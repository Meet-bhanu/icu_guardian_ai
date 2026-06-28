import { useIcuAuth } from "@/hooks/useIcuAuth";
import { getDashboardForRole } from "@/lib/authApi";
import { Button } from "@/components/ui/button";
import { Heart, Activity, AlertCircle, ChevronRight, Shield, Pill, Building2 } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import TrueFocus from "@/components/TrueFocus/TrueFocus";
import ScrollReveal from "@/components/ScrollReveal/ScrollReveal";

export default function Home() {
  const { isAuthenticated, user } = useIcuAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-[var(--hh-shadow-sm)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 hh-gradient-bg rounded-lg flex items-center justify-center shadow-md shadow-primary/25">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">HealthHalo</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="font-semibold text-foreground hover:text-primary transition-colors">Home</a>
            <a href="#about" className="font-semibold text-foreground hover:text-primary transition-colors">About Us</a>
            <a href="#contact" className="font-semibold text-foreground hover:text-primary transition-colors">Contact Us</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground font-medium hidden sm:inline">Welcome, {user?.name}</span>
                <Link href={user?.role === "doctor" ? "/doctor/dashboard" : user?.role === "patient" ? "/patient/dashboard" : "/dashboard"}>
                  <Button>Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <a href="/login">
                  <Button variant="outline" className="font-semibold border-border">Login</Button>
                </a>
                <a href="/login">
                  <Button className="font-semibold shadow-md shadow-primary/20">Staff Login</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      <section id="home" className="relative overflow-hidden hh-gradient-soft py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.48_0.14_168/0.12),transparent_55%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                <Shield className="w-4 h-4" />
                Hospital-Grade Monitoring
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                Hospital <span className="text-primary">Monitoring</span>
              </h1>
              <div className="py-2">
                <TrueFocus
                  sentence="True Focus"
                  manualMode={false}
                  blurAmount={4.5}
                  borderColor="#00d898"
                  animationDuration={2}
                  pauseBetweenAnimations={1}
                />
              </div>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-lg">
                Reaching the community with quality care — real-time vitals, AI surveillance, and coordinated response.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <a href="/login">
                  <Button size="lg" className="px-8 font-semibold shadow-lg shadow-primary/25">
                    Patient Portal
                  </Button>
                </a>
                <a href="/login">
                  <Button size="lg" variant="outline" className="px-8 font-semibold border-border bg-white">
                    Staff Login
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative flex items-center justify-center min-h-[20rem]">
              <div className="absolute w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative z-10 w-80 h-80 hh-gradient-bg rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 ring-4 ring-white/50">
                <div className="text-center text-white">
                  <Heart className="w-24 h-24 mx-auto mb-4 drop-shadow-md" />
                  <p className="text-xl font-bold tracking-tight">Real-Time Monitoring</p>
                  <p className="text-sm text-white/90 mt-1 font-medium">ICU · Ward · Home Care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="hh-card-elevated p-10 min-h-72 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <Activity className="w-36 h-36 text-primary" strokeWidth={1.25} />
            </div>

            <div className="space-y-6">
              <div className="h-1.5 w-20 hh-gradient-bg rounded-full" />
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                What does monitoring mean?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                Monitor patient health continuously through integrated medical devices, live camera surveillance, intelligent waveform analysis, and predictive healthcare insights. Instantly detect emergencies, notify doctors and family members, track recovery trends, and ensure timely medication administration—all from a single centralized platform.
              </p>
              <div className="space-y-4 pt-2">
                {["Real-time vital sign tracking", "AI-powered fall and bed-exit detection", "Automated emergency escalation"].map((item) => (
                  <div key={item} className="flex gap-4 items-center">
                    <div className="w-9 h-9 rounded-full hh-gradient-bg text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-sm">✓</div>
                    <p className="text-foreground font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <div className="h-1.5 w-20 hh-gradient-bg rounded-full" />
              <ScrollReveal
                baseOpacity={0.4}
                enableBlur={true}
                baseRotation={4}
                blurStrength={10}
                containerClassName="text-foreground"
              >
                Why is it important in real time
              </ScrollReveal>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                HealthHalo is an intelligent healthcare platform designed to support doctors, nurses, and hospital operators with continuous patient monitoring and automated emergency response. By combining medical telemetry, computer vision, artificial intelligence, and predictive analytics, the platform helps improve patient safety and reduce response times during critical situations.
              </p>
              <Button size="lg" className="font-semibold shadow-md shadow-primary/20">
                Explore Features <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="hh-card-elevated p-10 min-h-72 flex items-center justify-center bg-white order-1 md:order-2">
              <AlertCircle className="w-36 h-36 text-primary" strokeWidth={1.25} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <div className="h-1.5 w-20 hh-gradient-bg rounded-full mb-5" />
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              Why Choose HealthHalo?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="hh-gradient-bg rounded-2xl p-8 text-white space-y-6 shadow-lg shadow-primary/25">
              <h3 className="text-2xl font-bold italic">Patients and Families</h3>
              <ul className="space-y-3 font-medium">
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
              <Heart className="w-12 h-12 opacity-50" />
            </div>

            <div className="hh-gradient-bg rounded-2xl p-8 text-white space-y-6 shadow-lg shadow-primary/25">
              <h3 className="text-2xl font-bold italic">Referring Doctors</h3>
              <ul className="space-y-3 font-medium">
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
              <Pill className="w-12 h-12 opacity-50" />
            </div>

            <div className="hh-gradient-bg rounded-2xl p-8 text-white space-y-6 shadow-lg shadow-primary/25">
              <h3 className="text-2xl font-bold italic">Local Communities</h3>
              <ul className="space-y-3 font-medium">
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
              <Building2 className="w-12 h-12 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-14 tracking-tight">
            What do we provide?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { n: 1, title: "Real-Time Patient Monitoring", desc: "Monitor every patient continuously through connected medical devices and intelligent sensors. The system collects and displays vital health parameters in real time, allowing doctors and nurses to instantly assess patient conditions without manually checking multiple devices." },
              { n: 2, title: "Referring Doctors Dashboard", desc: "HealthHalo provides a secure live camera feed integrated directly into the monitoring dashboard. Medical staff can observe patients remotely while the AI system continuously analyzes patient movement and behavior for early warning signs." },
              { n: 3, title: "Critical Alert System", desc: "Automatically detect life-threatening vital sign thresholds and escalate alerts across digital platforms. Doctors and family members receive instant notifications to ensure no critical event goes unnoticed." },
              { n: 4, title: "Medication Management", desc: "Automated medication reminders ensure patients never miss a dose. The system tracks compliance and alerts doctors to any missed medications, maintaining accurate health records and improving patient outcomes." },
            ].map((f) => (
              <div key={f.n} className="hh-card p-6 flex gap-6 bg-white">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl hh-gradient-bg text-white flex items-center justify-center text-xl font-bold shadow-md shadow-primary/25">
                  {f.n}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 hh-gradient-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,oklch(1_0_0/0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 text-center space-y-8 relative">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Ready to Transform Patient Care?
          </h2>
          <p className="text-xl max-w-2xl mx-auto text-white/95 font-medium">
            Join hospitals and healthcare providers using HealthHalo to save lives and reduce response times.
          </p>
          <div className="flex gap-4 justify-center flex-wrap pt-2">
            <a href="/login">
              <Button size="lg" className="bg-white text-primary hover:bg-white/95 font-bold shadow-xl px-8">
                Get Started Now
              </Button>
            </a>
            <a href="#contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/15 font-bold px-8 bg-transparent">
                Contact Sales
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
