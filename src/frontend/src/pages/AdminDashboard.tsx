import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Package,
  Settings,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "../backend";
import AdminAnalyticsTab from "../components/dashboard/AdminAnalyticsTab";
import AdminSettingsTab from "../components/dashboard/AdminSettingsTab";
import AdminTasksTab from "../components/dashboard/AdminTasksTab";
import AdminUsersTab from "../components/dashboard/AdminUsersTab";
import AdminVolunteersTab from "../components/dashboard/AdminVolunteersTab";
import AlertsTab from "../components/dashboard/AlertsTab";
import IncidentsTab from "../components/dashboard/IncidentsTab";
import RecoveryTab from "../components/dashboard/RecoveryTab";
import ResourcesTab from "../components/dashboard/ResourcesTab";
import {
  useGetActiveTasks,
  useGetAllAlerts,
  useGetAllIncidentReports,
  useGetAllVolunteers,
  useGetResourceInventory,
} from "../hooks/useQueries";

interface AdminDashboardProps {
  userProfile: UserProfile | null;
}

export default function AdminDashboard({ userProfile }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: alerts = [] } = useGetAllAlerts();
  const { data: incidents = [] } = useGetAllIncidentReports();
  const { data: resources } = useGetResourceInventory();
  const { data: tasks = [] } = useGetActiveTasks();
  const { data: volunteers = [] } = useGetAllVolunteers();

  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const openIncidents = incidents.filter((i) => i.status === "open").length;
  const activeTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "inProgress",
  ).length;
  const activeVolunteers = volunteers.filter((v) => v.approved).length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-crisis-orange/10 p-2">
            <Shield className="h-6 w-6 text-crisis-orange" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {userProfile?.name || "Administrator"}
            </p>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="volunteers" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Volunteers</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-1">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Incidents</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Resources</span>
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Recovery</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Alerts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-crisis-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{criticalAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  Requiring immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Incidents
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-crisis-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openIncidents}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Tasks
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-crisis-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTasks}</div>
                <p className="text-xs text-muted-foreground">
                  In progress or pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Volunteers
                </CardTitle>
                <Shield className="h-4 w-4 text-crisis-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeVolunteers}</div>
                <p className="text-xs text-muted-foreground">
                  Approved and ready
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-crisis-teal" />
                  Resource Status
                </CardTitle>
                <CardDescription>Current inventory levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resources && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Food</span>
                      <span className="font-semibold">
                        {Number(resources.food).toLocaleString()} units
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Water</span>
                      <span className="font-semibold">
                        {Number(resources.water).toLocaleString()} units
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medicine</span>
                      <span className="font-semibold">
                        {Number(resources.medicine).toLocaleString()} units
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vehicles</span>
                      <span className="font-semibold">
                        {Number(resources.vehicles).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Personnel</span>
                      <span className="font-semibold">
                        {Number(resources.personnel).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-crisis-blue" />
                  System Information
                </CardTitle>
                <CardDescription>Administrative overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Incidents</span>
                  <span className="font-semibold">{incidents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Alerts</span>
                  <span className="font-semibold">{alerts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Tasks</span>
                  <span className="font-semibold">{tasks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Volunteers</span>
                  <span className="font-semibold">{volunteers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Your Role</span>
                  <span className="font-semibold text-crisis-orange">
                    Administrator
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <AdminUsersTab />
        </TabsContent>

        <TabsContent value="volunteers">
          <AdminVolunteersTab />
        </TabsContent>

        <TabsContent value="incidents">
          <IncidentsTab userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsTab userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="tasks">
          <AdminTasksTab />
        </TabsContent>

        <TabsContent value="resources">
          <ResourcesTab userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="recovery">
          <RecoveryTab userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="analytics">
          <AdminAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
