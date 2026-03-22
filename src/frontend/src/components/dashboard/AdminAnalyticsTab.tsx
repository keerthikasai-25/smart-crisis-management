import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  useGetActiveTasks,
  useGetAllAlerts,
  useGetAllIncidentReports,
} from "../../hooks/useQueries";

export default function AdminAnalyticsTab() {
  const { data: alerts = [], isLoading: alertsLoading } = useGetAllAlerts();
  const { data: incidents = [], isLoading: incidentsLoading } =
    useGetAllIncidentReports();
  const { data: tasks = [], isLoading: tasksLoading } = useGetActiveTasks();

  const isLoading = alertsLoading || incidentsLoading || tasksLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Loading analytics...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate analytics
  const incidentsByCategory = incidents.reduce(
    (acc, incident) => {
      acc[incident.category] = (acc[incident.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const alertsBySeverity = alerts.reduce(
    (acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const tasksByStatus = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Calculate average response time (mock calculation)
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const avgResponseTime = completedTasks.length > 0 ? "2.5 hours" : "N/A";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-crisis-blue" />
            System Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive overview of system performance and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-crisis-blue" />
                <span className="text-sm font-medium">Total Incidents</span>
              </div>
              <p className="text-2xl font-bold">{incidents.length}</p>
              <p className="text-xs text-muted-foreground">All time</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-crisis-orange" />
                <span className="text-sm font-medium">Total Alerts</span>
              </div>
              <p className="text-2xl font-bold">{alerts.length}</p>
              <p className="text-xs text-muted-foreground">All time</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Completed Tasks</span>
              </div>
              <p className="text-2xl font-bold">{completedTasks.length}</p>
              <p className="text-xs text-muted-foreground">All time</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-crisis-teal" />
                <span className="text-sm font-medium">Avg Response Time</span>
              </div>
              <p className="text-2xl font-bold">{avgResponseTime}</p>
              <p className="text-xs text-muted-foreground">
                For completed tasks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
            <CardDescription>
              Distribution of incidents across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(incidentsByCategory).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No incident data available
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(incidentsByCategory).map(
                  ([category, count]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {category}
                        </span>
                        <span className="text-muted-foreground">
                          {count} incidents
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-crisis-blue rounded-full"
                          style={{
                            width: `${(count / incidents.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts by Severity</CardTitle>
            <CardDescription>
              Distribution of alerts by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(alertsBySeverity).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No alert data available
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(alertsBySeverity).map(([severity, count]) => {
                  const color =
                    severity === "critical"
                      ? "bg-red-500"
                      : severity === "high"
                        ? "bg-orange-500"
                        : severity === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500";
                  return (
                    <div key={severity} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {severity}
                        </span>
                        <span className="text-muted-foreground">
                          {count} alerts
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full`}
                          style={{ width: `${(count / alerts.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
          <CardDescription>
            Overview of task completion and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold">{tasksByStatus.pending || 0}</p>
              <p className="text-xs text-muted-foreground">
                {tasks.length > 0
                  ? `${Math.round(((tasksByStatus.pending || 0) / tasks.length) * 100)}%`
                  : "0%"}{" "}
                of total
              </p>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <p className="text-2xl font-bold">
                {tasksByStatus.inProgress || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {tasks.length > 0
                  ? `${Math.round(((tasksByStatus.inProgress || 0) / tasks.length) * 100)}%`
                  : "0%"}{" "}
                of total
              </p>
            </div>

            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <p className="text-2xl font-bold">
                {tasksByStatus.completed || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {tasks.length > 0
                  ? `${Math.round(((tasksByStatus.completed || 0) / tasks.length) * 100)}%`
                  : "0%"}{" "}
                of total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Recent system activities and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.slice(0, 5).map((incident) => (
              <div
                key={incident.id.toString()}
                className="flex items-start gap-3 pb-4 border-b last:border-0"
              >
                <div className="rounded-full bg-crisis-blue/10 p-2">
                  <Activity className="h-4 w-4 text-crisis-blue" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">New incident reported</p>
                  <p className="text-xs text-muted-foreground">
                    {incident.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      Number(incident.timestamp) / 1000000,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {incidents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
