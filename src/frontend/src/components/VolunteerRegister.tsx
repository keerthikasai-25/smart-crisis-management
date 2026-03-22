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
import { AlertCircle, ArrowLeft, CheckCircle2, UserPlus } from "lucide-react";
import { useState } from "react";

interface VolunteerRegisterProps {
  onBack: () => void;
}

export default function VolunteerRegister({ onBack }: VolunteerRegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const raw = localStorage.getItem("volunteers_db");
      const db: Record<
        string,
        { name: string; email: string; password: string }
      > = raw ? JSON.parse(raw) : {};

      const key = email.toLowerCase().trim();
      if (db[key]) {
        setError("An account with this email already exists.");
        setIsLoading(false);
        return;
      }

      db[key] = { name, email: key, password };
      localStorage.setItem("volunteers_db", JSON.stringify(db));
      setSuccess(true);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundSection = (
    <div className="absolute inset-0 z-0">
      <img
        src="/assets/generated/rescue-team-coordination.dim_800x600.png"
        alt="Rescue Team"
        className="h-full w-full object-cover opacity-20 dark:opacity-10"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
    </div>
  );

  const logoSection = (
    <div className="mb-8 flex justify-center">
      <img
        src="/assets/WhatsApp Image 2025-12-26 at 11.57.47 PM.jpeg"
        alt="Smart Crisis Management Logo"
        className="h-20 w-auto object-contain"
      />
    </div>
  );

  if (success) {
    return (
      <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
        {backgroundSection}
        <div className="relative z-10 container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12">
          <div className="w-full max-w-md">
            {logoSection}
            <Card className="border-2 border-green-500/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl">
                  Registration Successful!
                </CardTitle>
                <CardDescription>
                  Your volunteer account has been created
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    You can now log in with your email and password.
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {email}
                  </p>
                </div>
                <Button
                  className="w-full bg-crisis-teal hover:bg-crisis-teal/90"
                  onClick={onBack}
                  data-ocid="volunteer.primary_button"
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      {backgroundSection}
      <div className="relative z-10 container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md">
          {logoSection}
          <Card className="border-2 border-crisis-teal/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-crisis-teal/10">
                <UserPlus className="h-8 w-8 text-crisis-teal" />
              </div>
              <CardTitle className="text-2xl">Volunteer Registration</CardTitle>
              <CardDescription>
                Create an account to help during crisis situations
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
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    data-ocid="volunteer.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    data-ocid="volunteer.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    data-ocid="volunteer.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                  <Input
                    id="reg-confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    data-ocid="volunteer.input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-crisis-teal hover:bg-crisis-teal/90"
                  disabled={isLoading}
                  data-ocid="volunteer.submit_button"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Registering...
                    </>
                  ) : (
                    "Register as Volunteer"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={onBack}
                  disabled={isLoading}
                  data-ocid="volunteer.cancel_button"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
