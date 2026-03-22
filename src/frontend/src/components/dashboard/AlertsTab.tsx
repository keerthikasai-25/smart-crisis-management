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
import { AlertTriangle, Clock, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../../backend";
import { Severity } from "../../backend";
import type { Location } from "../../backend";
import {
  useCreateAlert,
  useGetAllAlerts,
  useIsCallerAdmin,
} from "../../hooks/useQueries";

interface AlertsTabProps {
  userProfile: UserProfile | null;
}

export default function AlertsTab({ userProfile }: AlertsTabProps) {
  const { data: alerts, isLoading } = useGetAllAlerts();
  const { data: isAdmin } = useIsCallerAdmin();
  const { mutate: createAlert, isPending } = useCreateAlert();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<Severity>(Severity.medium);
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [affectedAreas, setAffectedAreas] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !category.trim() || !region.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const location: Location = {
      latitude: userProfile?.location.latitude || 0,
      longitude: userProfile?.location.longitude || 0,
      region: region.trim(),
    };

    const areas = affectedAreas
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a);

    createAlert(
      {
        location,
        message: message.trim(),
        severity,
        category: category.trim(),
        affectedAreas: areas,
      },
      {
        onSuccess: () => {
          toast.success("Alert created successfully");
          setOpen(false);
          setMessage("");
          setCategory("");
          setRegion("");
          setAffectedAreas("");
        },
        onError: (error) => {
          toast.error(`Failed to create alert: ${error.message}`);
        },
      },
    );
  };

  const getSeverityColor = (sev: Severity) => {
    switch (sev) {
      case Severity.low:
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case Severity.medium:
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case Severity.high:
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case Severity.critical:
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Management</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and manage crisis alerts
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Alert Message *</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the alert situation..."
                    rows={3}
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
                        <SelectItem value="Weather">Weather</SelectItem>
                        <SelectItem value="Earthquake">Earthquake</SelectItem>
                        <SelectItem value="Fire">Fire</SelectItem>
                        <SelectItem value="Flood">Flood</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Input
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Primary affected region"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areas">
                    Affected Areas (comma-separated)
                  </Label>
                  <Input
                    id="areas"
                    value={affectedAreas}
                    onChange={(e) => setAffectedAreas(e.target.value)}
                    placeholder="Area1, Area2, Area3"
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
                    {isPending ? "Creating..." : "Create Alert"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card
              key={Number(alert.id)}
              className={`border-2 ${getSeverityColor(alert.severity)}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline">{alert.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{alert.message}</CardTitle>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-crisis-orange" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{alert.location.region}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(
                        Number(alert.timestamp) / 1000000,
                      ).toLocaleString()}
                    </span>
                  </div>
                  {alert.affectedAreas.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs font-medium">
                        Affected Areas:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {alert.affectedAreas.map((area) => (
                          <Badge
                            key={area}
                            variant="secondary"
                            className="text-xs"
                          >
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No alerts at this time</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
