import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Clock, FileText, MapPin, Plus, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../../backend";
import { Severity, Variant_resolved_open_inProgress } from "../../backend";
import type { Location } from "../../backend";
import {
  useGetAllIncidentReports,
  useReportIncident,
} from "../../hooks/useQueries";

interface IncidentsTabProps {
  userProfile: UserProfile | null;
}

export default function IncidentsTab({ userProfile }: IncidentsTabProps) {
  const { data: incidents, isLoading } = useGetAllIncidentReports();
  const { mutate: reportIncident, isPending } = useReportIncident();

  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>(Severity.medium);
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState(userProfile?.location.region || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !category.trim() || !region.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const location: Location = {
      latitude: userProfile?.location.latitude || 0,
      longitude: userProfile?.location.longitude || 0,
      region: region.trim(),
    };

    reportIncident(
      {
        location,
        description: description.trim(),
        severity,
        category: category.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Incident reported successfully");
          setOpen(false);
          setDescription("");
          setCategory("");
        },
        onError: (error) => {
          toast.error(`Failed to report incident: ${error.message}`);
        },
      },
    );
  };

  const getSeverityColor = (sev: Severity) => {
    switch (sev) {
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
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
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
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Incident Reports</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage incident reports
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the incident in detail..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <Select
                    value={severity}
                    onValueChange={(v) => setSeverity(v as Severity)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Severity.low}>Low</SelectItem>
                      <SelectItem value={Severity.medium}>Medium</SelectItem>
                      <SelectItem value={Severity.high}>High</SelectItem>
                      <SelectItem value={Severity.critical}>
                        Critical
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medical Emergency">
                        Medical Emergency
                      </SelectItem>
                      <SelectItem value="Fire">Fire</SelectItem>
                      <SelectItem value="Structural Damage">
                        Structural Damage
                      </SelectItem>
                      <SelectItem value="Flooding">Flooding</SelectItem>
                      <SelectItem value="Power Outage">Power Outage</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Location/Region *</Label>
                <Input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Incident location"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Reporting..." : "Report Incident"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : incidents && incidents.length > 0 ? (
        <div className="grid gap-4">
          {incidents.map((incident) => (
            <Card key={Number(incident.id)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {getStatusLabel(incident.status)}
                      </Badge>
                      <Badge variant="outline">{incident.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">
                      Incident #{Number(incident.id)}
                    </CardTitle>
                  </div>
                  <FileText className="h-6 w-6 text-crisis-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">{incident.description}</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{incident.location.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(
                        Number(incident.timestamp) / 1000000,
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="truncate">
                      Reporter: {incident.reporterId.toString().slice(0, 20)}...
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No incident reports</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
