import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, User } from "lucide-react";
import { useState } from "react";
import { UserRole } from "../backend";

interface CitizenLoginProps {
  onBack: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

const BLOCKED_EMAILS = ["admin@example.com", "rescue@example.com"];
const CITIZENS_DB_KEY = "citizens_db";

type CitizenRecord = { name: string; email: string; password: string };

function getCitizensDb(): Record<string, CitizenRecord> {
  try {
    const raw = localStorage.getItem(CITIZENS_DB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCitizensDb(db: Record<string, CitizenRecord>) {
  localStorage.setItem(CITIZENS_DB_KEY, JSON.stringify(db));
}

export default function CitizenLogin({
  onBack,
  onLoginSuccess,
}: CitizenLoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val: string): boolean => {
    if (!val.includes("@")) {
      setError("Invalid email address");
      return false;
    }
    if (BLOCKED_EMAILS.includes(val.toLowerCase())) {
      setError("Access denied for this email");
      return false;
    }
    return true;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!validateEmail(email)) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    const db = getCitizensDb();
    const key = email.toLowerCase().trim();
    if (db[key]) {
      setError("Account already exists. Please login.");
      setIsLoading(false);
      return;
    }
    db[key] = { name: name.trim(), email: email.trim(), password };
    saveCitizensDb(db);
    onLoginSuccess(UserRole.citizen);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setIsLoading(true);
    const db = getCitizensDb();
    const record = db[email.toLowerCase().trim()];
    if (!record || record.password !== password) {
      setError(
        "Invalid email or password. If you are new, please register first.",
      );
      setIsLoading(false);
      return;
    }
    onLoginSuccess(UserRole.citizen);
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/citizen-community-bg.dim_1200x600.png"
          alt="Community"
          className="h-full w-full object-cover opacity-20 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      </div>
      <div className="relative z-10 container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <img
              src="/assets/WhatsApp Image 2025-12-26 at 11.57.47 PM.jpeg"
              alt="Smart Crisis Management Logo"
              className="h-20 w-auto object-contain"
            />
          </div>
          <Card className="border-2 border-crisis-teal/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-crisis-teal/10">
                <User className="h-8 w-8 text-crisis-teal" />
              </div>
              <CardTitle className="text-2xl text-crisis-teal">
                {isRegistering ? "Citizen Registration" : "Citizen Login"}
              </CardTitle>
              <CardDescription>
                {isRegistering
                  ? "Create your account to report incidents and receive alerts"
                  : "Access your citizen dashboard"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {isRegistering ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-crisis-teal hover:bg-crisis-teal/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : "Create Account"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setIsRegistering(false);
                      setError("");
                    }}
                  >
                    Already have an account? Login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-crisis-teal hover:bg-crisis-teal/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setIsRegistering(true);
                      setError("");
                    }}
                  >
                    New here? Register as Citizen
                  </Button>
                </form>
              )}
              <Button
                type="button"
                variant="ghost"
                className="mt-2 w-full"
                onClick={onBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Role Selection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
