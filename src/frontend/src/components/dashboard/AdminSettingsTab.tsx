import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Database, Lock, Settings, Shield } from "lucide-react";

export default function AdminSettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-crisis-blue" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure system rules, permissions, and operational parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-crisis-blue/10 p-2">
                  <Shield className="h-5 w-5 text-crisis-blue" />
                </div>
                <div>
                  <h3 className="font-semibold">Access Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage user roles and permissions
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure role-based access control, user permissions, and
                authentication settings.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-crisis-orange/10 p-2">
                  <Bell className="h-5 w-5 text-crisis-orange" />
                </div>
                <div>
                  <h3 className="font-semibold">Alert Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure alert thresholds and triggers
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Set up automatic alert generation rules based on severity,
                location, and environmental conditions.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-crisis-teal/10 p-2">
                  <Database className="h-5 w-5 text-crisis-teal" />
                </div>
                <div>
                  <h3 className="font-semibold">Data Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure data retention and backups
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage data retention policies, backup schedules, and data
                export configurations.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-purple-500/10 p-2">
                  <Lock className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure security and encryption
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage security protocols, encryption settings, and audit
                logging configurations.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Settings Configuration</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Advanced system configuration features will be available in a
                  future update. Contact system administrator for custom
                  configurations.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
