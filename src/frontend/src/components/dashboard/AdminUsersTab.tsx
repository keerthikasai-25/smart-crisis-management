import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, UserCog, Users } from "lucide-react";
import { useGetAllVolunteers } from "../../hooks/useQueries";

export default function AdminUsersTab() {
  const { data: volunteers = [] } = useGetAllVolunteers();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-crisis-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteers.length}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-crisis-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
            <UserCog className="h-4 w-4 text-crisis-teal" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {volunteers.filter((v) => v.approved).length}
            </div>
            <p className="text-xs text-muted-foreground">Active volunteers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-crisis-blue" />
            User Management
          </CardTitle>
          <CardDescription>
            View, activate/deactivate users, and assign roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-crisis-blue/10 p-4">
                <Users className="h-8 w-8 text-crisis-blue" />
              </div>
              <div>
                <p className="text-lg font-medium mb-2">
                  User Management System
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Comprehensive user management features including role
                  assignment, user activation/deactivation, and detailed user
                  profiles will be available in a future update.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3 w-full max-w-2xl mt-6">
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <Shield className="h-5 w-5 text-crisis-orange mb-2" />
                  <p className="text-sm font-medium">Role Assignment</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assign Admin, Volunteer, or Citizen roles
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <UserCog className="h-5 w-5 text-crisis-teal mb-2" />
                  <p className="text-sm font-medium">User Activation</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Activate or deactivate user accounts
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <Users className="h-5 w-5 text-crisis-blue mb-2" />
                  <p className="text-sm font-medium">User Profiles</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    View detailed user information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
