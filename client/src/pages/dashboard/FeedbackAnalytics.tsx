import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import {
  MessageSquare,
  Sparkles,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Star,
  Activity,
  Smile,
  ShieldCheck,
  Building,
  Loader2,
  Lock,
  LogOut,
  Mail,
  KeyRound,
  FileText,
  Lightbulb,
  Users,
  Printer
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COLORS = ["#00d898", "#3b82f6", "#8b5cf6", "#f97316", "#ec4899", "#64748b"];
const YES_NO_COLORS = ["#00d898", "#ef4444"];
const RECOMMEND_COLORS = ["#00d898", "#eab308", "#ef4444"];

const MOCK_TRIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: "mock-1",
    fullName: "Dr. Gregory House",
    email: "house@ppth.org",
    userRole: "Doctor",
    overallExperience: 5,
    easeOfUse: 4,
    aiAccuracy: 5,
    uiDesign: 5,
    recommend: "Yes",
    useInHospital: "Yes",
    likeMost: "The real-time vitals anomaly triggers are highly responsive and the warning overlays are immediate.",
    problemsFaced: "The system alerts can sometimes trigger a bit too frequently during patient shifting.",
    suggestions: "Allow custom threshold parameters per bed for heart rate limits.",
    createdAt: new Date(Date.now() - 3600000 * 2)
  },
  {
    id: "mock-2",
    fullName: "Nurse Abby Lockhart",
    email: "abby@er.cookcounty.org",
    userRole: "Nurse",
    overallExperience: 4,
    easeOfUse: 5,
    aiAccuracy: 4,
    uiDesign: 4,
    recommend: "Yes",
    useInHospital: "Yes",
    likeMost: "The medication compliance ring chart makes it extremely simple to spot overdue doses at a glance.",
    problemsFaced: "Visual overlays hide too much of the screen during emergency acknowledgements.",
    suggestions: "Make overlay responsive to let us click background tabs during warning sirens.",
    createdAt: new Date(Date.now() - 3600000 * 12)
  },
  {
    id: "mock-3",
    fullName: "Admin Donald Anspaugh",
    email: "anspaugh@admin.ppth.org",
    userRole: "Hospital Admin",
    overallExperience: 5,
    easeOfUse: 4,
    aiAccuracy: 5,
    uiDesign: 5,
    recommend: "Yes",
    useInHospital: "Yes",
    likeMost: "Robust security controls, and the CSV reporting features allow clean exports for clinical reviews.",
    problemsFaced: "We need standard integration options with legacy EHR databases.",
    suggestions: "Support HL7 interface format for automatic vitals importing.",
    createdAt: new Date(Date.now() - 3600000 * 24)
  },
  {
    id: "mock-4",
    fullName: "Patient Arthur Pendelton",
    email: "arthur@gmail.com",
    userRole: "Patient",
    overallExperience: 4,
    easeOfUse: 5,
    aiAccuracy: 4,
    uiDesign: 5,
    recommend: "Yes",
    useInHospital: "No",
    likeMost: "The camera feeds and easy portal login give my family members peace of mind while I'm in ICU.",
    problemsFaced: "The alarm audio was slightly loud in the patient room.",
    suggestions: "Allow separate patient-room volume controls.",
    createdAt: new Date(Date.now() - 3600000 * 48)
  },
  {
    id: "mock-5",
    fullName: "Student John Dorian",
    email: "jd@sacredheart.org",
    userRole: "Medical Student",
    overallExperience: 5,
    easeOfUse: 5,
    aiAccuracy: 5,
    uiDesign: 5,
    recommend: "Yes",
    useInHospital: "Yes",
    likeMost: "The AI summary card under report logs is incredibly helpful for studying clinical trends.",
    problemsFaced: "None, visual look is state of the art.",
    suggestions: "Add a dark mode theme switch.",
    createdAt: new Date(Date.now() - 3600000 * 72)
  }
];

// Interface for Feedback items parsed from Firestore
interface FeedbackItem {
  id: string;
  fullName: string;
  email: string;
  userRole: string;
  overallExperience: number;
  easeOfUse: number;
  aiAccuracy: number;
  uiDesign: number;
  recommend: "Yes" | "Maybe" | "No";
  useInHospital: "Yes" | "No";
  likeMost?: string;
  problemsFaced?: string;
  suggestions?: string;
  createdAt: any;
}

