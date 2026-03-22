import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, FileText, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "../backend";
import AlertsTab from "../components/dashboard/AlertsTab";
import IncidentsTab from "../components/dashboard/IncidentsTab";
import OverviewTab from "../components/dashboard/OverviewTab";

interface DashboardProps {
  userProfile: UserProfile | null;
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Crisis Management Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {userProfile?.name || "User"} •{" "}
          {userProfile?.location.region || "Unknown Region"}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Incidents</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertsTab userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <IncidentsTab userProfile={userProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
