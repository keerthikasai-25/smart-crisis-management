import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, User, Users } from "lucide-react";

interface RoleSelectionProps {
  onSelectRole: (role: "admin" | "volunteer" | "citizen") => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/command-center-hero.dim_1200x600.png"
          alt="Command Center"
          className="h-full w-full object-cover opacity-20 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12">
        <div className="mx-auto max-w-4xl w-full">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img
              src="/assets/WhatsApp Image 2025-12-26 at 11.57.47 PM.jpeg"
              alt="Smart Crisis Management Logo"
              className="h-24 w-auto object-contain sm:h-32 md:h-40"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Welcome to{" "}
              <span className="text-crisis-blue">SMART CRISIS MANAGEMENT</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Together Through Crisis
            </p>
            <p className="text-lg text-muted-foreground">Login as:</p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Admin Card */}
            <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-crisis-orange">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-crisis-orange/10 transition-colors group-hover:bg-crisis-orange/20">
                  <Shield className="h-10 w-10 text-crisis-orange" />
                </div>
                <CardTitle className="text-2xl">Admin</CardTitle>
                <CardDescription className="text-base">
                  Full system control, analytics, and approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => onSelectRole("admin")}
                  className="w-full bg-crisis-orange hover:bg-crisis-orange/90"
                  size="lg"
                >
                  Login as Admin
                </Button>
              </CardContent>
            </Card>

            {/* Volunteer Card */}
            <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-crisis-teal">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-crisis-teal/10 transition-colors group-hover:bg-crisis-teal/20">
                  <Users className="h-10 w-10 text-crisis-teal" />
                </div>
                <CardTitle className="text-2xl">Volunteer</CardTitle>
                <CardDescription className="text-base">
                  Task management and alert response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => onSelectRole("volunteer")}
                  className="w-full bg-crisis-teal hover:bg-crisis-teal/90"
                  size="lg"
                >
                  Login as Volunteer
                </Button>
              </CardContent>
            </Card>

            {/* Citizen Card */}
            <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-crisis-blue">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-crisis-blue/10 transition-colors group-hover:bg-crisis-blue/20">
                  <User className="h-10 w-10 text-crisis-blue" />
                </div>
                <CardTitle className="text-2xl">Citizen</CardTitle>
                <CardDescription className="text-base">
                  Incident reporting and help requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => onSelectRole("citizen")}
                  className="w-full bg-crisis-blue hover:bg-crisis-blue/90"
                  size="lg"
                >
                  Login as Citizen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
