import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Alert,
  EmergencyContact,
  IncidentId,
  IncidentReport,
  Location,
  Notification,
  RecoveryProgress,
  ResourceInventory,
  Severity,
  TaskAssignment,
  TaskId,
  UserId,
  UserProfile,
  UserRole,
  UserRole__1,
  Variant_pending_completed_inProgress,
  Variant_resolved_open_inProgress,
  Volunteer,
} from "../backend";
import { useActor } from "./useActor";

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole__1>({
    queryKey: ["currentUserRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPersistentICRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ["persistentICRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPersistentICRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterWithRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: UserRole) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerWithRole(role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["persistentICRole"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserRole"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Citizen Authentication
export function useRegisterCitizen() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
      region,
      contactInfo,
    }: {
      name: string;
      email: string;
      password: string;
      region: string;
      contactInfo: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const location: Location = {
        latitude: 0,
        longitude: 0,
        region: region || "Unknown",
      };
      return actor.registerCitizen(
        name,
        email,
        password,
        region || "Unknown",
        location,
        contactInfo,
      );
    },
  });
}

export function useValidateCitizenLogin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: { email: string; password: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.validateCitizenLogin(email, password);
    },
  });
}

// Volunteer Registration & Authentication
export function useRegisterVolunteer() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      name,
      email,
      phone,
    }: { name: string; email: string; phone: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerVolunteer(name, email, phone);
    },
  });
}

export function useValidateVolunteerLogin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.validateVolunteerLogin(email, code);
    },
  });
}

export function useGetVolunteer(email: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Volunteer | null>({
    queryKey: ["volunteer", email],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getVolunteer(email);
    },
    enabled: !!actor && !isFetching && !!email,
  });
}

export function useGetAllVolunteers() {
  const { actor, isFetching } = useActor();

  return useQuery<Volunteer[]>({
    queryKey: ["volunteers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVolunteers();
    },
    enabled: !!actor && !isFetching,
  });
}

// Incident Report Queries
export function useGetAllIncidentReports() {
  const { actor, isFetching } = useActor();

  return useQuery<IncidentReport[]>({
    queryKey: ["incidentReports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllIncidentReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerIncidentReports() {
  const { actor, isFetching } = useActor();

  return useQuery<IncidentReport[]>({
    queryKey: ["callerIncidentReports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerIncidentReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReportIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      location,
      description,
      severity,
      category,
    }: {
      location: Location;
      description: string;
      severity: Severity;
      category: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.reportIncident(
        location,
        description,
        severity,
        category,
        null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidentReports"] });
      queryClient.invalidateQueries({ queryKey: ["callerIncidentReports"] });
    },
  });
}

export function useUpdateIncidentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      newStatus,
    }: {
      incidentId: IncidentId;
      newStatus: Variant_resolved_open_inProgress;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateIncidentStatus(incidentId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidentReports"] });
      queryClient.invalidateQueries({ queryKey: ["callerIncidentReports"] });
    },
  });
}

// Alert Queries
export function useGetAllAlerts() {
  const { actor, isFetching } = useActor();

  return useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAlerts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAlertsByRegion(region: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Alert[]>({
    queryKey: ["alerts", region],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlertsByRegion(region);
    },
    enabled: !!actor && !isFetching && !!region,
  });
}

export function useCreateAlert() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      location,
      message,
      severity,
      category,
      affectedAreas,
    }: {
      location: Location;
      message: string;
      severity: Severity;
      category: string;
      affectedAreas: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createAlert(
        location,
        message,
        severity,
        category,
        affectedAreas,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

// Task Assignment Queries
export function useGetActiveTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<TaskAssignment[]>({
    queryKey: ["activeTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerAssignedTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<TaskAssignment[]>({
    queryKey: ["callerAssignedTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerAssignedTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      incidentId,
      assignedTo,
      resourcesAllocated,
    }: {
      incidentId: IncidentId;
      assignedTo: UserId;
      resourcesAllocated: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.assignTask(incidentId, assignedTo, resourcesAllocated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeTasks"] });
      queryClient.invalidateQueries({ queryKey: ["callerAssignedTasks"] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      newStatus,
    }: {
      taskId: TaskId;
      newStatus: Variant_pending_completed_inProgress;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTaskStatus(taskId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeTasks"] });
      queryClient.invalidateQueries({ queryKey: ["callerAssignedTasks"] });
    },
  });
}

// Resource Inventory Queries
export function useGetResourceInventory() {
  const { actor, isFetching } = useActor();

  return useQuery<ResourceInventory>({
    queryKey: ["resourceInventory"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getResourceInventory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateResourceInventory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inventory: ResourceInventory) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateResourceInventory(
        inventory.food,
        inventory.water,
        inventory.medicine,
        inventory.vehicles,
        inventory.personnel,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resourceInventory"] });
    },
  });
}

// Recovery Progress Queries
export function useGetRegionRecoveryProgress(region: string) {
  const { actor, isFetching } = useActor();

  return useQuery<RecoveryProgress>({
    queryKey: ["recoveryProgress", region],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getRegionRecoveryProgress(region);
    },
    enabled: !!actor && !isFetching && !!region,
  });
}

export function useUpdateRecoveryProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      region,
      infrastructure,
      services,
      population,
      overallPercentage,
      pendingNeeds,
    }: {
      region: string;
      infrastructure: bigint;
      services: bigint;
      population: bigint;
      overallPercentage: bigint;
      pendingNeeds: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateRecoveryProgress(
        region,
        infrastructure,
        services,
        population,
        overallPercentage,
        pendingNeeds,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["recoveryProgress", variables.region],
      });
    },
  });
}

// Emergency Contacts Queries
export function useGetEmergencyContactsByRegion(region: string) {
  const { actor, isFetching } = useActor();

  return useQuery<EmergencyContact[]>({
    queryKey: ["emergencyContacts", region],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmergencyContactsByRegion(region);
    },
    enabled: !!actor && !isFetching && !!region,
  });
}

// Notifications Queries
export function useGetNotificationsForUser() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotificationsForUser();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId }: { notificationId: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
