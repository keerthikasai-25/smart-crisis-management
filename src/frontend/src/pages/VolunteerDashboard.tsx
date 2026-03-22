import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  MessageSquare,
  Navigation,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { IncidentReport, TaskAssignment, UserProfile } from "../backend";
import {
  Severity,
  Variant_pending_completed_inProgress,
  Variant_resolved_open_inProgress,
} from "../backend";
import {
  useGetAllIncidentReports,
  useGetCallerAssignedTasks,
  useUpdateIncidentStatus,
  useUpdateTaskStatus,
} from "../hooks/useQueries";

interface VolunteerDashboardProps {
  userProfile: UserProfile | null;
}

export default function VolunteerDashboard({
  userProfile,
}: VolunteerDashboardProps) {
  const [activeTab, setActiveTab] = useState("assigned-incidents");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const { data: myTasks = [], isLoading: tasksLoading } =
    useGetCallerAssignedTasks();
  const { data: allIncidents = [], isLoading: incidentsLoading } =
    useGetAllIncidentReports();
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();
  const { mutate: updateIncidentStatus } = useUpdateIncidentStatus();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error(
            "Unable to access location. Nearby incidents feature disabled.",
          );
        },
      );
    }
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get incidents assigned to the volunteer
  const assignedIncidentIds = myTasks.map((task) => task.incidentId);
  const assignedIncidents = allIncidents.filter((incident) =>
    assignedIncidentIds.some((id) => id === incident.id),
  );

  // Get nearby incidents (within 50km)
  const nearbyIncidents = userLocation
    ? allIncidents.filter((incident) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          incident.location.latitude,
          incident.location.longitude,
        );
        return (
          distance <= 50 &&
          incident.status !== Variant_resolved_open_inProgress.resolved
        );
      })
    : [];

  const activeTasks = myTasks.filter(
    (t) =>
      t.status === Variant_pending_completed_inProgress.pending ||
      t.status === Variant_pending_completed_inProgress.inProgress,
  );
  const completedTasks = myTasks.filter(
    (t) => t.status === Variant_pending_completed_inProgress.completed,
  );

  const handleUpdateIncidentStatus = (
    incidentId: bigint,
    newStatus: Variant_resolved_open_inProgress,
  ) => {
    updateIncidentStatus(
      { incidentId, newStatus },
      {
        onSuccess: () => {
          toast.success("Incident status updated successfully");
        },
        onError: (error) => {
          toast.error(`Failed to update status: ${error.message}`);
        },
      },
    );
  };

  const handleUpdateTaskStatus = (
    taskId: bigint,
    newStatus: Variant_pending_completed_inProgress,
  ) => {
    updateTaskStatus(
      { taskId, newStatus },
      {
        onSuccess: () => {
          toast.success("Task status updated successfully");
        },
        onError: (error) => {
          toast.error(`Failed to update task: ${error.message}`);
        },
      },
    );
  };

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

  const getStatusColor = (status: Variant_resolved_open_inProgress) => {
    switch (status) {
      case Variant_resolved_open_inProgress.open:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case Variant_resolved_open_inProgress.inProgress:
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case Variant_resolved_open_inProgress.resolved:
        return "bg-green-500/10 text-green-600 dark:text-green-400";
    }
  };

  const getStatusLabel = (status: Variant_resolved_open_inProgress) => {
    switch (status) {
      case Variant_resolved_open_inProgress.open:
        return "Open";
      case Variant_resolved_open_inProgress.inProgress:
        return "In Progress";
      case Variant_resolved_open_inProgress.resolved:
        return "Resolved";
    }
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-crisis-teal/10 p-2">
            <User className="h-6 w-6 text-crisis-teal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
              <Badge className="bg-crisis-teal text-white">Volunteer</Badge>
            </div>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.name || "Volunteer"}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Incidents
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-crisis-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedIncidents.length}</div>
            <p className="text-xs text-muted-foreground">
              Incidents assigned to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-crisis-teal" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks.length}</div>
            <p className="text-xs text-muted-foreground">Tasks in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tasks
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nearby Incidents
            </CardTitle>
            <Navigation className="h-4 w-4 text-crisis-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nearbyIncidents.length}</div>
            <p className="text-xs text-muted-foreground">Within 50km radius</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="assigned-incidents">
            Assigned Incidents
          </TabsTrigger>
          <TabsTrigger value="nearby-incidents">Nearby Incidents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="recovery">Recovery Updates</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Assigned Incidents Tab */}
        <TabsContent value="assigned-incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-crisis-orange" />
                Assigned Incidents
              </CardTitle>
              <CardDescription>
                Incidents assigned to you for response
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incidentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : assignedIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    No incidents assigned yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedIncidents.map((incident) => (
                    <div
                      key={Number(incident.id)}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              Incident #{Number(incident.id)}
                            </h3>
                            <Badge
                              className={getSeverityColor(incident.severity)}
                            >
                              {incident.severity}
                            </Badge>
                            <Badge className={getStatusColor(incident.status)}>
                              {getStatusLabel(incident.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {incident.category}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm">{incident.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{incident.location.region}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(
                              Number(incident.timestamp) / 1000000,
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {incident.status ===
                          Variant_resolved_open_inProgress.open && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateIncidentStatus(
                                incident.id,
                                Variant_resolved_open_inProgress.inProgress,
                              )
                            }
                          >
                            Start Working
                          </Button>
                        )}
                        {incident.status ===
                          Variant_resolved_open_inProgress.inProgress && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateIncidentStatus(
                                incident.id,
                                Variant_resolved_open_inProgress.resolved,
                              )
                            }
                          >
                            Mark as Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nearby Incidents Tab */}
        <TabsContent value="nearby-incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-crisis-blue" />
                Nearby Incidents
              </CardTitle>
              <CardDescription>
                Incidents within 50km of your current location
                {!userLocation && " (Location access required)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!userLocation ? (
                <div className="text-center py-8">
                  <Navigation className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Location access required to show nearby incidents
                  </p>
                </div>
              ) : incidentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : nearbyIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <Navigation className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    No nearby incidents found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nearbyIncidents.map((incident) => {
                    const distance = calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      incident.location.latitude,
                      incident.location.longitude,
                    );
                    return (
                      <div
                        key={Number(incident.id)}
                        className="rounded-lg border p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                Incident #{Number(incident.id)}
                              </h3>
                              <Badge
                                className={getSeverityColor(incident.severity)}
                              >
                                {incident.severity}
                              </Badge>
                              <Badge variant="outline">
                                {distance.toFixed(1)} km away
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {incident.category}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm">{incident.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{incident.location.region}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(
                                Number(incident.timestamp) / 1000000,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-crisis-teal" />
                My Tasks
              </CardTitle>
              <CardDescription>
                Tasks assigned to you with status management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : myTasks.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myTasks.map((task) => (
                    <div
                      key={Number(task.id)}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              Task #{Number(task.id)}
                            </h3>
                            <Badge
                              variant={
                                task.status ===
                                Variant_pending_completed_inProgress.completed
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {task.status ===
                              Variant_pending_completed_inProgress.pending
                                ? "Pending"
                                : task.status ===
                                    Variant_pending_completed_inProgress.inProgress
                                  ? "In Progress"
                                  : "Completed"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Incident #{Number(task.incidentId)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Resources:</span>{" "}
                          {task.resourcesAllocated}
                        </p>
                        <p className="text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {new Date(
                            Number(task.timestamp) / 1000000,
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {task.status ===
                          Variant_pending_completed_inProgress.pending && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateTaskStatus(
                                task.id,
                                Variant_pending_completed_inProgress.inProgress,
                              )
                            }
                          >
                            Start Task
                          </Button>
                        )}
                        {task.status ===
                          Variant_pending_completed_inProgress.inProgress && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateTaskStatus(
                                task.id,
                                Variant_pending_completed_inProgress.completed,
                              )
                            }
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recovery Updates Tab */}
        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-crisis-blue" />
                Recovery Updates
              </CardTitle>
              <CardDescription>
                Submit progress information and field updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  Recovery update submission feature coming soon
                </p>
                <p className="text-sm text-muted-foreground">
                  You will be able to submit progress reports, upload photos,
                  and add field notes here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-crisis-teal" />
                Volunteer Profile
              </CardTitle>
              <CardDescription>
                Your personal information and volunteer details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Name
                      </p>
                      <p className="text-lg">{userProfile.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Role
                      </p>
                      <Badge className="bg-crisis-teal text-white">
                        Volunteer
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Contact Info
                      </p>
                      <p className="text-lg">{userProfile.contactInfo}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Location
                      </p>
                      <p className="text-lg">{userProfile.location.region}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Coordinates
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {userProfile.location.latitude.toFixed(4)},{" "}
                        {userProfile.location.longitude.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Volunteer ID
                      </p>
                      <p className="text-sm font-mono">
                        {userProfile.id.toString().slice(0, 20)}...
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Profile information not available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-crisis-orange" />
                Messages
              </CardTitle>
              <CardDescription>
                Messages from administrators and authorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No new messages</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
