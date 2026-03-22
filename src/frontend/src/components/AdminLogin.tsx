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
import { AlertCircle, ArrowLeft, Shield } from "lucide-react";
import { useState } from "react";
import { UserRole } from "../backend";

interface AdminLoginProps {
  onBack: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export default function AdminLogin({
  onBack,
  onLoginSuccess,
}: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (email !== "admin@example.com" || password !== "password") {
      setError("Invalid credentials. Please try again.");
      setIsLoading(false);
      return;
    }

    onLoginSuccess(UserRole.admin);
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/command-center-hero.dim_1200x600.png"
          alt="Command Center"
          className="h-full w-full object-cover opacity-20 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      </div>

      <div className="relative z-10 container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <img
                src="/assets/WhatsApp Image 2025-12-26 at 11.57.47 PM.jpeg"
                alt="Smart Crisis Management Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="text-lg text-muted-foreground italic">
              Together Through Crisis
            </p>
          </div>

          <Card className="border-2 border-crisis-blue/30 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-crisis-blue/10">
                <Shield className="h-8 w-8 text-crisis-blue" />
              </div>
              <CardTitle className="text-2xl text-crisis-blue">
                Admin Login
              </CardTitle>
              <CardDescription>
                Enter your administrator credentials to access the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    data-ocid="admin.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    data-ocid="admin.input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-crisis-blue hover:bg-crisis-blue/90"
                  disabled={isLoading}
                  data-ocid="admin.submit_button"
                >
                  {isLoading ? "Logging in..." : "Login as Admin"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={onBack}
                  data-ocid="admin.cancel_button"
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
