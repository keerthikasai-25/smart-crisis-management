import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Location {
    region: string;
    latitude: number;
    longitude: number;
}
export interface VolunteerMessage {
    message: string;
    recipientId: UserId;
}
export type IncidentId = bigint;
export type AlertId = bigint;
export interface EmergencyContact {
    region: string;
    contactInfo: string;
    name: string;
}
export interface IncidentReport {
    id: IncidentId;
    status: Variant_resolved_open_inProgress;
    description: string;
    reporterId: UserId;
    timestamp: bigint;
    category: string;
    severity: Severity;
    photo?: ExternalBlob;
    location: Location;
}
export type UserId = Principal;
export interface TaskAssignment {
    id: TaskId;
    status: Variant_pending_completed_inProgress;
    incidentId: IncidentId;
    assignedTo: UserId;
    resourcesAllocated: string;
    timestamp: bigint;
}
export type TaskId = bigint;
export interface Notification {
    id: bigint;
    userId: UserId;
    read: boolean;
    message: string;
    timestamp: bigint;
}
export interface ResourceInventory {
    vehicles: bigint;
    food: bigint;
    medicine: bigint;
    personnel: bigint;
    water: bigint;
}
export interface RecoveryProgress {
    region: string;
    pendingNeeds: string;
    overallPercentage: bigint;
    infrastructure: bigint;
    services: bigint;
    population: bigint;
}
export interface Volunteer {
    code: string;
    name: string;
    email: string;
    approved: boolean;
    phone: string;
}
export interface Alert {
    id: AlertId;
    affectedAreas: Array<string>;
    message: string;
    timestamp: bigint;
    category: string;
    severity: Severity;
    location: Location;
}
export interface UserProfile {
    id: UserId;
    contactInfo: string;
    name: string;
    role: UserRole;
    location: Location;
}
export enum Severity {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    citizen = "citizen",
    volunteer = "volunteer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_completed_inProgress {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum Variant_resolved_open_inProgress {
    resolved = "resolved",
    open = "open",
    inProgress = "inProgress"
}
export interface backendInterface {
    addEmergencyContact(name: string, region: string, contactInfo: string): Promise<void>;
    addNotification(userId: UserId, message: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignTask(incidentId: IncidentId, assignedTo: UserId, resourcesAllocated: string): Promise<TaskId>;
    clearVolunteerMessage(recipientId: UserId): Promise<void>;
    createAlert(location: Location, message: string, severity: Severity, category: string, affectedAreas: Array<string>): Promise<AlertId>;
    fetchVolunteerMessage(): Promise<VolunteerMessage | null>;
    getActiveTasks(): Promise<Array<TaskAssignment>>;
    getAlertsByRegion(region: string): Promise<Array<Alert>>;
    getAllAlerts(): Promise<Array<Alert>>;
    getAllIncidentReports(): Promise<Array<IncidentReport>>;
    getAllRecoveryProgress(): Promise<Array<[string, RecoveryProgress]>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getAllVolunteers(): Promise<Array<Volunteer>>;
    getCallerAssignedTasks(): Promise<Array<TaskAssignment>>;
    getCallerIncidentReports(): Promise<Array<IncidentReport>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getEmergencyContactsByRegion(region: string): Promise<Array<EmergencyContact>>;
    getIncidentReport(incidentId: IncidentId): Promise<IncidentReport>;
    getNotificationsForUser(): Promise<Array<Notification>>;
    getPersistentICRole(): Promise<UserRole>;
    getRegionRecoveryProgress(region: string): Promise<RecoveryProgress>;
    getResourceInventory(): Promise<ResourceInventory>;
    getUserProfile(user: UserId): Promise<UserProfile | null>;
    getVolunteer(email: string): Promise<Volunteer | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationAsRead(notificationId: bigint): Promise<void>;
    registerCitizen(name: string, email: string, password: string, region: string, location: Location, contactInfo: string): Promise<void>;
    registerVolunteer(name: string, email: string, phone: string): Promise<string>;
    registerWithRole(role: UserRole): Promise<void>;
    reportIncident(location: Location, description: string, severity: Severity, category: string, photo: ExternalBlob | null): Promise<IncidentId>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendVolunteerMessage(recipientId: UserId, message: string): Promise<void>;
    updateIncidentStatus(incidentId: IncidentId, newStatus: Variant_resolved_open_inProgress): Promise<void>;
    updateRecoveryProgress(region: string, infrastructure: bigint, services: bigint, population: bigint, overallPercentage: bigint, pendingNeeds: string): Promise<void>;
    updateResourceInventory(food: bigint, water: bigint, medicine: bigint, vehicles: bigint, personnel: bigint): Promise<void>;
    updateTaskStatus(taskId: TaskId, newStatus: Variant_pending_completed_inProgress): Promise<void>;
    updateVolunteerApproval(email: string, approved: boolean): Promise<void>;
    validateCitizenLogin(email: string, password: string): Promise<boolean>;
    validateVolunteerLogin(email: string, code: string): Promise<boolean>;
}
