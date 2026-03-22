import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";


// Migration with-clause

actor {
  // --------------------------
  // Type Definitions & Compare Modules
  // --------------------------

  type UserId = Principal;
  type IncidentId = Nat;
  type AlertId = Nat;
  type TaskId = Nat;

  public type Severity = { #low; #medium; #high; #critical };

  public type UserRole = {
    #admin;
    #volunteer;
    #citizen;
  };

  public type Location = {
    latitude : Float;
    longitude : Float;
    region : Text;
  };

  public type UserProfile = {
    id : UserId;
    name : Text;
    role : UserRole;
    location : Location;
    contactInfo : Text;
  };

  // --- Citizen Auth Specific Types ---
  public type CitizenCredentials = {
    email : Text;
    password : Text;
    region : Text;
    contactInfo : Text;
  };

  public type CitizenRole = { #citizen };
  // --- End Citizen Auth Specific Types ---

  public type IncidentReport = {
    id : IncidentId;
    reporterId : UserId;
    location : Location;
    description : Text;
    severity : Severity;
    category : Text;
    timestamp : Int;
    status : { #open; #inProgress; #resolved };
    photo : ?Storage.ExternalBlob;
  };

  module IncidentReport {
    public func compare(a : IncidentReport, b : IncidentReport) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Alert = {
    id : AlertId;
    location : Location;
    message : Text;
    severity : Severity;
    category : Text;
    timestamp : Int;
    affectedAreas : [Text];
  };

  module Alert {
    public func compare(a : Alert, b : Alert) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type TaskAssignment = {
    id : TaskId;
    incidentId : IncidentId;
    assignedTo : UserId;
    status : { #pending; #inProgress; #completed };
    resourcesAllocated : Text;
    timestamp : Int;
  };

  module TaskAssignment {
    public func compare(a : TaskAssignment, b : TaskAssignment) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type ResourceInventory = {
    food : Nat;
    water : Nat;
    medicine : Nat;
    vehicles : Nat;
    personnel : Nat;
  };

  public type RecoveryProgress = {
    region : Text;
    infrastructure : Nat;
    services : Nat;
    population : Nat;
    overallPercentage : Nat;
    pendingNeeds : Text;
  };

  // Volunteer-specific types
  public type Volunteer = {
    name : Text;
    email : Text;
    phone : Text;
    code : Text;
    approved : Bool;
  };

  public type VolunteerMessage = {
    recipientId : UserId;
    message : Text;
  };

  // Emergency Contact type
  public type EmergencyContact = {
    name : Text;
    region : Text;
    contactInfo : Text;
  };

  // Notification type
  public type Notification = {
    id : Nat;
    userId : UserId;
    message : Text;
    timestamp : Int;
    read : Bool;
  };

  // --------------------------
  // Persistent Storage
  // --------------------------

  var nextIncidentId : IncidentId = 1;
  var nextAlertId : AlertId = 1;
  var nextTaskId : TaskId = 1;
  var nextNotificationId : Nat = 1;

  let userProfiles = Map.empty<UserId, UserProfile>();
  let incidentReports = Map.empty<IncidentId, IncidentReport>();
  let alerts = Map.empty<AlertId, Alert>();
  let taskAssignments = Map.empty<TaskId, TaskAssignment>();
  let activeRescueTeams = Set.empty<UserId>();
  let emergencyContacts = Map.empty<Text, EmergencyContact>();
  let notifications = Map.empty<Nat, Notification>();

  var resourceInventory : ResourceInventory = {
    food = 1000;
    water = 2000;
    medicine = 500;
    vehicles = 50;
    personnel = 200;
  };

  let recoveryProgress = Map.empty<Text, RecoveryProgress>();

  // Volunteer-specific storage
  let volunteers = Map.empty<Text, Volunteer>();
  var volunteerCount : Nat = 0;

  // Volunteer messages storage
  let volunteerMessages = Map.empty<UserId, VolunteerMessage>();

  // Citizen authentication storage
  let citizenAuth = Map.empty<UserId, CitizenCredentials>();

  // --------------------------
  // Access Control Integration
  // --------------------------

  let accessControlState = AccessControl.initState();

  // Map application roles to AccessControl roles
  let applicationRoles = Map.empty<UserId, UserRole>();

  // Initialize access control (first caller becomes admin)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
    // First caller is admin in both systems
    applicationRoles.add(caller, #admin);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside AccessControl.assignRole
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // --------------------------
  // Application Role Management
  // --------------------------

  // Helper function to validate role selection
  func validateRoleSelection(role : UserRole) {
    if (role != #admin and role != #volunteer and role != #citizen) {
      Runtime.trap("Invalid role selection");
    };
  };

  // Register with role - maps to AccessControl roles
  public shared ({ caller }) func registerWithRole(role : UserRole) : async () {
    validateRoleSelection(role);

    let accessControlRole : AccessControl.UserRole = switch (role) {
      case (#admin) { #admin };
      case (#volunteer) { #user };
      case (#citizen) { #user };
    };

    if (role == #admin) {
      if (not AccessControl.isAdmin(accessControlState, caller)) {
        Runtime.trap("Unauthorized: Only existing admins can register as admin");
      };
    };

    applicationRoles.add(caller, role);
  };

  // Get caller's application role
  public query ({ caller }) func getPersistentICRole() : async UserRole {
    switch (applicationRoles.get(caller)) {
      case (?role) { role };
      case (null) {
        // Default to citizen for authenticated users, guest otherwise
        if (AccessControl.hasPermission(accessControlState, caller, #user)) {
          #citizen;
        } else {
          Runtime.trap("User role not found");
        };
      };
    };
  };

  // Helper to get application role
  func getApplicationRole(user : UserId) : UserRole {
    switch (applicationRoles.get(user)) {
      case (?role) { role };
      case (null) { #citizen }; // Default
    };
  };

  // Helper to check if caller is citizen
  func isCallerCitizen(caller : UserId) : Bool {
    let appRole = getApplicationRole(caller);
    switch (appRole) {
      case (#citizen) { true };
      case (_) { false };
    };
  };

  // --------------------------
  // Citizen Authentication Flow
  // --------------------------

  func validateCitizenFlowInputs(name : Text, email : Text, password : Text, region : Text) {
    if (name == "" or email == "" or password == "" or region == "") {
      Runtime.trap("Name, email, password, and region must not be empty");
    };

    if (not email.contains(#char '@')) {
      Runtime.trap("Invalid email address: no @ character");
    };

    if (password.size() < 6) {
      Runtime.trap("Password must be at least 6 characters");
    };

    if (email == "admin@example.com" or email == "rescue@example.com") {
      Runtime.trap("Access denied: cannot use this email");
    };
  };

  func validateCitizenLoginInputs(email : Text, password : Text) {
    if (email == "" or password == "") {
      Runtime.trap("Email and password must not be empty");
    };

    if (not email.contains(#char '@')) {
      Runtime.trap("Invalid email address (no @ character)");
    };

    if (password.size() < 6) {
      Runtime.trap("Password must be at least 6 characters");
    };

    if (email == "admin@example.com" or email == "rescue@example.com") {
      Runtime.trap("Access denied: cannot use this email");
    };
  };

  public shared ({ caller }) func registerCitizen(name : Text, email : Text, password : Text, region : Text, location : Location, contactInfo : Text) : async () {
    validateCitizenFlowInputs(name, email, password, region);

    // Add citizen credentials
    let credentials : CitizenCredentials = {
      email;
      password;
      region;
      contactInfo;
    };

    citizenAuth.add(caller, credentials);

    // Add user profile for citizens
    let profile : UserProfile = {
      id = caller;
      name;
      role = #citizen : UserRole;
      location;
      contactInfo = contactInfo;
    };

    userProfiles.add(caller, { profile with role = #citizen });

    // Add citizen role
    applicationRoles.add(caller, #citizen);
  };

  public query ({ caller }) func validateCitizenLogin(email : Text, password : Text) : async Bool {
    validateCitizenLoginInputs(email, password);

    let storedCredentials = citizenAuth.toArray().filter(
      func((_, creds)) { Text.equal(creds.email, email) }
    );

    if (storedCredentials.size() == 0) {
      false;
    } else {
      let (_, creds) = storedCredentials[0];
      creds.password == password;
    };
  };

  // --------------------------
  // User Profile Management
  // --------------------------

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let appRole = getApplicationRole(caller);
    userProfiles.add(caller, { profile with role = appRole; id = caller });
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : UserId) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // --------------------------
  // Volunteer Registration & Authentication
  // --------------------------

  public shared ({ caller }) func registerVolunteer(name : Text, email : Text, phone : Text) : async Text {
    // No authorization check - anyone (including guests) can register as a volunteer

    // Ensure email is not already used
    switch (volunteers.get(email)) {
      case (?_) { Runtime.trap("Email already registered") };
      case (null) {
        // Generate unique code (VOL + 4-digit number)
        let randomPart = (volunteerCount + Int.abs(Time.now())) % 10000;
        let code = "VOL-" # randomPart.toText();

        let volunteer : Volunteer = {
          name;
          email;
          phone;
          code;
          approved = true;
        };

        volunteers.add(email, volunteer);
        volunteerCount += 1;

        // "Simulate" sending code via email/SMS (just return the code)
        code;
      };
    };
  };

  public query ({ caller }) func validateVolunteerLogin(email : Text, code : Text) : async Bool {
    switch (volunteers.get(email)) {
      case (null) { false };
      case (?volunteer) {
        volunteer.code == code and volunteer.approved;
      };
    };
  };

  public query ({ caller }) func getVolunteer(email : Text) : async ?Volunteer {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view volunteer information");
    };

    switch (volunteers.get(email)) {
      case (null) { Runtime.trap("Volunteer does not exist!") };
      case (?volunteer) { ?volunteer };
    };
  };

  public query ({ caller }) func getAllVolunteers() : async [Volunteer] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all volunteers");
    };
    volunteers.values().toArray();
  };

  public shared ({ caller }) func updateVolunteerApproval(email : Text, approved : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can approve volunteers");
    };

    switch (volunteers.get(email)) {
      case (null) { Runtime.trap("Volunteer does not exist!") };
      case (?volunteer) {
        let updatedVolunteer = {
          volunteer with approved
        };
        volunteers.add(email, updatedVolunteer);
      };
    };
  };

  public shared ({ caller }) func sendVolunteerMessage(recipientId : UserId, message : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can send messages to volunteers");
    };

    let volunteerMessage : VolunteerMessage = {
      recipientId;
      message;
    };

    volunteerMessages.add(recipientId, volunteerMessage);
  };

  public query ({ caller }) func fetchVolunteerMessage() : async ?VolunteerMessage {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch messages");
    };

    switch (volunteerMessages.get(caller)) {
      case (null) { null };
      case (?message) { ?message };
    };
  };

  public shared ({ caller }) func clearVolunteerMessage(recipientId : UserId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can clear messages");
    };

    switch (volunteerMessages.get(recipientId)) {
      case (null) { Runtime.trap("The user has no messages!") };
      case (?_) {
        volunteerMessages.remove(recipientId);
      };
    };
  };

  // --------------------------
  // Incident Reporting
  // --------------------------

  public shared ({ caller }) func reportIncident(location : Location, description : Text, severity : Severity, category : Text, photo : ?Storage.ExternalBlob) : async IncidentId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can report incidents");
    };

    let incidentId = nextIncidentId;
    let report : IncidentReport = {
      id = incidentId;
      reporterId = caller;
      location;
      description;
      severity;
      category;
      timestamp = Time.now();
      status = #open;
      photo;
    };

    incidentReports.add(incidentId, report);
    nextIncidentId += 1;
    incidentId;
  };

  public query ({ caller }) func getAllIncidentReports() : async [IncidentReport] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view incidents");
    };

    // Citizens can only view their own incidents via getCallerIncidentReports
    if (isCallerCitizen(caller)) {
      Runtime.trap("Unauthorized: Citizens can only view their own incidents");
    };

    incidentReports.values().toArray().sort();
  };

  public query ({ caller }) func getIncidentReport(incidentId : IncidentId) : async IncidentReport {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view incidents");
    };

    switch (incidentReports.get(incidentId)) {
      case (null) { Runtime.trap("Incident report does not exist!") };
      case (?report) {
        // Citizens can only view their own incidents
        if (isCallerCitizen(caller) and report.reporterId != caller) {
          Runtime.trap("Unauthorized: Citizens can only view their own incidents");
        };
        report;
      };
    };
  };

  public query ({ caller }) func getCallerIncidentReports() : async [IncidentReport] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view their incidents");
    };
    incidentReports.values().toArray().filter(
      func(report) { report.reporterId == caller }
    ).sort();
  };

  public shared ({ caller }) func updateIncidentStatus(incidentId : IncidentId, newStatus : { #open; #inProgress; #resolved }) : async () {
    switch (incidentReports.get(incidentId)) {
      case (null) { Runtime.trap("Incident report does not exist!") };
      case (?report) {
        if (not AccessControl.isAdmin(accessControlState, caller) and caller != report.reporterId) {
          Runtime.trap("Unauthorized: Only admins or the incident reporter can update status");
        };

        let updatedReport = {
          report with status = newStatus
        };
        incidentReports.add(incidentId, updatedReport);
      };
    };
  };

  // --------------------------
  // Alert Management
  // --------------------------

  public shared ({ caller }) func createAlert(location : Location, message : Text, severity : Severity, category : Text, affectedAreas : [Text]) : async AlertId {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create alerts");
    };

    let alertId = nextAlertId;
    let alert : Alert = {
      id = alertId;
      location;
      message;
      severity;
      category;
      timestamp = Time.now();
      affectedAreas;
    };

    alerts.add(alertId, alert);
    nextAlertId += 1;
    alertId;
  };

  public query ({ caller }) func getAllAlerts() : async [Alert] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view alerts");
    };
    alerts.values().toArray().sort();
  };

  public query ({ caller }) func getAlertsByRegion(region : Text) : async [Alert] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view alerts");
    };
    alerts.values().toArray().filter(
      func(alert) {
        switch (alert.affectedAreas.find(func(area) { Text.equal(area, region) })) {
          case (?_) { true };
          case (null) { false };
        };
      }
    );
  };

  // --------------------------
  // Task Assignment
  // --------------------------

  public shared ({ caller }) func assignTask(incidentId : IncidentId, assignedTo : UserId, resourcesAllocated : Text) : async TaskId {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can assign tasks");
    };

    let taskId = nextTaskId;
    let task : TaskAssignment = {
      id = taskId;
      incidentId;
      assignedTo;
      status = #pending;
      resourcesAllocated;
      timestamp = Time.now();
    };

    taskAssignments.add(taskId, task);
    nextTaskId += 1;
    taskId;
  };

  public query ({ caller }) func getActiveTasks() : async [TaskAssignment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view tasks");
    };

    // Citizens cannot access task management
    if (isCallerCitizen(caller)) {
      Runtime.trap("Unauthorized: Citizens cannot access task management");
    };

    taskAssignments.values().toArray().filter(
      func(task) {
        switch (task.status) {
          case (#pending) { true };
          case (#inProgress) { true };
          case (#completed) { false };
        };
      }
    ).sort();
  };

  public query ({ caller }) func getCallerAssignedTasks() : async [TaskAssignment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view their tasks");
    };

    // Citizens cannot access task management
    if (isCallerCitizen(caller)) {
      Runtime.trap("Unauthorized: Citizens cannot access task management");
    };

    taskAssignments.values().toArray().filter(
      func(task) { task.assignedTo == caller }
    ).sort();
  };

  public shared ({ caller }) func updateTaskStatus(taskId : TaskId, newStatus : { #pending; #inProgress; #completed }) : async () {
    switch (taskAssignments.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist!") };
      case (?task) {
        if (not AccessControl.isAdmin(accessControlState, caller) and caller != task.assignedTo) {
          Runtime.trap("Unauthorized: Only admins or the assigned user can update task status");
        };

        // Citizens cannot update tasks
        if (isCallerCitizen(caller)) {
          Runtime.trap("Unauthorized: Citizens cannot update task status");
        };

        let updatedTask = {
          task with status = newStatus
        };
        taskAssignments.add(taskId, updatedTask);
      };
    };
  };

  // --------------------------
  // Resource Inventory Management
  // --------------------------

  public shared ({ caller }) func updateResourceInventory(food : Nat, water : Nat, medicine : Nat, vehicles : Nat, personnel : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update inventory");
    };

    resourceInventory := {
      food;
      water;
      medicine;
      vehicles;
      personnel;
    };
  };

  public query ({ caller }) func getResourceInventory() : async ResourceInventory {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view inventory");
    };
    resourceInventory;
  };

  // --------------------------
  // Recovery Progress Management
  // --------------------------

  public shared ({ caller }) func updateRecoveryProgress(region : Text, infrastructure : Nat, services : Nat, population : Nat, overallPercentage : Nat, pendingNeeds : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update recovery progress");
    };

    let progress : RecoveryProgress = {
      region;
      infrastructure;
      services;
      population;
      overallPercentage;
      pendingNeeds;
    };

    recoveryProgress.add(region, progress);
  };

  public query ({ caller }) func getRegionRecoveryProgress(region : Text) : async RecoveryProgress {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view recovery progress");
    };
    switch (recoveryProgress.get(region)) {
      case (null) { Runtime.trap("Region does not exist!") };
      case (?values) { values };
    };
  };

  public query ({ caller }) func getAllRecoveryProgress() : async [(Text, RecoveryProgress)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all recovery progress");
    };

    recoveryProgress.entries().toArray();
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };

    userProfiles.values().toArray();
  };

  // --------------------------
  // Emergency Contact & Notification Management
  // --------------------------

  // Add Emergency Contact (Admin only)
  public shared ({ caller }) func addEmergencyContact(name : Text, region : Text, contactInfo : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can manage emergency contacts");
    };

    let contact : EmergencyContact = {
      name;
      region;
      contactInfo;
    };

    emergencyContacts.add(name, contact);
  };

  // Get Emergency Contacts for Region
  public query ({ caller }) func getEmergencyContactsByRegion(region : Text) : async [EmergencyContact] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view emergency contacts");
    };

    let contactsArray = emergencyContacts.values().toArray();

    let filteredContacts = contactsArray.filter(
      func(contact) { Text.equal(contact.region, region) }
    );

    filteredContacts;
  };

  // Add Notification
  public shared ({ caller }) func addNotification(userId : UserId, message : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add notifications");
    };

    let notification : Notification = {
      id = nextNotificationId;
      userId;
      message;
      timestamp = Time.now();
      read = false;
    };

    notifications.add(nextNotificationId, notification);
    let currentId = nextNotificationId;
    nextNotificationId += 1;
    currentId;
  };

  // Get Notifications for User
  public query ({ caller }) func getNotificationsForUser() : async [Notification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };

    let notificationsArray = notifications.values().toArray();

    let filteredNotifications = notificationsArray.filter(
      func(notification) { notification.userId == caller }
    );

    filteredNotifications;
  };

  // Mark Notification as Read
  public shared ({ caller }) func markNotificationAsRead(notificationId : Nat) : async () {
    switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification does not exist!") };
      case (?notification) {
        if (notification.userId != caller) {
          Runtime.trap("Unauthorized: Only the notified user can mark notification as read");
        };
        let updatedNotification = {
          notification with read = true;
        };
        notifications.add(notificationId, updatedNotification);
      };
    };
  };
};

