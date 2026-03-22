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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Building,
  Plus,
  TrendingUp,
  Users as UsersIcon,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../../backend";
import {
  useGetRegionRecoveryProgress,
  useIsCallerAdmin,
  useUpdateRecoveryProgress,
} from "../../hooks/useQueries";

interface RecoveryTabProps {
  userProfile: UserProfile | null;
}

export default function RecoveryTab({ userProfile }: RecoveryTabProps) {
  const [selectedRegion, setSelectedRegion] = useState(
    userProfile?.location.region || "",
  );
  const { data: recovery, isLoading } =
    useGetRegionRecoveryProgress(selectedRegion);
  const { data: isAdmin } = useIsCallerAdmin();
  const { mutate: updateProgress, isPending } = useUpdateRecoveryProgress();

  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState("");
  const [infrastructure, setInfrastructure] = useState("");
  const [services, setServices] = useState("");
  const [population, setPopulation] = useState("");
  const [overallPercentage, setOverallPercentage] = useState("");
  const [pendingNeeds, setPendingNeeds] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!region.trim()) {
      toast.error("Please enter a region name");
      return;
    }

    updateProgress(
      {
        region: region.trim(),
        infrastructure: BigInt(infrastructure || 0),
        services: BigInt(services || 0),
        population: BigInt(population || 0),
        overallPercentage: BigInt(overallPercentage || 0),
        pendingNeeds: pendingNeeds.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Recovery progress updated successfully");
          setOpen(false);
          setSelectedRegion(region.trim());
        },
        onError: (error) => {
          toast.error(`Failed to update progress: ${error.message}`);
        },
      },
    );
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600 dark:text-green-400";
    if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 25) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recovery Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Monitor post-disaster recovery progress
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Update Progress
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Recovery Progress</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Input
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Region name"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="infrastructure">Infrastructure (%)</Label>
                    <Input
                      id="infrastructure"
                      type="number"
                      value={infrastructure}
                      onChange={(e) => setInfrastructure(e.target.value)}
                      placeholder="0-100"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="services">Services (%)</Label>
                    <Input
                      id="services"
                      type="number"
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder="0-100"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="population">Population (%)</Label>
                    <Input
                      id="population"
                      type="number"
                      value={population}
                      onChange={(e) => setPopulation(e.target.value)}
                      placeholder="0-100"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overall">Overall Progress (%)</Label>
                    <Input
                      id="overall"
                      type="number"
                      value={overallPercentage}
                      onChange={(e) => setOverallPercentage(e.target.value)}
                      placeholder="0-100"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="needs">Pending Needs</Label>
                  <Textarea
                    id="needs"
                    value={pendingNeeds}
                    onChange={(e) => setPendingNeeds(e.target.value)}
                    placeholder="List pending needs and requirements..."
                    rows={3}
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
                    {isPending ? "Updating..." : "Update Progress"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Region Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Region</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              placeholder="Enter region name"
            />
            <Button
              onClick={() => setSelectedRegion(selectedRegion)}
              disabled={!selectedRegion.trim()}
            >
              View Progress
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedRegion &&
        (isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        ) : recovery ? (
          <>
            {/* Overall Progress */}
            <Card className="border-crisis-blue/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-crisis-blue" />
                  Overall Recovery Progress - {recovery.region}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Recovery Status
                    </span>
                    <span
                      className={`text-4xl font-bold ${getProgressColor(Number(recovery.overallPercentage))}`}
                    >
                      {Number(recovery.overallPercentage)}%
                    </span>
                  </div>
                  <Progress
                    value={Number(recovery.overallPercentage)}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detailed Metrics */}
            <div className="grid gap-6 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building className="h-5 w-5 text-crisis-teal" />
                    Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold">
                      {Number(recovery.infrastructure)}%
                    </div>
                    <Progress
                      value={Number(recovery.infrastructure)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Roads, buildings, utilities
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wrench className="h-5 w-5 text-crisis-orange" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold">
                      {Number(recovery.services)}%
                    </div>
                    <Progress
                      value={Number(recovery.services)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Healthcare, education, transport
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UsersIcon className="h-5 w-5 text-purple-500" />
                    Population
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold">
                      {Number(recovery.population)}%
                    </div>
                    <Progress
                      value={Number(recovery.population)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Displaced persons returned
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Needs */}
            {recovery.pendingNeeds && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Needs & Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">
                    {recovery.pendingNeeds}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No recovery data available for this region
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {isAdmin
                  ? 'Click "Update Progress" to add data'
                  : "Please check back later"}
              </p>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
