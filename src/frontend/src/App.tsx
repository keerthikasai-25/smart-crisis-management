import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { UserRole } from "./backend";
import AdminLogin from "./components/AdminLogin";
import CitizenLogin from "./components/CitizenLogin";
import Footer from "./components/Footer";
import Header from "./components/Header";
import RoleSelection from "./components/RoleSelection";
import VolunteerLogin from "./components/VolunteerLogin";
import VolunteerRegister from "./components/VolunteerRegister";
import AdminDashboard from "./pages/AdminDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";

type ViewState =
  | "role-selection"
  | "admin-login"
  | "volunteer-login"
  | "volunteer-register"
  | "citizen-login";

const SESSION_ROLE_KEY = "sc_session_role";

export default function App() {
  const [viewState, setViewState] = useState<ViewState>("role-selection");
  const [sessionRole, setSessionRole] = useState<UserRole | null>(() => {
    const stored = sessionStorage.getItem(SESSION_ROLE_KEY);
    if (stored === UserRole.admin) return UserRole.admin;
    if (stored === UserRole.volunteer) return UserRole.volunteer;
    if (stored === UserRole.citizen) return UserRole.citizen;
    return null;
  });

  const handleLoginSuccess = (role: UserRole) => {
    sessionStorage.setItem(SESSION_ROLE_KEY, role);
    setSessionRole(role);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_ROLE_KEY);
    setSessionRole(null);
    setViewState("role-selection");
  };

  const renderContent = () => {
    if (sessionRole === UserRole.admin)
      return <AdminDashboard userProfile={null} />;
    if (sessionRole === UserRole.volunteer)
      return <VolunteerDashboard userProfile={null} />;
    if (sessionRole === UserRole.citizen)
      return <CitizenDashboard userProfile={null} />;

    if (viewState === "role-selection") {
      return (
        <RoleSelection
          onSelectRole={(role) => {
            if (role === "admin") setViewState("admin-login");
            else if (role === "volunteer") setViewState("volunteer-login");
            else setViewState("citizen-login");
          }}
        />
      );
    }
    if (viewState === "admin-login")
      return (
        <AdminLogin
          onBack={() => setViewState("role-selection")}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    if (viewState === "volunteer-login")
      return (
        <VolunteerLogin
          onBack={() => setViewState("role-selection")}
          onNavigateToRegister={() => setViewState("volunteer-register")}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    if (viewState === "volunteer-register")
      return (
        <VolunteerRegister onBack={() => setViewState("volunteer-login")} />
      );
    if (viewState === "citizen-login")
      return (
        <CitizenLogin
          onBack={() => setViewState("role-selection")}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    return null;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col bg-background">
        <Header
          onLogout={handleLogout}
          isAuthenticated={sessionRole !== null}
        />
        <main className="flex-1">{renderContent()}</main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
