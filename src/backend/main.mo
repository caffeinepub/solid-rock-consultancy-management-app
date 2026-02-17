import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  public type Client = {
    id : Nat;
    name : Text;
    email : Text;
    phoneNumber : Text;
    company : Text;
    address : Text;
    createdAt : Time.Time;
  };

  public type Proposal = {
    id : Nat;
    clientId : Nat;
    title : Text;
    description : Text;
    value : Nat;
    status : ProposalStatus;
    createdAt : Time.Time;
  };

  public type Project = {
    id : Nat;
    clientId : Nat;
    name : Text;
    description : Text;
    status : ProjectStatus;
    createdAt : Time.Time;
  };

  public type Task = {
    id : Nat;
    projectId : ?Nat;
    assignee : Principal;
    title : Text;
    description : Text;
    dueDate : Time.Time;
    status : TaskStatus;
    createdAt : Time.Time;
  };

  public type TaskStatus = {
    #pending;
    #inProgress;
    #completed;
  };

  public type ProposalStatus = {
    #accepted;
    #rejected;
    #pending;
  };

  public type ProjectStatus = {
    #active;
    #completed;
    #onHold;
  };

  public type UserProfile = {
    name : Text;
  };

  // Comparison modules
  module Task {
    public func compareByOlder(task1 : Task, task2 : Task) : Order.Order {
      if (task1.createdAt < task2.createdAt) {
        #less;
      } else if (task1.createdAt > task2.createdAt) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  module Proposal {
    public func compare(proposal1 : Proposal, proposal2 : Proposal) : Order.Order {
      if (proposal1.createdAt < proposal2.createdAt) {
        #less;
      } else if (proposal1.createdAt > proposal2.createdAt) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  module Client {
    public func compareByCompany(client1 : Client, client2 : Client) : Order.Order {
      Text.compare(client1.company, client2.company);
    };
  };

  // State
  let accessControlState = AccessControl.initState();
  let clients = Map.empty<Nat, Client>();
  let proposals = Map.empty<Nat, Proposal>();
  let tasks = Map.empty<Nat, Task>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createTask(
    assignee : Principal,
    title : Text,
    description : Text,
    dueDate : Time.Time,
  ) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let taskId = tasks.size() + 1;
    let task : Task = {
      id = taskId;
      assignee;
      title;
      description;
      dueDate;
      status = #pending;
      createdAt = Time.now();
      projectId = null;
    };

    tasks.add(taskId, task);
    task;
  };

  public shared ({ caller }) func updateTaskStatus(taskId : Nat, newStatus : TaskStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update task status");
    };

    switch (tasks.get(taskId)) {
      case (null) {
        Runtime.trap("Task not found with ID: " # taskId.toText());
      };
      case (?task) {
        if (task.assignee != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only assignee or admin can update task");
        };

        let updatedTask : Task = {
          id = task.id;
          assignee = task.assignee;
          title = task.title;
          description = task.description;
          dueDate = task.dueDate;
          status = newStatus;
          createdAt = task.createdAt;
          projectId = task.projectId;
        };

        tasks.add(taskId, updatedTask);
      };
    };
  };

  public query ({ caller }) func getTasksByAssignee(assignee : Principal) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    if (caller != assignee and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tasks");
    };

    let assigneeTasks = tasks.filter(
      func(_id, task) {
        task.assignee == assignee;
      }
    );
    assigneeTasks.values().toArray().sort(Task.compareByOlder);
  };

  public query ({ caller }) func getTasksByStatus(status : TaskStatus) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    let statusTasks = tasks.filter(
      func(_id, task) {
        task.status == status;
      }
    );
    statusTasks.values().toArray().sort(Task.compareByOlder);
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    tasks.values().toArray().sort(Task.compareByOlder);
  };

  public shared ({ caller }) func createProposal(
    clientId : Nat,
    title : Text,
    description : Text,
    value : Nat,
  ) : async Proposal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create proposals");
    };

    switch (clients.get(clientId)) {
      case (null) {
        Runtime.trap("Client not found with ID: " # clientId.toText());
      };
      case (?_client) {
        let proposalId = proposals.size() + 1;
        let proposal : Proposal = {
          id = proposalId;
          clientId;
          title;
          description;
          value;
          status = #pending;
          createdAt = Time.now();
        };

        proposals.add(proposalId, proposal);
        proposal;
      };
    };
  };

  public query ({ caller }) func getProposalsByClient(clientId : Nat) : async [Proposal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view proposals");
    };

    let clientProposals = proposals.filter(
      func(_id, proposal) {
        proposal.clientId == clientId;
      }
    );
    clientProposals.values().toArray().sort();
  };

  public shared ({ caller }) func setProposalStatus(proposalId : Nat, status : ProposalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update proposal status");
    };

    switch (proposals.get(proposalId)) {
      case (null) {
        Runtime.trap("Proposal not found with ID: " # proposalId.toText());
      };
      case (?proposal) {
        let updatedProposal : Proposal = {
          id = proposal.id;
          clientId = proposal.clientId;
          title = proposal.title;
          description = proposal.description;
          value = proposal.value;
          status;
          createdAt = proposal.createdAt;
        };

        proposals.add(proposalId, updatedProposal);
      };
    };
  };

  public query ({ caller }) func getTaskStatusCount() : async [(TaskStatus, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics");
    };

    let pendingTasks = tasks.filter(
      func(_id, task) {
        task.status == #pending;
      }
    );
    let inProgressTasks = tasks.filter(
      func(_id, task) {
        task.status == #inProgress;
      }
    );
    let completedTasks = tasks.filter(
      func(_id, task) {
        task.status == #completed;
      }
    );

    [(#pending, pendingTasks.size()), (#inProgress, inProgressTasks.size()), (#completed, completedTasks.size())];
  };

  public query ({ caller }) func getTasksByAssigneeAndStatus(assignee : Principal, status : TaskStatus) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    if (caller != assignee and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tasks");
    };

    let filteredTasks = tasks.filter(
      func(_id, task) {
        task.assignee == assignee and task.status == status
      }
    );
    filteredTasks.values().toArray().sort(Task.compareByOlder);
  };

  public query ({ caller }) func getProposalsByStatus(status : ProposalStatus) : async [Proposal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view proposals");
    };

    let filteredProposals = proposals.filter(
      func(_id, proposal) {
        proposal.status == status
      }
    );
    filteredProposals.values().toArray();
  };

  public query ({ caller }) func getProposalsByClientAndStatus(clientId : Nat, status : ProposalStatus) : async [Proposal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view proposals");
    };

    let filteredProposals = proposals.filter(
      func(_id, proposal) {
        proposal.clientId == clientId and proposal.status == status
      }
    );
    filteredProposals.values().toArray();
  };

  public query ({ caller }) func getTasksByDueDateRange(startDate : Time.Time, endDate : Time.Time) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    let filteredTasks = tasks.filter(
      func(_id, task) {
        task.dueDate >= startDate and task.dueDate <= endDate
      }
    );
    filteredTasks.values().toArray().sort(Task.compareByOlder);
  };

  public query ({ caller }) func getOverdueTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    let currentTime = Time.now();
    let overdueTasks = tasks.filter(
      func(_id, task) {
        task.dueDate < currentTime and task.status != #completed
      }
    );
    overdueTasks.values().toArray().sort(Task.compareByOlder);
  };

  public query ({ caller }) func getTasksCreatedByAssignee(assignee : Principal) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    if (caller != assignee and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tasks");
    };

    let assigneeTasks = tasks.filter(
      func(_id, task) {
        task.assignee == assignee;
      }
    );
    assigneeTasks.values().toArray().sort(Task.compareByOlder);
  };

  public query ({ caller }) func getTasksByYear(year : Nat) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    let filteredTasks = tasks.filter(
      func(_id, task) {
        let taskYear = getTimeYear(task.createdAt);
        taskYear == year;
      }
    );
    filteredTasks.values().toArray().sort(Task.compareByOlder);
  };

  func getTimeYear(_timestamp : Time.Time) : Nat { 2024 };

  public query ({ caller }) func getAllClients() : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };

    clients.values().toArray();
  };

  public query ({ caller }) func getAllClientsSorted(sortBy : ?Text) : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };

    let clientsArray = clients.values().toArray();

    switch (sortBy) {
      case (null) { clientsArray };
      case (?sortParam) {
        switch (sortParam) {
          case ("company") {
            clientsArray.sort(Client.compareByCompany);
          };
          case ("createdAt") {
            clientsArray.sort(
              func(c1, c2) {
                if (c1.createdAt < c2.createdAt) {
                  #less;
                } else if (c1.createdAt > c2.createdAt) {
                  #greater;
                } else {
                  #equal;
                };
              }
            );
          };
          case (_) { clientsArray };
        };
      };
    };
  };

  public query ({ caller }) func getClientsByCompany(company : Text, sortBy : ?Text) : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };

    let filteredClients = clients.filter(
      func(_id, client) {
        Text.equal(client.company, company);
      }
    );

    let clientsArray = filteredClients.values().toArray();

    switch (sortBy) {
      case (null) { clientsArray };
      case (?sortParam) {
        switch (sortParam) {
          case ("createdAt") {
            clientsArray.sort(
              func(c1, c2) {
                if (c1.createdAt < c2.createdAt) {
                  #less;
                } else if (c1.createdAt > c2.createdAt) {
                  #greater;
                } else {
                  #equal;
                };
              }
            );
          };
          case ("company") { clientsArray };
          case (_) { clientsArray };
        };
      };
    };
  };
};
