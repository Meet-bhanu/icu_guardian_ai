import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import RoleSelection from "./pages/RoleSelection";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminLogin from "./pages/AdminLogin";
import PatientLogin from "./pages/PatientLogin";
import Dashboard from "./pages/dashboard/Dashboard";
import PatientsPage from "./pages/dashboard/PatientsPage";
import LiveMonitoringPage from "./pages/dashboard/LiveMonitoringPage";
import WaveformsPage from "./pages/dashboard/WaveformsPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import HealthTrendsPage from "./pages/dashboard/HealthTrendsPage";
import MedicationsPage from "./pages/dashboard/MedicationsPage";
import AlertsPage from "./pages/dashboard/AlertsPage";
import DoctorsPage from "./pages/dashboard/DoctorsPage";
import FamilyContactsPage from "./pages/dashboard/FamilyContactsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import PatientDashboard from "./pages/PatientDashboard";
import PatientMonitoringPage from "./pages/patient/PatientMonitoringPage";
import PatientWaveformsPage from "./pages/patient/PatientWaveformsPage";
import PatientMedicationsPage from "./pages/patient/PatientMedicationsPage";
import { useAuth } from "./_core/hooks/useAuth";
import { Spinner } from "./components/ui/spinner";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  requiredRole?: string;
}

function ProtectedRouteComponent({ Component, requiredRole }: { Component: React.ComponentType; requiredRole?: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <NotFound />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <NotFound />;
  }

  return <Component />;
}

function ProtectedRoute({ path, component: Component, requiredRole }: ProtectedRouteProps) {
  return (
    <Route
      path={path}
      component={() => <ProtectedRouteComponent Component={Component} requiredRole={requiredRole} />}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login/admin"} component={AdminLogin} />
      <Route path={"/login/patient"} component={PatientLogin} />
      <Route path={"/role-selection"} component={RoleSelection} />

      {/* Main ICU Dashboard (all pages from design) */}
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/dashboard/patients"} component={PatientsPage} />
      <Route path={"/dashboard/monitoring"} component={LiveMonitoringPage} />
      <Route path={"/dashboard/waveforms"} component={WaveformsPage} />
      <Route path={"/dashboard/reports"} component={ReportsPage} />
      <Route path={"/dashboard/trends"} component={HealthTrendsPage} />
      <Route path={"/dashboard/medications"} component={MedicationsPage} />
      <Route path={"/dashboard/alerts"} component={AlertsPage} />
      <Route path={"/dashboard/doctors"} component={DoctorsPage} />
      <Route path={"/dashboard/family"} component={FamilyContactsPage} />
      <Route path={"/dashboard/settings"} component={SettingsPage} />

      {/* Patient portal — scoped to own data only */}
      <Route path="/patient/dashboard" component={PatientDashboard} />
      <Route path="/patient/monitoring" component={PatientMonitoringPage} />
      <Route path="/patient/waveforms" component={PatientWaveformsPage} />
      <Route path="/patient/medications" component={PatientMedicationsPage} />

      {/* Legacy role-based dashboards */}
      <ProtectedRoute path={"/doctor/dashboard"} component={DoctorDashboard} requiredRole="doctor" />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
