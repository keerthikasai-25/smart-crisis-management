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
import { Droplet, Edit, Package, Pill, Truck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../../backend";
import {
  useGetResourceInventory,
  useIsCallerAdmin,
  useUpdateResourceInventory,
} from "../../hooks/useQueries";

interface ResourcesTabProps {
  userProfile: UserProfile | null;
}

export default function ResourcesTab({
  userProfile: _userProfile,
}: ResourcesTabProps) {
  const { data: resources, isLoading } = useGetResourceInventory();
  const { data: isAdmin } = useIsCallerAdmin();
  const { mutate: updateInventory, isPending } = useUpdateResourceInventory();

  const [open, setOpen] = useState(false);
  const [food, setFood] = useState("");
  const [water, setWater] = useState("");
  const [medicine, setMedicine] = useState("");
  const [vehicles, setVehicles] = useState("");
  const [personnel, setPersonnel] = useState("");

  const handleEdit = () => {
    if (resources) {
      setFood(resources.food.toString());
      setWater(resources.water.toString());
      setMedicine(resources.medicine.toString());
      setVehicles(resources.vehicles.toString());
      setPersonnel(resources.personnel.toString());
      setOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateInventory(
      {
        food: BigInt(food || 0),
        water: BigInt(water || 0),
        medicine: BigInt(medicine || 0),
        vehicles: BigInt(vehicles || 0),
        personnel: BigInt(personnel || 0),
      },
      {
        onSuccess: () => {
          toast.success("Resource inventory updated successfully");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(`Failed to update inventory: ${error.message}`);
        },
      },
    );
  };

  const getResourcePercentage = (current: number, max = 5000) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resource Management</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and allocate emergency supplies
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
                Update Inventory
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Resource Inventory</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="food">Food (units)</Label>
                  <Input
                    id="food"
                    type="number"
                    value={food}
                    onChange={(e) => setFood(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="water">Water (units)</Label>
                  <Input
                    id="water"
                    type="number"
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicine">Medicine (units)</Label>
                  <Input
                    id="medicine"
                    type="number"
                    value={medicine}
                    onChange={(e) => setMedicine(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicles">Vehicles</Label>
                  <Input
                    id="vehicles"
                    type="number"
                    value={vehicles}
                    onChange={(e) => setVehicles(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personnel">Personnel</Label>
                  <Input
                    id="personnel"
                    type="number"
                    value={personnel}
                    onChange={(e) => setPersonnel(e.target.value)}
                    placeholder="0"
                    min="0"
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
                    {isPending ? "Updating..." : "Update Inventory"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Hero Image */}
      <div className="relative overflow-hidden rounded-xl border border-border">
        <img
          src="/assets/generated/supply-warehouse.dim_800x600.png"
          alt="Supply Warehouse"
          className="h-48 w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-bold">Emergency Supply Warehouse</h3>
          <p className="text-sm text-muted-foreground">
            Real-time inventory tracking
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : resources ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-crisis-orange/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-crisis-orange" />
                Food Supplies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold">
                  {Number(resources.food).toLocaleString()}
                </div>
                <Progress
                  value={getResourcePercentage(Number(resources.food), 2000)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">units available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-crisis-teal/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Droplet className="h-5 w-5 text-crisis-teal" />
                Water Supplies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold">
                  {Number(resources.water).toLocaleString()}
                </div>
                <Progress
                  value={getResourcePercentage(Number(resources.water), 3000)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">units available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="h-5 w-5 text-red-500" />
                Medical Supplies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold">
                  {Number(resources.medicine).toLocaleString()}
                </div>
                <Progress
                  value={getResourcePercentage(
                    Number(resources.medicine),
                    1000,
                  )}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">units available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-crisis-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-5 w-5 text-crisis-blue" />
                Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold">
                  {Number(resources.vehicles)}
                </div>
                <Progress
                  value={getResourcePercentage(Number(resources.vehicles), 100)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">vehicles ready</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-purple-500" />
                Personnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold">
                  {Number(resources.personnel)}
                </div>
                <Progress
                  value={getResourcePercentage(
                    Number(resources.personnel),
                    500,
                  )}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  active responders
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Total Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Units:</span>
                  <span className="font-medium">
                    {(
                      Number(resources.food) +
                      Number(resources.water) +
                      Number(resources.medicine)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assets:</span>
                  <span className="font-medium">
                    {Number(resources.vehicles) + Number(resources.personnel)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Coordination Image */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Coordination</CardTitle>
        </CardHeader>
        <CardContent>
          <img
            src="/assets/generated/rescue-team-coordination.dim_800x600.png"
            alt="Rescue Team Coordination"
            className="w-full rounded-lg"
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Emergency response teams coordinate resource allocation based on
            real-time needs and crisis severity levels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
