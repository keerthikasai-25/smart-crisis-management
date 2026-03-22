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
import { AlertCircle, ArrowLeft, Users } from "lucide-react";
import { useState } from "react";
import { UserRole } from "../backend";

interface VolunteerLoginProps {
  onBack: () => void;
  onNavigateToRegister: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export default function VolunteerLogin({
  onBack,
  onNavigateToRegister,
  onLoginSuccess,
}: VolunteerLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const raw = localStorage.getItem("volunteers_db");
      const db: Record<
        string,
        { name: string; email: string; password: string }
      > = raw ? JSON.parse(raw) : {};

      const record = db[email.toLowerCase().trim()];
      if (!record || record.password !== password) {
        setError("Invalid email or password. Please register first.");
        setIsLoading(false);
        return;
      }

      onLoginSuccess(UserRole.volunteer);
    } catch {
      setError("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/rescue-team-coordination.dim_800x600.png"
          alt="Rescue Team"
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
                <Users className="h-8 w-8 text-crisis-teal" />
              </div>
              <CardTitle className="text-2xl text-crisis-teal">
                Volunteer Login
              </CardTitle>
              <CardDescription>
                Enter your email and password to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert
                    variant="destructive"
                    data-ocid="volunteer.error_state"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="vol-email">Email</Label>
                  <Input
                    id="vol-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="volunteer@example.com"
                    required
                    data-ocid="volunteer.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vol-password">Password</Label>
                  <Input
                    id="vol-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    data-ocid="volunteer.input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-crisis-teal hover:bg-crisis-teal/90"
                  disabled={isLoading}
                  data-ocid="volunteer.submit_button"
                >
                  {isLoading ? "Logging in..." : "Login as Volunteer"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={onNavigateToRegister}
                  data-ocid="volunteer.secondary_button"
                >
                  New volunteer? Register here
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={onBack}
                  data-ocid="volunteer.cancel_button"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Role Selection
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
