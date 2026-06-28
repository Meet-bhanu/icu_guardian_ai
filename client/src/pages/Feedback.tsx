import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Sparkles,
  Heart,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Stethoscope,
  Smile,
  ShieldCheck,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ROLES = [
  "Doctor",
  "Nurse",
  "Medical Student",
  "Hospital Admin",
  "Patient",
  "General User",
];

export default function Feedback() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const [overallExperience, setOverallExperience] = useState(0);
  const [easeOfUse, setEaseOfUse] = useState(0);
  const [aiAccuracy, setAiAccuracy] = useState(0);
  const [uiDesign, setUiDesign] = useState(0);
  const [recommend, setRecommend] = useState<"Yes" | "Maybe" | "No" | "">("");
  const [useInHospital, setUseInHospital] = useState<"Yes" | "No" | "">("");
  const [likeMost, setLikeMost] = useState("");
  const [problemsFaced, setProblemsFaced] = useState("");
  const [suggestions, setSuggestions] = useState("");

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Load user data if logged in
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      if (user.role === "doctor") setUserRole("Doctor");
      else if (user.role === "patient") setUserRole("Patient");
    }
  }, [user]);

  // Check if they already submitted feedback on this browser
  useEffect(() => {
    const hasSubmitted = localStorage.getItem("icu_guardian_feedback_submitted");
    if (hasSubmitted === "true") {
      setAlreadySubmitted(true);
    }

    // Capture URL params for rating pre-fills (e.g. from AI prediction trigger)
    const params = new URLSearchParams(window.location.search);
    const prefillAi = params.get("prefill_ai_rating");
    if (prefillAi) {
      const val = parseInt(prefillAi, 10);
      if (val >= 1 && val <= 5) {
        setAiAccuracy(val);
        setOverallExperience(val);
      }
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!userRole) newErrors.userRole = "Please select your role";
    if (overallExperience === 0) newErrors.overallExperience = "Overall rating is required";
    if (easeOfUse === 0) newErrors.easeOfUse = "Ease of use rating is required";
    if (aiAccuracy === 0) newErrors.aiAccuracy = "AI prediction accuracy rating is required";
    if (uiDesign === 0) newErrors.uiDesign = "UI design rating is required";
    if (!recommend) newErrors.recommend = "Recommendation preference is required";
    if (!useInHospital) newErrors.useInHospital = "Hospital adoption feedback is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        fullName,
        email,
        userRole,
        overallExperience,
        easeOfUse,
        aiAccuracy,
        uiDesign,
        recommend: recommend as "Yes" | "Maybe" | "No",
        useInHospital: useInHospital as "Yes" | "No",
        likeMost,
        problemsFaced,
        suggestions,
        createdAt: serverTimestamp(),
      });

      localStorage.setItem("icu_guardian_feedback_submitted", "true");
      setIsSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (err) {
      toast.error("Failed to submit feedback. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendering Helper: Interactive Rating Stars
  const StarRating = ({
    value,
    onChange,
    label,
    error,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
    error?: string;
  }) => {
    const [hover, setHover] = useState<number | null>(null);
    return (
      <div className="space-y-1.5">
        <span className="text-sm font-semibold text-gray-700 block">{label} <span className="text-red-500">*</span></span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              className="focus:outline-none transition-transform hover:scale-115"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hover ?? value)
                    ? "fill-primary text-primary"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {value > 0 && (
            <span className="text-xs font-bold text-gray-500 ml-2">
              {value} / 5
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Dynamic Geometric Background Shapes */}
      <div className="absolute top-0 right-0 w-[45rem] h-[45rem] rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] rounded-full bg-emerald-500/5 blur-3xl -z-10" />

      {/* Navbar Header */}
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 shadow-[var(--hh-shadow-sm)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 hh-gradient-bg rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">ICU Guardian AI</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="gap-2 font-semibold text-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </header>

      {/* Main Body Layout */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <AnimatePresence mode="wait">
          {alreadySubmitted && !isSubmitted ? (
            /* Already Submitted Screen */
            <motion.div
              key="already-submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full"
            >
              <Card className="p-8 text-center bg-white/80 backdrop-blur-md border border-white/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 hh-gradient-bg" />
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-9 h-9 text-primary" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Feedback Received</h2>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed font-medium">
                  Our system shows that you have already submitted validation feedback for ICU Guardian AI from this browser. Thank you for your support!
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      localStorage.removeItem("icu_guardian_feedback_submitted");
                      setAlreadySubmitted(false);
                    }}
                    variant="outline"
                    className="font-semibold text-xs border-border"
                  >
                    Submit New Feedback
                  </Button>
                  <Button
                    onClick={() => setLocation(user?.role === "doctor" ? "/doctor/dashboard" : "/")}
                    className="font-semibold"
                  >
                    Go to Portal
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : isSubmitted ? (
            /* Success Animation State */
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="max-w-lg w-full"
            >
              <Card className="p-8 text-center bg-white/90 backdrop-blur-md border border-white/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 hh-gradient-bg" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </motion.div>

                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thank You!</h2>
                <p className="text-emerald-700 font-semibold text-sm mt-2 flex items-center justify-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full w-fit mx-auto">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                  Your feedback has been successfully registered
                </p>
                <p className="text-gray-500 text-sm mt-4 leading-relaxed font-medium">
                  We appreciate your support in validating ICU Guardian AI. Your insights will help us build safer, smarter, and more reliable clinical validation layers for critical hospital care.
                </p>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center gap-4">
                  <Button
                    onClick={() => setLocation(user ? (user.role === "doctor" ? "/doctor/dashboard" : "/dashboard") : "/")}
                    className="font-semibold px-6 shadow-md shadow-primary/20"
                  >
                    Return to Portal
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            /* Main Feedback Form Card */
            <motion.div
              key="feedback-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full"
            >
              <Card className="p-6 md:p-8 bg-white/80 backdrop-blur-md border border-white/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 hh-gradient-bg" />

                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Smile className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Market Validation & Feedback</h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Help us validate ICU Guardian AI for hackathon presentation</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Grid for Name & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className={errors.fullName ? "border-red-300 focus-visible:ring-red-400 bg-white" : "bg-white"}
                      />
                      {errors.fullName && <p className="text-xs text-red-500 font-semibold">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.doe@hospital.org"
                        className={errors.email ? "border-red-300 focus-visible:ring-red-400 bg-white" : "bg-white"}
                      />
                      {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700 block">User Role <span className="text-red-500">*</span></span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setUserRole(role)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                            userRole === role
                              ? "bg-primary border-primary text-white shadow-sm"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                    {errors.userRole && <p className="text-xs text-red-500 font-semibold">{errors.userRole}</p>}
                  </div>

                  {/* Rating Scales Grid */}
                  <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
                    <StarRating
                      value={overallExperience}
                      onChange={setOverallExperience}
                      label="Overall Experience"
                      error={errors.overallExperience}
                    />

                    <StarRating
                      value={easeOfUse}
                      onChange={setEaseOfUse}
                      label="Ease of Use / Workflow Intuition"
                      error={errors.easeOfUse}
                    />

                    <StarRating
                      value={aiAccuracy}
                      onChange={setAiAccuracy}
                      label="AI Prediction Accuracy Perception"
                      error={errors.aiAccuracy}
                    />

                    <StarRating
                      value={uiDesign}
                      onChange={setUiDesign}
                      label="UI Design & Layout Aesthetics"
                      error={errors.uiDesign}
                    />
                  </div>

                  {/* Yes/No/Maybe Questions */}
                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700 block">
                        Would you recommend ICU Guardian AI? <span className="text-red-500">*</span>
                      </span>
                      <div className="flex gap-2">
                        {["Yes", "Maybe", "No"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setRecommend(opt as any)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                              recommend === opt
                                ? "bg-primary border-primary text-white shadow-sm"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {errors.recommend && <p className="text-xs text-red-500 font-semibold">{errors.recommend}</p>}
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-700 block">
                        Would you use this in a real hospital? <span className="text-red-500">*</span>
                      </span>
                      <div className="flex gap-2">
                        {["Yes", "No"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setUseInHospital(opt as any)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                              useInHospital === opt
                                ? "bg-primary border-primary text-white shadow-sm"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {errors.useInHospital && <p className="text-xs text-red-500 font-semibold">{errors.useInHospital}</p>}
                    </div>
                  </div>

                  {/* Feedback Textareas */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="space-y-1.5">
                      <Label htmlFor="likeMost" className="font-semibold text-gray-700">What did you like the most?</Label>
                      <Textarea
                        id="likeMost"
                        value={likeMost}
                        onChange={(e) => setLikeMost(e.target.value)}
                        placeholder="E.g., clean user interface, fast vital updates, video calling..."
                        className="bg-white min-h-[4.5rem]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="problemsFaced" className="font-semibold text-gray-700">What problems or friction did you face?</Label>
                      <Textarea
                        id="problemsFaced"
                        value={problemsFaced}
                        onChange={(e) => setProblemsFaced(e.target.value)}
                        placeholder="E.g., high frequencies of alerts, chart sizing, data preloading..."
                        className="bg-white min-h-[4.5rem]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="suggestions" className="font-semibold text-gray-700">Suggestions for improvement</Label>
                      <Textarea
                        id="suggestions"
                        value={suggestions}
                        onChange={(e) => setSuggestions(e.target.value)}
                        placeholder="E.g., custom vital thresholds, night mode option, more statistics..."
                        className="bg-white min-h-[4.5rem]"
                      />
                    </div>
                  </div>

                  {/* Submission Row */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => window.history.back()}
                      disabled={isSubmitting}
                      className="font-semibold text-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="font-bold shadow-lg shadow-primary/20 gap-2 min-w-[8rem]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="w-4 h-4" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
