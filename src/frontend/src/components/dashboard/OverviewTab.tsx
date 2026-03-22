import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  FileText,
  Package,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import type { UserProfile } from "../../backend";
import { Severity, Variant_resolved_open_inProgress } from "../../backend";
import {
  useGetAllAlerts,
  useGetAllIncidentReports,
  useGetResourceInventory,
  useIsCallerAdmin,
} from "../../hooks/useQueries";

interface OverviewTabProps {
  userProfile: UserProfile | null;
}

export default function OverviewTab({ userProfile }: OverviewTabProps) {
  const { data: alerts, isLoading: alertsLoading } = useGetAllAlerts();
  const { data: incidents, isLoading: incidentsLoading } =
    useGetAllIncidentReports();
  const { data: resources, isLoading: resourcesLoading } =
    useGetResourceInventory();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const criticalAlerts =
    alerts?.filter((a) => a.severity === Severity.critical).length || 0;
  const openIncidents =
    incidents?.filter((i) => i.status === Variant_resolved_open_inProgress.open)
      .length || 0;

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.low:
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case Severity.medium:
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case Severity.high:
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case Severity.critical:
        return "bg-red-500/10 text-red-600 dark:text-red-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-crisis-blue/10 via-crisis-teal/5 to-background p-8">
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-crisis-blue/20 p-3">
              <Shield className="h-8 w-8 text-crisis-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">System Status</h2>
              <p className="text-sm text-muted-foreground">
                Real-time crisis management overview
              </p>
            </div>
          </div>
          {!adminLoading && isAdmin && (
            <Badge
              variant="outline"
              className="border-crisis-orange text-crisis-orange"
            >
              Administrator Access
            </Badge>
          )}
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          <img
            src="/assets/generated/command-center-hero.dim_1200x600.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-crisis-orange/20 bg-gradient-to-br from-crisis-orange/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-crisis-orange" />
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{alerts?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {criticalAlerts} critical
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-crisis-blue/20 bg-gradient-to-br from-crisis-blue/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Incident Reports
            </CardTitle>
            <FileText className="h-4 w-4 text-crisis-blue" />
          </CardHeader>
          <CardContent>
            {incidentsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {incidents?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {openIncidents} open
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-crisis-teal/20 bg-gradient-to-br from-crisis-teal/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Resources
            </CardTitle>
            <Package className="h-4 w-4 text-crisis-teal" />
          </CardHeader>
          <CardContent>
            {resourcesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {Number(resources?.food || 0) + Number(resources?.water || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Food & Water units
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personnel</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {resourcesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {Number(resources?.personnel || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active responders
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-crisis-orange" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={Number(alert.id)}
                  className="flex items-start justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {alert.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {alert.location.region}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(
                      Number(alert.timestamp) / 1000000,
                    ).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No alerts at this time
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-crisis-teal/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-crisis-teal" />
              Resource Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resourcesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Food</span>
                  <span className="font-medium">
                    {Number(resources?.food || 0)} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Water</span>
                  <span className="font-medium">
                    {Number(resources?.water || 0)} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Medicine</span>
                  <span className="font-medium">
                    {Number(resources?.medicine || 0)} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Vehicles</span>
                  <span className="font-medium">
                    {Number(resources?.vehicles || 0)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-crisis-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-crisis-blue" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Your Region</span>
              <span className="font-medium">
                {userProfile?.location.region || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Role</span>
              <span className="font-medium capitalize">
                {userProfile?.role || "User"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Contact</span>
              <span className="font-medium">
                {userProfile?.contactInfo || "Not set"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
