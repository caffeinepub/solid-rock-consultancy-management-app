import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Client, Proposal, Task, TaskStatus, ProposalStatus } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllClients() {
  const { actor, isFetching } = useActor();

  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTasksByAssignee() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Task[]>({
    queryKey: ['tasks', 'assignee', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getTasksByAssignee(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetTasksByStatus(status: TaskStatus) {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks', 'status', status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOverdueTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks', 'overdue'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOverdueTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      assignee: Principal;
      title: string;
      description: string;
      dueDate: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(params.assignee, params.title, params.description, params.dueDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { taskId: bigint; newStatus: TaskStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTaskStatus(params.taskId, params.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useGetProposalsByClient(clientId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Proposal[]>({
    queryKey: ['proposals', 'client', clientId?.toString()],
    queryFn: async () => {
      if (!actor || !clientId) return [];
      return actor.getProposalsByClient(clientId);
    },
    enabled: !!actor && !isFetching && clientId !== null,
  });
}

export function useGetProposalsByStatus(status: ProposalStatus) {
  const { actor, isFetching } = useActor();

  return useQuery<Proposal[]>({
    queryKey: ['proposals', 'status', status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProposalsByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      clientId: bigint;
      title: string;
      description: string;
      value: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProposal(params.clientId, params.title, params.description, params.value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useSetProposalStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { proposalId: bigint; status: ProposalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setProposalStatus(params.proposalId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useGetTaskStatusCount() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[TaskStatus, bigint]>>({
    queryKey: ['analytics', 'taskStatusCount'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskStatusCount();
    },
    enabled: !!actor && !isFetching,
  });
}
