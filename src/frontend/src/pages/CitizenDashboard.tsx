import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Location, Severity, type UserProfile } from "../backend";
import {
  useGetAlertsByRegion,
  useGetCallerIncidentReports,
  useGetEmergencyContactsByRegion,
  useGetNotificationsForUser,
  useMarkNotificationAsRead,
  useReportIncident,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

interface CitizenDashboardProps {
  userProfile: UserProfile | null;
}

type Section =
  | "report"
  | "incidents"
  | "contacts"
  | "notifications"
  | "profile";

export default function CitizenDashboard({
  userProfile,
}: CitizenDashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>("report");
  const [reportForm, setReportForm] = useState({
    description: "",
    category: "",
    severity: Severity.medium,
  });
  const [location, setLocation] = useState<Location | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || "",
    region: userProfile?.location.region || "",
    contactInfo: userProfile?.contactInfo || "",
  });

  const { data: myIncidents = [], isLoading: incidentsLoading } =
    useGetCallerIncidentReports();
  const { data: alerts = [], isLoading: alertsLoading } = useGetAlertsByRegion(
    userProfile?.location.region || "",
  );
  const { data: emergencyContacts = [], isLoading: contactsLoading } =
    useGetEmergencyContactsByRegion(userProfile?.location.region || "");
  const { data: notifications = [], isLoading: notificationsLoading } =
    useGetNotificationsForUser();
  const reportIncident = useReportIncident();
  const markAsRead = useMarkNotificationAsRead();
  const saveProfile = useSaveCallerUserProfile();

  const detectLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            region: userProfile?.location.region || "Unknown",
          });
          setIsDetectingLocation(false);
          toast.success("Location detected successfully");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Failed to detect location. Please enter manually.");
          setIsDetectingLocation(false);
        },
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsDetectingLocation(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast.error("Please detect or enter your location");
      return;
    }

    try {
      await reportIncident.mutateAsync({
        location,
        description: reportForm.description,
        severity: reportForm.severity,
        category: reportForm.category,
      });

      toast.success("Incident reported successfully");
      setReportForm({
        description: "",
        category: "",
        severity: Severity.medium,
      });
      setLocation(null);
      setActiveSection("incidents");
    } catch (error: any) {
      toast.error(error.message || "Failed to report incident");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile) return;

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        name: profileForm.name,
        contactInfo: profileForm.contactInfo,
        location: {
          ...userProfile.location,
          region: profileForm.region,
        },
      });

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleMarkAsRead = async (notificationId: bigint) => {
    try {
      await markAsRead.mutateAsync({ notificationId });
      toast.success("Notification marked as read");
    } catch (error: any) {
      toast.error(error.message || "Failed to mark notification as read");
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.low:
        return "bg-green-500";
      case Severity.medium:
        return "bg-yellow-500";
      case Severity.high:
        return "bg-orange-500";
      case Severity.critical:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
          >
            <Clock className="mr-1 h-3 w-3" />
            Open
          </Badge>
        );
      case "inProgress":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-700 dark:text-blue-400"
          >
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-700 dark:text-green-400"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderReportSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-crisis-orange" />
          Report Incident
        </CardTitle>
        <CardDescription>
          Report an emergency or incident in your area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="flex-1"
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Detect Location
                  </>
                )}
              </Button>
            </div>
            {location && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Location detected: {location.latitude.toFixed(4)},{" "}
                  {location.longitude.toFixed(4)} ({location.region})
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Incident Type</Label>
            <Select
              value={reportForm.category}
              onValueChange={(value) =>
                setReportForm({ ...reportForm, category: value })
              }
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fire">Fire</SelectItem>
                <SelectItem value="Flood">Flood</SelectItem>
                <SelectItem value="Earthquake">Earthquake</SelectItem>
                <SelectItem value="Medical Emergency">
                  Medical Emergency
                </SelectItem>
                <SelectItem value="Accident">Accident</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select
              value={reportForm.severity}
              onValueChange={(value) =>
                setReportForm({ ...reportForm, severity: value as Severity })
              }
            >
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Severity.low}>Low</SelectItem>
                <SelectItem value={Severity.medium}>Medium</SelectItem>
                <SelectItem value={Severity.high}>High</SelectItem>
                <SelectItem value={Severity.critical}>Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the incident in detail..."
              value={reportForm.description}
              onChange={(e) =>
                setReportForm({ ...reportForm, description: e.target.value })
              }
              required
              rows={4}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-crisis-orange hover:bg-crisis-orange/90"
            disabled={reportIncident.isPending}
          >
            {reportIncident.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reporting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderIncidentsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-crisis-blue" />
          My Reported Incidents
        </CardTitle>
        <CardDescription>
          Track the status of your reported incidents
        </CardDescription>
      </CardHeader>
      <CardContent>
        {incidentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-crisis-blue" />
          </div>
        ) : myIncidents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No incidents reported yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myIncidents.map((incident) => (
              <Card
                key={incident.id.toString()}
                className="border-l-4"
                style={{
                  borderLeftColor: getSeverityColor(incident.severity).replace(
                    "bg-",
                    "#",
                  ),
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {incident.category}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(
                          Number(incident.timestamp) / 1000000,
                        ).toLocaleString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(incident.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{incident.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {incident.location.region} (
                    {incident.location.latitude.toFixed(4)},{" "}
                    {incident.location.longitude.toFixed(4)})
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {incident.severity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderContactsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-crisis-teal" />
          Emergency Contacts
        </CardTitle>
        <CardDescription>
          Important helplines and local authorities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {contactsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-crisis-teal" />
          </div>
        ) : emergencyContacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No emergency contacts available for your region</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <Card key={contact.name} className="border-crisis-teal/20">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{contact.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {contact.region}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-crisis-teal/10 text-crisis-teal"
                    >
                      {contact.contactInfo}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderNotificationsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-crisis-orange" />
          Notifications & Alerts
        </CardTitle>
        <CardDescription>
          Emergency alerts and system notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Alerts */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Regional Alerts</h4>
            {alertsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-crisis-orange" />
              </div>
            ) : alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active alerts in your region
              </p>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Alert
                    key={alert.id.toString()}
                    className="border-l-4"
                    style={{
                      borderLeftColor: getSeverityColor(alert.severity).replace(
                        "bg-",
                        "#",
                      ),
                    }}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {alert.category}
                          </p>
                          <p className="text-xs mt-1">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              Number(alert.timestamp) / 1000000,
                            ).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Notifications */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">System Notifications</h4>
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-crisis-blue" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notifications
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id.toString()}
                    className={notification.read ? "opacity-60" : ""}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              Number(notification.timestamp) / 1000000,
                            ).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsRead.isPending}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProfileSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-crisis-blue" />
          Profile Management
        </CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              value={profileForm.region}
              onChange={(e) =>
                setProfileForm({ ...profileForm, region: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Information</Label>
            <Input
              id="contact"
              value={profileForm.contactInfo}
              onChange={(e) =>
                setProfileForm({ ...profileForm, contactInfo: e.target.value })
              }
              placeholder="Phone number or email"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-crisis-blue hover:bg-crisis-blue/90"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <img
              src="/assets/WhatsApp Image 2025-12-26 at 11.57.47 PM.jpeg"
              alt="Smart Crisis Management Logo"
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-crisis-blue">
                Citizen Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome, {userProfile?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-crisis-blue/10 text-crisis-blue"
            >
              <User className="mr-1 h-3 w-3" />
              Citizen
            </Badge>
            <Badge
              variant="outline"
              className="bg-crisis-teal/10 text-crisis-teal"
            >
              <MapPin className="mr-1 h-3 w-3" />
              {userProfile?.location.region}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={activeSection === "report" ? "default" : "outline"}
          onClick={() => setActiveSection("report")}
          className={
            activeSection === "report"
              ? "bg-crisis-orange hover:bg-crisis-orange/90"
              : ""
          }
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
        <Button
          variant={activeSection === "incidents" ? "default" : "outline"}
          onClick={() => setActiveSection("incidents")}
          className={
            activeSection === "incidents"
              ? "bg-crisis-blue hover:bg-crisis-blue/90"
              : ""
          }
        >
          <FileText className="mr-2 h-4 w-4" />
          My Incidents
        </Button>
        <Button
          variant={activeSection === "contacts" ? "default" : "outline"}
          onClick={() => setActiveSection("contacts")}
          className={
            activeSection === "contacts"
              ? "bg-crisis-teal hover:bg-crisis-teal/90"
              : ""
          }
        >
          <Phone className="mr-2 h-4 w-4" />
          Emergency Contacts
        </Button>
        <Button
          variant={activeSection === "notifications" ? "default" : "outline"}
          onClick={() => setActiveSection("notifications")}
          className={
            activeSection === "notifications"
              ? "bg-crisis-orange hover:bg-crisis-orange/90"
              : ""
          }
        >
          <Bell className="mr-2 h-4 w-4" />
          Notifications
          {notifications.filter((n) => !n.read).length > 0 && (
            <Badge
              variant="destructive"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notifications.filter((n) => !n.read).length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeSection === "profile" ? "default" : "outline"}
          onClick={() => setActiveSection("profile")}
          className={
            activeSection === "profile"
              ? "bg-crisis-blue hover:bg-crisis-blue/90"
              : ""
          }
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-4xl">
        {activeSection === "report" && renderReportSection()}
        {activeSection === "incidents" && renderIncidentsSection()}
        {activeSection === "contacts" && renderContactsSection()}
        {activeSection === "notifications" && renderNotificationsSection()}
        {activeSection === "profile" && renderProfileSection()}
      </div>
    </div>
  );
}
