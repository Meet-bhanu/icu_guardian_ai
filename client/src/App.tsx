import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CriticalAlertProvider } from "./contexts/CriticalAlertContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";
import DoctorDashboard from "./pages/DoctorDashboard";
import Dashboard from "./pages/dashboard/Dashboard";
import Feedback from "./pages/Feedback";
import FeedbackAnalytics from "./pages/dashboard/FeedbackAnalytics";
import PatientsPage from "./pages/dashboard/PatientsPage";
import PatientManagementPage from "./pages/dashboard/PatientManagementPage";
import DoctorManagementPage from "./pages/dashboard/DoctorManagementPage";
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
import PatientAlertsPage from "./pages/patient/PatientAlertsPage";
import PatientSettingsPage from "./pages/patient/PatientSettingsPage";
import PatientPortalReportsPage from "./pages/patient/PatientReportsPage";
import PatientPortalTrendsPage from "./pages/patient/PatientTrendsPage";
import PatientPortalDoctorsPage from "./pages/patient/PatientDoctorsPage";
import PatientPortalFamilyPage from "./pages/patient/PatientFamilyPage";
import { VideoCallProvider } from "./contexts/VideoCallContext";
import { CameraStreamProvider } from "./contexts/CameraStreamContext";
import VideoCallWidget from "./components/VideoCallWidget";
import { AuthRoute, LoginRedirect } from "./components/auth/AuthRoute";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/login/admin"}><LoginRedirect /></Route>
      <Route path={"/login/patient"}><LoginRedirect /></Route>
      <Route path={"/role-selection"} component={RoleSelection} />
      <Route path={"/feedback"} component={Feedback} />

      {/* Admin ICU Dashboard — super_admin / admin only */}
      <AuthRoute path={"/dashboard"} component={Dashboard} area="admin" />
      <AuthRoute path={"/dashboard/patient-management"} component={PatientManagementPage} area="admin" />
      <AuthRoute path={"/dashboard/doctor-management"} component={DoctorManagementPage} area="admin" />
      <AuthRoute path={"/dashboard/feedback"} component={FeedbackAnalytics} area="admin" />
      <AuthRoute path={"/dashboard/patients"} component={PatientsPage} area="admin" />

      <AuthRoute path={"/dashboard/patients/:patientId/reports/upload"} component={PatientDetailUploadPage} area="admin" />
      <AuthRoute path={"/dashboard/patients/:patientId/reports"} component={PatientReportsPage} area="admin" />
      <AuthRoute path={"/dashboard/patients/:patientId/trends"} component={PatientTrendsPage} area="admin" />
      <AuthRoute path={"/dashboard/patients/:patientId/medications"} component={PatientMedicationsDetailPage} area="admin" />
      <AuthRoute path={"/dashboard/patients/:patientId/doctors"} component={PatientDoctorsPage} area="admin" />
      <AuthRoute path={"/dashboard/patients/:patientId/family"} component={PatientFamilyPage} area="admin" />
      <AuthRoute path={"/dashboard/patients/:patientId"} component={PatientOverviewPage} area="admin" />

      <AuthRoute path={"/dashboard/monitoring"} component={LiveMonitoringPage} area="admin" />
      <AuthRoute path={"/dashboard/waveforms"} component={WaveformsPage} area="admin" />
      <AuthRoute path={"/dashboard/medications"} component={MedicationsPage} area="admin" />
      <AuthRoute path={"/dashboard/alerts"} component={AlertsPage} area="admin" />
      <AuthRoute path={"/dashboard/settings"} component={SettingsPage} area="admin" />

      <AuthRoute path={"/dashboard/reports/upload"} component={UploadPastReportsPage} area="admin" />
      <AuthRoute path={"/dashboard/reports"} component={ReportsPage} area="admin" />
      <AuthRoute path={"/dashboard/trends"} component={HealthTrendsPage} area="admin" />
      <AuthRoute path={"/dashboard/doctors"} component={DoctorsPage} area="admin" />
      <AuthRoute path={"/dashboard/family"} component={FamilyContactsPage} area="admin" />

      {/* Patient portal — patient only (admin can also access) */}
      <AuthRoute path="/patient/dashboard" component={PatientDashboard} area="patient" />
      <AuthRoute path="/patient/overview" component={PatientPortalOverviewPage} area="patient" />
      <AuthRoute path="/patient/monitoring" component={PatientMonitoringPage} area="patient" />
      <AuthRoute path="/patient/waveforms" component={PatientWaveformsPage} area="patient" />
      <AuthRoute path="/patient/medications" component={PatientMedicationsPage} area="patient" />
      <AuthRoute path="/patient/alerts" component={PatientAlertsPage} area="patient" />
      <AuthRoute path="/patient/settings" component={PatientSettingsPage} area="patient" />
      <AuthRoute path="/patient/reports/upload" component={PatientPortalUploadPage} area="patient" />
      <AuthRoute path="/patient/reports" component={PatientPortalReportsPage} area="patient" />
      <AuthRoute path="/patient/trends" component={PatientPortalTrendsPage} area="patient" />
      <AuthRoute path="/patient/doctors" component={PatientPortalDoctorsPage} area="patient" />
      <AuthRoute path="/patient/family" component={PatientPortalFamilyPage} area="patient" />

      {/* Doctor dashboard */}
      <AuthRoute path={"/doctor/dashboard"} component={DoctorDashboard} area="doctor" />

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
          <VideoCallProvider>
            <CameraStreamProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
                <VideoCallWidget />
              </TooltipProvider>
            </CameraStreamProvider>
          </VideoCallProvider>
        </CriticalAlertProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
