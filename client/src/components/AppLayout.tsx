import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  Monitor,
  Activity,
  FileText,
  TrendingUp,
  Pill,
  Bell,
  Stethoscope,
  Contact,
  Settings,
  LogOut,
  Heart,
  Search,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { usePatientAuth } from "@/hooks/usePatientAuth";

function getInitials(name?: string | null): string {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export const adminNavItems: NavItem[] = [
  { icon: Users, label: "Patients", path: "/dashboard/patients" },
  { icon: Monitor, label: "Live Monitoring", path: "/dashboard/monitoring" },
  { icon: Activity, label: "Waveforms", path: "/dashboard/waveforms" },
  { icon: Bell, label: "Alerts", path: "/dashboard/alerts" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export const patientNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/patient/dashboard" },
  { icon: Monitor, label: "Live Monitoring", path: "/patient/monitoring" },
  { icon: Activity, label: "Waveforms", path: "/patient/waveforms" },
  { icon: FileText, label: "Reports", path: "/patient/reports" },
  { icon: TrendingUp, label: "Health Trends", path: "/patient/trends" },
  { icon: Pill, label: "Medications", path: "/patient/medications" },
  { icon: Stethoscope, label: "Doctors", path: "/patient/doctors" },
  { icon: Contact, label: "Family Contacts", path: "/patient/family" },
];

interface AppLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  userName?: string;
  userRole?: string;
  userInitials?: string;
  logoutPath?: string;
  onLogout?: () => void | Promise<void>;
  searchPlaceholder?: string;
}

export default function AppLayout({
  children,
  navItems,
  userName,
  userRole,
  userInitials,
  logoutPath,
  onLogout,
  searchPlaceholder = "Search patients, alerts...",
}: AppLayoutProps) {
  const { user: patientUser, session, isPatient, logout: patientLogout } = usePatientAuth();

  const resolvedNavItems = (navItems ?? adminNavItems).filter(
    (item) => !isPatient || item.path !== "/dashboard/patients"
  );
  const resolvedUserName = userName ?? (isPatient ? (patientUser?.name ?? "Patient") : "Admin");
  const resolvedUserRole =
    userRole ??
    (isPatient
      ? `${session?.bedNo ?? "ICU-01"} · ${session?.patientId ?? "P001"}`
      : "ICU Supervisor");
  const resolvedUserInitials = userInitials ?? (isPatient ? getInitials(patientUser?.name) : "AD");
  const resolvedLogoutPath = logoutPath ?? (isPatient ? "/login/patient" : "/login/admin");
  const resolvedOnLogout = onLogout ?? (isPatient ? patientLogout : undefined);
  const resolvedSearchPlaceholder = searchPlaceholder !== "Search patients, alerts..."
    ? searchPlaceholder
    : (isPatient ? "Search your records..." : "Search patients, alerts...");

  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    setShowLogout(false);
    if (resolvedOnLogout) {
      await resolvedOnLogout();
    }
    setLocation(resolvedLogoutPath);
  };

  const rootPath = resolvedNavItems[0]?.path ?? "/dashboard";
  const isActive = (path: string) =>
    path === rootPath ? location === path : location.startsWith(path);

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border flex flex-col transition-transform duration-200 shadow-[var(--hh-shadow-md)] lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
          <div className="w-9 h-9 hh-gradient-bg rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-primary/30">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-foreground text-sm leading-tight tracking-tight">
            HealthHalo
          </span>
          <button
            className="ml-auto lg:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {resolvedNavItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-30 shadow-[var(--hh-shadow-sm)]">
          <button
            className="lg:hidden text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={resolvedSearchPlaceholder}
              className="pl-9 bg-white border-border"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-lg hover:bg-accent text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {resolvedUserInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-foreground leading-none">{resolvedUserName}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">{resolvedUserRole}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <LogOut className="w-7 h-7 text-primary" />
            </div>
            <AlertDialogTitle className="text-center">
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You will be redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-primary hover:bg-primary/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
