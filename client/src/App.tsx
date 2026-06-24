import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CriticalAlertProvider } from "./contexts/CriticalAlertContext";
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
import UploadPastReportsPage, {
  PatientDetailUploadPage,
  PatientPortalUploadPage,
} from "./pages/dashboard/UploadPastReportsPage";
import HealthTrendsPage from "./pages/dashboard/HealthTrendsPage";
import MedicationsPage from "./pages/dashboard/MedicationsPage";
import AlertsPage from "./pages/dashboard/AlertsPage";
import DoctorsPage from "./pages/dashboard/DoctorsPage";
import FamilyContactsPage from "./pages/dashboard/FamilyContactsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import PatientOverviewPage from "./pages/patient-detail/PatientOverviewPage";
import PatientReportsPage from "./pages/patient-detail/PatientReportsPage";
import PatientTrendsPage from "./pages/patient-detail/PatientTrendsPage";
import PatientMedicationsDetailPage from "./pages/patient-detail/PatientMedicationsDetailPage";
import PatientDoctorsPage from "./pages/patient-detail/PatientDoctorsPage";
import PatientFamilyPage from "./pages/patient-detail/PatientFamilyPage";
import PatientDashboard from "./pages/PatientDashboard";
import PatientPortalOverviewPage from "./pages/patient/PatientOverviewPage";
import PatientMonitoringPage from "./pages/patient/PatientMonitoringPage";
import PatientWaveformsPage from "./pages/patient/PatientWaveformsPage";
import PatientMedicationsPage from "./pages/patient/PatientMedicationsPage";
import PatientPortalReportsPage from "./pages/patient/PatientReportsPage";
import PatientPortalTrendsPage from "./pages/patient/PatientTrendsPage";
import PatientPortalDoctorsPage from "./pages/patient/PatientDoctorsPage";
import PatientPortalFamilyPage from "./pages/patient/PatientFamilyPage";
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

      {/* Admin ICU Dashboard */}
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/dashboard/patients"} component={PatientsPage} />

      {/* Patient detail (admin) — accessed by clicking a patient */}
      <Route path={"/dashboard/patients/:patientId/reports/upload"} component={PatientDetailUploadPage} />
      <Route path={"/dashboard/patients/:patientId/reports"} component={PatientReportsPage} />
      <Route path={"/dashboard/patients/:patientId/trends"} component={PatientTrendsPage} />
      <Route path={"/dashboard/patients/:patientId/medications"} component={PatientMedicationsDetailPage} />
      <Route path={"/dashboard/patients/:patientId/doctors"} component={PatientDoctorsPage} />
      <Route path={"/dashboard/patients/:patientId/family"} component={PatientFamilyPage} />
      <Route path={"/dashboard/patients/:patientId"} component={PatientOverviewPage} />

      <Route path={"/dashboard/monitoring"} component={LiveMonitoringPage} />
      <Route path={"/dashboard/waveforms"} component={WaveformsPage} />
      <Route path={"/dashboard/medications"} component={MedicationsPage} />
      <Route path={"/dashboard/alerts"} component={AlertsPage} />
      <Route path={"/dashboard/settings"} component={SettingsPage} />

      {/* Legacy routes redirect to patients list */}
      <Route path={"/dashboard/reports/upload"} component={UploadPastReportsPage} />
      <Route path={"/dashboard/reports"} component={ReportsPage} />
      <Route path={"/dashboard/trends"} component={HealthTrendsPage} />
      <Route path={"/dashboard/doctors"} component={DoctorsPage} />
      <Route path={"/dashboard/family"} component={FamilyContactsPage} />

      {/* Patient portal */}
      <Route path="/patient/dashboard" component={PatientDashboard} />
      <Route path="/patient/overview" component={PatientPortalOverviewPage} />
      <Route path="/patient/monitoring" component={PatientMonitoringPage} />
      <Route path="/patient/waveforms" component={PatientWaveformsPage} />
      <Route path="/patient/reports/upload" component={PatientPortalUploadPage} />
      <Route path="/patient/reports" component={PatientPortalReportsPage} />
      <Route path="/patient/trends" component={PatientPortalTrendsPage} />
      <Route path="/patient/medications" component={PatientMedicationsPage} />
      <Route path="/patient/doctors" component={PatientPortalDoctorsPage} />
      <Route path="/patient/family" component={PatientPortalFamilyPage} />

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
        <CriticalAlertProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CriticalAlertProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
