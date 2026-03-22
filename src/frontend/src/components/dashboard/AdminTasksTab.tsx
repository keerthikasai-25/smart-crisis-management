import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, ClipboardList, Clock } from "lucide-react";
import { useState } from "react";
import type { TaskAssignment } from "../../backend";
import { useGetActiveTasks } from "../../hooks/useQueries";

export default function AdminTasksTab() {
  const { data: tasks = [], isLoading } = useGetActiveTasks();

  const getStatusBadge = (status: TaskAssignment["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-500"
          >
            Pending
          </Badge>
        );
      case "inProgress":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: TaskAssignment["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "inProgress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading tasks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-crisis-teal" />
            Task Management
          </CardTitle>
          <CardDescription>
            Monitor and manage all active tasks across the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium">No active tasks</p>
              <p className="text-sm text-muted-foreground">
                Tasks will appear here when assigned
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id.toString()}
                  className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(task.status)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            Task #{task.id.toString()}
                          </h3>
                          {getStatusBadge(task.status)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium">Incident ID:</span>{" "}
                            {task.incidentId.toString()}
                          </p>
                          <p>
                            <span className="font-medium">Assigned To:</span>{" "}
                            {task.assignedTo.toString().slice(0, 20)}...
                          </p>
                          <p>
                            <span className="font-medium">Resources:</span>{" "}
                            {task.resourcesAllocated}
                          </p>
                          <p>
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(
                              Number(task.timestamp) / 1000000,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Statistics</CardTitle>
          <CardDescription>
            Overview of task distribution and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold">
                {tasks.filter((t) => t.status === "pending").length}
              </p>
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <p className="text-2xl font-bold">
                {tasks.filter((t) => t.status === "inProgress").length}
              </p>
            </div>
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <p className="text-2xl font-bold">
                {tasks.filter((t) => t.status === "completed").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
