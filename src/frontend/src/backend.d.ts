import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Task {
    id: bigint;
    status: TaskStatus;
    assignee: Principal;
    title: string;
    createdAt: Time;
    dueDate: Time;
    description: string;
    projectId?: bigint;
}
export interface Client {
    id: bigint;
    name: string;
    createdAt: Time;
    email: string;
    company: string;
    address: string;
    phoneNumber: string;
}
export interface Proposal {
    id: bigint;
    status: ProposalStatus;
    title: string;
    clientId: bigint;
    value: bigint;
    createdAt: Time;
    description: string;
}
export interface UserProfile {
    name: string;
}
export enum ProposalStatus {
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum TaskStatus {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProposal(clientId: bigint, title: string, description: string, value: bigint): Promise<Proposal>;
    createTask(assignee: Principal, title: string, description: string, dueDate: Time): Promise<Task>;
    getAllClients(): Promise<Array<Client>>;
    getAllClientsSorted(sortBy: string | null): Promise<Array<Client>>;
    getAllTasks(): Promise<Array<Task>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClientsByCompany(company: string, sortBy: string | null): Promise<Array<Client>>;
    getOverdueTasks(): Promise<Array<Task>>;
    getProposalsByClient(clientId: bigint): Promise<Array<Proposal>>;
    getProposalsByClientAndStatus(clientId: bigint, status: ProposalStatus): Promise<Array<Proposal>>;
    getProposalsByStatus(status: ProposalStatus): Promise<Array<Proposal>>;
    getTaskStatusCount(): Promise<Array<[TaskStatus, bigint]>>;
    getTasksByAssignee(assignee: Principal): Promise<Array<Task>>;
    getTasksByAssigneeAndStatus(assignee: Principal, status: TaskStatus): Promise<Array<Task>>;
    getTasksByDueDateRange(startDate: Time, endDate: Time): Promise<Array<Task>>;
    getTasksByStatus(status: TaskStatus): Promise<Array<Task>>;
    getTasksByYear(year: bigint): Promise<Array<Task>>;
    getTasksCreatedByAssignee(assignee: Principal): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setProposalStatus(proposalId: bigint, status: ProposalStatus): Promise<void>;
    updateTaskStatus(taskId: bigint, newStatus: TaskStatus): Promise<void>;
}