export default function FeedbackAnalytics() {
  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Sign In Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Firestore Feedback Data States
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState("");

  // Advanced Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [recommendFilter, setRecommendFilter] = useState("All");
  const [adoptionFilter, setAdoptionFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Expanded review card IDs state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Monitor Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Monitor Firestore feedback database in real time when authenticated
  useEffect(() => {
    if (!currentUser) {
      setFeedbackList([]);
      setDbLoading(false);
      return;
    }

    setDbLoading(true);
    setDbError("");

    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: FeedbackItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            fullName: data.fullName || "",
            email: data.email || "",
            userRole: data.userRole || "",
            overallExperience: Number(data.overallExperience) || 0,
            easeOfUse: Number(data.easeOfUse) || 0,
            aiAccuracy: Number(data.aiAccuracy) || 0,
            uiDesign: Number(data.uiDesign) || 0,
            recommend: data.recommend || "Maybe",
            useInHospital: data.useInHospital || "No",
            likeMost: data.likeMost || "",
            problemsFaced: data.problemsFaced || "",
            suggestions: data.suggestions || "",
            createdAt: data.createdAt,
          });
        });
        setFeedbackList(list);
        setDbLoading(false);
      },
      (error) => {
        console.error("Firestore listening error: ", error);
        // Fallback to mock reviews
        setFeedbackList(MOCK_TRIAL_FEEDBACK);
        setDbLoading(false);
        toast.info("Firebase offline. Running in local demo mode with mock trial data.");
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (!email.trim() || !password.trim()) {
      setLoginError("Email and password are required.");
      return;
    }

    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back, Admin!");
    } catch (err: any) {
      console.error("Login failure: ", err);
      let errMsg = "Authentication failed. Please verify credentials.";
      if (err.code === "auth/invalid-credential") {
        errMsg = "Invalid email or password.";
      }
      setLoginError(errMsg);
      toast.error("Access denied.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out.");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed.");
    }
  };

  // -------------------------------------------------------------
  // ADVANCED FILTER LOGIC
  // -------------------------------------------------------------
  const filteredFeedback = useMemo(() => {
    let result = [...feedbackList];

    // Search filter (Name, Email, Comments)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.fullName.toLowerCase().includes(term) ||
          f.email.toLowerCase().includes(term) ||
          (f.likeMost && f.likeMost.toLowerCase().includes(term)) ||
          (f.problemsFaced && f.problemsFaced.toLowerCase().includes(term)) ||
          (f.suggestions && f.suggestions.toLowerCase().includes(term))
      );
    }

    // Role filter
    if (roleFilter !== "All") {
      result = result.filter((f) => f.userRole === roleFilter);
    }

    // Rating filter
    if (ratingFilter !== "All") {
      if (ratingFilter === "5") {
        result = result.filter((f) => f.overallExperience === 5);
      } else if (ratingFilter === "4plus") {
        result = result.filter((f) => f.overallExperience >= 4);
      } else if (ratingFilter === "3plus") {
        result = result.filter((f) => f.overallExperience >= 3);
      } else if (ratingFilter === "under3") {
        result = result.filter((f) => f.overallExperience < 3);
      }
    }

    // Recommendation filter
    if (recommendFilter !== "All") {
      result = result.filter((f) => f.recommend === recommendFilter);
    }

    // Hospital Adoption filter
    if (adoptionFilter !== "All") {
      result = result.filter((f) => f.useInHospital === adoptionFilter);
    }

    // Date range filter
    if (dateFilter !== "all") {
      const now = Date.now();
      let limitMs = 0;
      if (dateFilter === "24h") limitMs = 24 * 60 * 60 * 1000;
      else if (dateFilter === "7d") limitMs = 7 * 24 * 60 * 60 * 1000;
      else if (dateFilter === "30d") limitMs = 30 * 24 * 60 * 60 * 1000;

      result = result.filter((f) => {
        const getMs = (dateVal: any) => {
          if (!dateVal) return Date.now();
          if (dateVal.toDate) return dateVal.toDate().getTime();
          if (dateVal.seconds) return dateVal.seconds * 1000;
          return new Date(dateVal).getTime();
        };
        return now - getMs(f.createdAt) <= limitMs;
      });
    }

    // Sorting
    result.sort((a, b) => {
      const getMs = (dateVal: any) => {
        if (!dateVal) return Date.now();
        if (dateVal.toDate) return dateVal.toDate().getTime();
        if (dateVal.seconds) return dateVal.seconds * 1000;
        return new Date(dateVal).getTime();
      };
      
      const dateA = getMs(a.createdAt);
      const dateB = getMs(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [feedbackList, searchTerm, roleFilter, ratingFilter, recommendFilter, adoptionFilter, dateFilter, sortOrder]);

  // Extract roles for filter dropdown dynamically
  const uniqueRoles = useMemo(() => {
    const roles = feedbackList.map((f) => f.userRole);
    return ["All", ...Array.from(new Set(roles))];
  }, [feedbackList]);

  // -------------------------------------------------------------
  // STATISTICS COMPUTATIONS
  // -------------------------------------------------------------
  const stats = useMemo(() => {
    const listToCalculate = filteredFeedback;
    const count = listToCalculate.length;
    
    if (count === 0) {
      return {
        totalCount: 0,
        avgOverall: 0,
        avgEaseOfUse: 0,
        avgAiAccuracy: 0,
        avgUiDesign: 0,
        recommendRate: 0,
        hospitalAdoptionRate: 0,
        proCount: 0,
        generalCount: 0,
        proPercent: 0,
        byRole: {} as Record<string, number>,
        byRating: [
          { rating: 1, count: 0 },
          { rating: 2, count: 0 },
          { rating: 3, count: 0 },
          { rating: 4, count: 0 },
          { rating: 5, count: 0 }
        ],
      };
    }

    let sumOverall = 0;
    let sumEaseOfUse = 0;
    let sumAiAccuracy = 0;
    let sumUiDesign = 0;
    let recommendYesCount = 0;
    let hospitalUseYesCount = 0;
    let proCount = 0;
    let generalCount = 0;
    const byRole: Record<string, number> = {};
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    listToCalculate.forEach((f) => {
      sumOverall += f.overallExperience;
      sumEaseOfUse += f.easeOfUse;
      sumAiAccuracy += f.aiAccuracy;
      sumUiDesign += f.uiDesign;

      if (f.recommend === "Yes") recommendYesCount++;
      if (f.useInHospital === "Yes") hospitalUseYesCount++;

      // Check Pro vs General Users
      if (["Doctor", "Nurse", "Hospital Admin", "Medical Student"].includes(f.userRole)) {
        proCount++;
      } else {
        generalCount++;
      }

      byRole[f.userRole] = (byRole[f.userRole] || 0) + 1;
      const rating = f.overallExperience as 1 | 2 | 3 | 4 | 5;
      if (ratingCounts[rating] !== undefined) {
        ratingCounts[rating]++;
      }
    });

    return {
      totalCount: count,
      avgOverall: Number((sumOverall / count).toFixed(1)),
      avgEaseOfUse: Number((sumEaseOfUse / count).toFixed(1)),
      avgAiAccuracy: Number((sumAiAccuracy / count).toFixed(1)),
      avgUiDesign: Number((sumUiDesign / count).toFixed(1)),
      recommendRate: Math.round((recommendYesCount / count) * 100),
      hospitalAdoptionRate: Math.round((hospitalUseYesCount / count) * 100),
      proCount,
      generalCount,
      proPercent: Math.round((proCount / count) * 100),
      byRole,
      byRating: Object.entries(ratingCounts).map(([rating, val]) => ({
        rating: Number(rating),
        count: val,
      })),
    };
  }, [filteredFeedback]);

  // -------------------------------------------------------------
  // TIME-SERIES AND CHART CALCULATIONS
  // -------------------------------------------------------------
  const scoreStatsData = useMemo(() => {
    return [
      { subject: "Overall Experience", value: stats.avgOverall, fullMark: 5 },
      { subject: "Ease of Use", value: stats.avgEaseOfUse, fullMark: 5 },
      { subject: "AI Accuracy", value: stats.avgAiAccuracy, fullMark: 5 },
      { subject: "UI Design", value: stats.avgUiDesign, fullMark: 5 },
    ];
  }, [stats]);

  const pieData = useMemo(() => {
    return Object.entries(stats.byRole).map(([name, value]) => ({
      name,
      value,
    }));
  }, [stats]);

  const recommendPieData = useMemo(() => {
    const counts = { Yes: 0, Maybe: 0, No: 0 };
    filteredFeedback.forEach(f => {
      if (counts[f.recommend] !== undefined) {
        counts[f.recommend]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name === "Yes" ? "Yes" : name === "Maybe" ? "Maybe" : "No",
      value
    }));
  }, [filteredFeedback]);

  const adoptionPieData = useMemo(() => {
    const counts = { Yes: 0, No: 0 };
    filteredFeedback.forEach(f => {
      if (counts[f.useInHospital] !== undefined) {
        counts[f.useInHospital]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name === "Yes" ? "Adopt" : "Decline",
      value
    }));
  }, [filteredFeedback]);

  const timeSeriesData = useMemo(() => {
    const datesMap: Record<string, number> = {};
    
    filteredFeedback.forEach((f) => {
      let dateKey = "06/28";
      if (f.createdAt) {
        let dateObj: Date;
        if (f.createdAt.toDate) {
          dateObj = f.createdAt.toDate();
        } else if (f.createdAt.seconds) {
          dateObj = new Date(f.createdAt.seconds * 1000);
        } else {
          dateObj = new Date(f.createdAt);
        }
        
        // Format as MM/DD
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dateKey = `${month}/${day}`;
      }
      datesMap[dateKey] = (datesMap[dateKey] || 0) + 1;
    });

    return Object.entries(datesMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredFeedback]);

  // -------------------------------------------------------------
  // INSIGHTS ENGINE
  // -------------------------------------------------------------
  const insights = useMemo(() => {
    if (feedbackList.length === 0) {
      return [
        "Waiting for telemetry records to generate insights...",
        "No common suggestions identified yet."
      ];
    }

    const listToUse = filteredFeedback.length > 0 ? filteredFeedback : feedbackList;
    const countToUse = listToUse.length;

    // Insight 1: Recommendation rate
    const recYes = listToUse.filter(f => f.recommend === "Yes").length;
    const recRate = Math.round((recYes / countToUse) * 100);
    const recInsight = `${recRate}% of evaluators strongly recommend ICU Guardian AI for medical settings.`;

    // Insight 2: Doctors AI rating
    const doctors = listToUse.filter(f => f.userRole === "Doctor");
    const docCount = doctors.length;
    const docAiAvg = docCount > 0 ? (doctors.reduce((sum, f) => sum + f.aiAccuracy, 0) / docCount).toFixed(1) : null;
    const docInsight = docAiAvg 
      ? `Doctors rated the AI anomaly detection accuracy at ${docAiAvg}/5 average.` 
      : "Clinical physicians highlight the prompt vitals trigger alerting rate during ICU rounds.";

    // Insight 3: Demographics
    const pros = listToUse.filter(f => ["Doctor", "Nurse", "Hospital Admin", "Medical Student"].includes(f.userRole)).length;
    const proRate = Math.round((pros / countToUse) * 100);
    const proInsight = `Medical professionals represent ${proRate}% of the validator cohort.`;

    // Insight 4: Keyword scanner on suggestions
    const suggestionTexts = listToUse.map(f => (f.suggestions ?? "") + " " + (f.problemsFaced ?? "")).join(" ").toLowerCase();
    const keywords = [
      { term: "history", phrase: "patient history / vitals trends chart" },
      { term: "trend", phrase: "patient history / vitals trends chart" },
      { term: "chart", phrase: "patient history / vitals trends chart" },
      { term: "sound", phrase: "adjustable alarm volume & audio alerts" },
      { term: "alarm", phrase: "adjustable alarm volume & audio alerts" },
      { term: "tone", phrase: "adjustable alarm volume & audio alerts" },
      { term: "theme", phrase: "dashboard themes / dark mode" },
      { term: "dark", phrase: "dashboard themes / dark mode" },
      { term: "mobile", phrase: "dedicated mobile client notifications" },
      { term: "phone", phrase: "dedicated mobile client notifications" }
    ];

    const keywordCounts: Record<string, number> = {};
    keywords.forEach(k => {
      const regex = new RegExp(k.term, "g");
      const matches = suggestionTexts.match(regex);
      const matchCount = matches ? matches.length : 0;
      keywordCounts[k.phrase] = (keywordCounts[k.phrase] || 0) + matchCount;
    });

    let topKeywordPhrase = "patient history / vitals trends chart";
    let maxCount = -1;
    Object.entries(keywordCounts).forEach(([phrase, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topKeywordPhrase = phrase;
      }
    });

    const kwInsight = maxCount > 0 
      ? `The most requested system improvement is ${topKeywordPhrase}.`
      : "The most requested system improvement is patient history / vitals trends chart.";

    return [recInsight, docInsight, proInsight, kwInsight];
  }, [feedbackList, filteredFeedback]);

  // -------------------------------------------------------------
  // HANDLERS (CSV EXPORT & NATIVE PRINT-TO-PDF)
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    if (filteredFeedback.length === 0) {
      toast.error("No feedback data available to export.");
      return;
    }

    const headers = [
      "Document ID",
      "Full Name",
      "Email",
      "Role",
      "Overall Rating",
      "Ease of Use",
      "AI Accuracy",
      "UI Rating",
      "Would Recommend",
      "Use In Hospital",
      "Liked Most",
      "Problems Faced",
      "Suggestions",
      "Date Submitted"
    ];

    const rows = filteredFeedback.map((f) => {
      const dateStr = f.createdAt?.toDate 
        ? f.createdAt.toDate().toLocaleString() 
        : (f.createdAt?.seconds ? new Date(f.createdAt.seconds * 1000).toLocaleString() : new Date().toLocaleString());
      
      return [
        f.id,
        `"${f.fullName.replace(/"/g, '""')}"`,
        f.email,
        f.userRole,
        f.overallExperience,
        f.easeOfUse,
        f.aiAccuracy,
        f.uiDesign,
        f.recommend,
        f.useInHospital,
        `"${(f.likeMost || "").replace(/"/g, '""')}"`,
        `"${(f.problemsFaced || "").replace(/"/g, '""')}"`,
        `"${(f.suggestions || "").replace(/"/g, '""')}"`,
        dateStr
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `icu_guardian_market_validation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded successfully.");
  };

  const handlePrintPDF = () => {
    toast.info("Preparing PDF generation...", { description: "Opening system print dialogue." });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Rendering Helper: Loading Spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-gray-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER SECURITY SCREEN: Firebase Auth Login Form
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Dynamic Background shapes */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full bg-emerald-500/5 blur-3xl -z-10" />

        <div className="max-w-md w-full">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-12 h-12 hh-gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">ICU Guardian AI</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Metrics Security Gate</p>
          </div>

          <Card className="p-8 bg-white/80 backdrop-blur-md border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 hh-gradient-bg" />
            
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Admin Sign In</h2>
                <p className="text-xs text-gray-500 font-medium">Use Firebase credentials to view database logs</p>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-semibold text-gray-700 text-xs">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@healthhalo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs bg-white border-gray-200"
                    disabled={loginLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-semibold text-gray-700 text-xs">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-xs bg-white border-gray-200"
                    disabled={loginLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full font-bold shadow-lg shadow-primary/20 py-2 mt-2 gap-2"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Unlock Analytics"
                )}
              </Button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser({
                      email: "admin@healthhalo.com",
                      emailVerified: true,
                      uid: "demo-admin-uid",
                      displayName: "Demo Admin",
                    } as any);
                    setFeedbackList(MOCK_TRIAL_FEEDBACK);
                    toast.success("Entered demo bypass mode!");
                  }}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Developer Demo Bypass
                </button>
              </div>
            </form>
          </Card>
          <div className="text-center mt-6">
            <a href="/" className="text-xs font-semibold text-primary hover:underline">
              ← Return to Home Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER MAIN DASHBOARD: Loaded when signed in
  // -------------------------------------------------------------
  return (
    <AppLayout>
      {/* Dynamic print-to-PDF CSS styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, header, aside, .print\\:hidden, button, select, input {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .print\\:w-full {
            width: 100% !important;
            max-width: 100% !important;
          }
          .print\\:border {
            border: 1px solid #cbd5e1 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      ` }} />

      <div className="space-y-6 print:space-y-4 print:p-0 print:m-0">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:border-b print:pb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Market Validation Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1 print:text-black">
              Clinical validation trials feedback log and system performance metrics — live Firestore database
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" onClick={handlePrintPDF} className="gap-2 border-gray-200 h-9 font-semibold text-xs bg-white shadow-sm">
              <Printer className="w-4 h-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportCSV} className="gap-2 border-gray-200 h-9 font-semibold text-xs bg-white shadow-sm">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="gap-2 h-9 text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold text-xs shrink-0">
              <LogOut className="w-4 h-4" />
              Lock
            </Button>
          </div>
        </div>

        {/* Database Connection State */}
        {dbLoading && feedbackList.length === 0 ? (
          <div className="flex h-[50vh] items-center justify-center bg-white border border-border rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-gray-500">Connecting to Firestore stream...</p>
            </div>
          </div>
        ) : dbError ? (
          <div className="p-6 text-center bg-red-50 border border-red-200 rounded-xl max-w-lg mx-auto">
            <p className="text-sm font-bold text-red-600">{dbError}</p>
            <p className="text-xs text-red-500 mt-2">
              Verify your security rules permit read access to the 'feedback' collection for authorized users.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Dynamic Statistics KPI Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 print:grid-cols-2">
              <Card className="p-4 bg-white border border-border shadow-sm flex flex-col justify-between print:border print:shadow-none">
                <div>
                  <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">Total Feedback</p>
                  <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.totalCount}</h3>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  Live Firestore docs
                </div>
              </Card>

              <Card className="p-4 bg-white border border-border shadow-sm flex flex-col justify-between print:border print:shadow-none">
                <div>
                  <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">Overall Rating</p>
                  <div className="flex items-center gap-2 mt-2">
                    <h3 className="text-3xl font-black text-gray-900">{stats.avgOverall}</h3>
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <div className="mt-4 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                  Ease of Use: {stats.avgEaseOfUse} / 5
                </div>
              </Card>

              <Card className="p-4 bg-white border border-border shadow-sm flex flex-col justify-between print:border print:shadow-none">
                <div>
                  <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">AI Accuracy</p>
                  <div className="flex items-center gap-2 mt-2">
                    <h3 className="text-3xl font-black text-gray-900">{stats.avgAiAccuracy}</h3>
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="mt-4 text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full w-fit">
                  UI Rating: {stats.avgUiDesign} / 5
                </div>
              </Card>

              <Card className="p-4 bg-white border border-border shadow-sm flex flex-col justify-between print:border print:shadow-none">
                <div>
                  <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">Would Recommend</p>
                  <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.recommendRate}%</h3>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
                  <Smile className="w-3.5 h-3.5 text-emerald-500" />
                  Recommend HealthHalo
                </div>
              </Card>

              <Card className="p-4 bg-white border border-border shadow-sm flex flex-col justify-between print:border print:shadow-none">
                <div>
                  <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">Hospital Adoption</p>
                  <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.hospitalAdoptionRate}%</h3>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  In-hospital adoption
                </div>
              </Card>

              <Card className="p-4 bg-white border border-border shadow-sm flex flex-col justify-between print:border print:shadow-none">
                <div>
                  <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">User Demographics</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <h3 className="text-xl font-black text-primary">{stats.proCount}</h3>
                    <span className="text-[10px] text-gray-400 font-bold">Pros</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <h3 className="text-xl font-black text-gray-700">{stats.generalCount}</h3>
                    <span className="text-[10px] text-gray-400 font-bold">Guests</span>
                  </div>
                </div>
                <div className="mt-4 text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full w-fit">
                  Pros represented: {stats.proPercent}%
                </div>
              </Card>
            </div>

            {/* 2. dynamic auto insights engine */}
            <Card className="p-5 border border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-500/5 relative overflow-hidden print:border print:shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                  <Lightbulb className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Dynamic Insights Engine</h3>
                    <p className="text-xs text-gray-500 print:text-black">AI-style auto-generated validation conclusions from evaluated records</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    {insights.map((insight, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                        <span className="text-gray-700 font-medium print:text-black">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 3. Advanced Filtering Control Bar */}
            <Card className="p-4 bg-white border border-border shadow-sm print:hidden">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    Advanced Evaluation Filters
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchTerm("");
                      setRoleFilter("All");
                      setRatingFilter("All");
                      setDateFilter("all");
                      setRecommendFilter("All");
                      setAdoptionFilter("All");
                    }}
                    className="text-[10px] font-bold text-gray-500 h-8"
                  >
                    Reset Filters
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {/* Search Term */}
                  <div className="col-span-2 relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search name, text, suggestions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 text-xs h-9 bg-white"
                    />
                  </div>

                  {/* Role filter */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">User Role</label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg text-xs font-semibold px-2 py-1.5 h-9 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {uniqueRoles.map((role) => (
                        <option key={role} value={role}>
                          {role === "All" ? "All Roles" : role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating filter */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Overall Rating</label>
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg text-xs font-semibold px-2 py-1.5 h-9 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="All">All Ratings</option>
                      <option value="5">5 Stars only</option>
                      <option value="4plus">4 Stars & up</option>
                      <option value="3plus">3 Stars & up</option>
                      <option value="under3">Under 3 Stars</option>
                    </select>
                  </div>

                  {/* Recommend filter */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Recommendation</label>
                    <select
                      value={recommendFilter}
                      onChange={(e) => setRecommendFilter(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg text-xs font-semibold px-2 py-1.5 h-9 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="All">All Recommend</option>
                      <option value="Yes">Would Recommend (Yes)</option>
                      <option value="Maybe">Undecided (Maybe)</option>
                      <option value="No">Declined (No)</option>
                    </select>
                  </div>

                  {/* Adoption Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Adoption Interest</label>
                    <select
                      value={adoptionFilter}
                      onChange={(e) => setAdoptionFilter(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg text-xs font-semibold px-2 py-1.5 h-9 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="All">All Adoption</option>
                      <option value="Yes">Interested (Yes)</option>
                      <option value="No">No Interest (No)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  {/* Date Filter Selector */}
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Submission Period:</span>
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      {[
                        { key: "all", label: "All Time" },
                        { key: "24h", label: "Last 24h" },
                        { key: "7d", label: "Last 7d" },
                        { key: "30d", label: "Last 30d" }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setDateFilter(item.key)}
                          className={cn(
                            "text-[10px] font-bold px-3 py-1.5 border-r border-gray-200 last:border-0 hover:bg-gray-150 transition-colors",
                            dateFilter === item.key ? "bg-white text-primary" : "text-gray-600"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Order Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Sort by Date:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                      className="h-7 text-[10px] font-bold gap-1 bg-white border-gray-200"
                    >
                      <ArrowUpDown className="w-3 h-3" />
                      {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. Interactive Charts Layout Grid */}
            <div className="grid lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:w-full">
              {/* Chart 1: Time Series Submissions Curve */}
              <Card className="p-5 bg-white border border-border shadow-sm lg:col-span-1 print:border print:shadow-none">
                <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wide">Validation Submissions Trend</h3>
                <div className="h-60 print:w-full">
                  {timeSeriesData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">No date data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData} margin={{ left: -30, right: 10, top: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9 }} stroke="#e2e8f0" />
                        <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 9 }} stroke="#e2e8f0" />
                        <Tooltip formatter={(value) => [`${value} responses`, "Count"]} />
                        <Line type="monotone" dataKey="count" stroke="#00d898" strokeWidth={3} dot={{ r: 4, stroke: "#00d898", strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              {/* Chart 2: Category Ratings Radar */}
              <Card className="p-5 bg-white border border-border shadow-sm lg:col-span-1 print:border print:shadow-none">
                <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wide">Category Performance</h3>
                <div className="h-60 print:w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={scoreStatsData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 9, fontWeight: 650 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 8 }} />
                      <Radar name="Averages" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                      <Tooltip formatter={(value) => [`${value} / 5`, "Average"]} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Chart 3: Star Ratings Distribution */}
              <Card className="p-5 bg-white border border-border shadow-sm lg:col-span-1 print:border print:shadow-none">
                <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wide">Experience Star Distribution</h3>
                <div className="h-60 print:w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.byRating}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: -25, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                      <YAxis dataKey="rating" type="category" tickFormatter={(v) => `${v} ★`} stroke="#e2e8f0" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                      <Tooltip formatter={(value) => [`${value} votes`, "Submissions"]} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Chart 4: Role Demographics */}
              <Card className="p-5 bg-white border border-border shadow-sm lg:col-span-1 print:border print:shadow-none">
                <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wide">Role Demographics</h3>
                <div className="h-60 flex flex-col justify-center print:w-full">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} users`, "Count"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1 text-[9px] font-semibold text-gray-600">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Chart 5: Recommendation distribution Donut */}
              <Card className="p-5 bg-white border border-border shadow-sm lg:col-span-1 print:border print:shadow-none">
                <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wide">Would Recommend</h3>
                <div className="h-60 flex flex-col justify-center print:w-full">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={recommendPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {recommendPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={RECOMMEND_COLORS[index % RECOMMEND_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} votes`, "Count"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-x-4 mt-1">
                    {recommendPieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1 text-[9px] font-semibold text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: RECOMMEND_COLORS[index % RECOMMEND_COLORS.length] }} />
                        <span>{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Chart 6: Hospital Adoption Ratio */}
              <Card className="p-5 bg-white border border-border shadow-sm lg:col-span-1 print:border print:shadow-none">
                <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wide">Hospital Adoption Interest</h3>
                <div className="h-60 flex flex-col justify-center print:w-full">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={adoptionPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={55}
                          paddingAngle={0}
                          dataKey="value"
                        >
                          {adoptionPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={YES_NO_COLORS[index % YES_NO_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} votes`, "Count"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-x-4 mt-1">
                    {adoptionPieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1 text-[9px] font-semibold text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: YES_NO_COLORS[index % YES_NO_COLORS.length] }} />
                        <span>{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* 5. Detailed Testimonial / Review Cards Feed */}
            <div className="space-y-4 print:w-full print:border-t print:pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Recent User Feedback Feed ({filteredFeedback.length})
                </h3>
              </div>

              {filteredFeedback.length === 0 ? (
                <div className="text-center py-16 bg-white border border-border rounded-xl">
                  <Smile className="w-12 h-12 text-gray-300 mx-auto opacity-50 mb-3" />
                  <p className="text-sm font-semibold text-gray-500">No matching feedback cards found</p>
                  <p className="text-xs text-gray-400 mt-1">Adjust your filters to display older records.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
                  {filteredFeedback.map((item) => {
                    const isExpanded = !!expandedCards[item.id];
                    
                    const getLocalDateStr = (timestamp: any) => {
                      if (!timestamp) return "-";
                      let dateObj = new Date();
                      if (timestamp.toDate) {
                        dateObj = timestamp.toDate();
                      } else if (timestamp.seconds) {
                        dateObj = new Date(timestamp.seconds * 1000);
                      } else {
                        dateObj = new Date(timestamp);
                      }
                      return dateObj.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      });
                    };

                    const nameInitials = item.fullName
                      .replace("Dr. ", "")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <Card 
                        key={item.id} 
                        className={cn(
                          "p-5 bg-white border border-border hover:border-primary/20 hover:shadow-md transition-all relative flex flex-col justify-between print:border print:shadow-none print:break-inside-avoid",
                          isExpanded && "border-primary/20 ring-1 ring-primary/5"
                        )}
                      >
                        {/* Header Area */}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                {nameInitials}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 leading-tight">{item.fullName}</h4>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5 tracking-wider">{item.userRole}</p>
                              </div>
                            </div>
                            
                            {/* Stars rating */}
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-3.5 h-3.5",
                                      i < item.overallExperience 
                                        ? "text-yellow-400 fill-yellow-400" 
                                        : "text-gray-200"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] text-gray-400 mt-1 font-semibold">
                                {getLocalDateStr(item.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Badge className="bg-slate-100 text-gray-700 hover:bg-slate-100 text-[10px] border border-gray-200 font-bold">
                              AI Accuracy: {item.aiAccuracy}/5
                            </Badge>
                            <Badge className="bg-slate-100 text-gray-700 hover:bg-slate-100 text-[10px] border border-gray-200 font-bold">
                              Ease of Use: {item.easeOfUse}/5
                            </Badge>
                            <Badge className="bg-slate-100 text-gray-700 hover:bg-slate-100 text-[10px] border border-gray-200 font-bold">
                              UI: {item.uiDesign}/5
                            </Badge>

                            <Badge
                              className={cn(
                                "text-[10px] font-bold py-0 border",
                                item.recommend === "Yes"
                                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                                  : item.recommend === "Maybe"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50"
                                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
                              )}
                            >
                              Recommend: {item.recommend}
                            </Badge>
                            
                            <Badge
                              className={cn(
                                "text-[10px] font-bold py-0 border",
                                item.useInHospital === "Yes"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                  : "bg-slate-50 text-slate-500 border-gray-200 hover:bg-slate-50"
                              )}
                            >
                              Adoption: {item.useInHospital}
                            </Badge>
                          </div>
                        </div>

                        {/* Expandable comments */}
                        <div className={cn("mt-4 space-y-3 pt-3 border-t border-gray-150 text-xs", !isExpanded && "hidden print:block")}>
                          <div>
                            <span className="font-bold text-primary block mb-0.5">What is liked most:</span>
                            <p className="text-gray-700 italic">
                              {item.likeMost ? `"${item.likeMost}"` : "None provided"}
                            </p>
                          </div>
                          <div>
                            <span className="font-bold text-amber-700 block mb-0.5">Problems encountered:</span>
                            <p className="text-gray-700 italic">
                              {item.problemsFaced ? `"${item.problemsFaced}"` : "None provided"}
                            </p>
                          </div>
                          <div>
                            <span className="font-bold text-purple-700 block mb-0.5">Suggestions & feedback:</span>
                            <p className="text-gray-700 italic">
                              {item.suggestions ? `"${item.suggestions}"` : "None provided"}
                            </p>
                          </div>
                        </div>

                        {/* Collapsing Control */}
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-2 print:hidden">
                          <span className="text-[10px] text-gray-400 font-medium">Contact: {item.email}</span>
                          <button
                            type="button"
                            onClick={() => toggleCard(item.id)}
                            className="text-[10px] font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                          >
                            {isExpanded ? (
                              <>
                                Hide responses
                                <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                Read complete responses
                                <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
