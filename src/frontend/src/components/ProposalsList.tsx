import { useGetProposalsByClient, useGetProposalsByStatus, useGetAllClients } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, DollarSign, Calendar } from 'lucide-react';
import { ProposalStatus } from '../backend';

interface ProposalsListProps {
  clientId: bigint | null;
  statusFilter?: ProposalStatus;
}

export default function ProposalsList({ clientId, statusFilter }: ProposalsListProps) {
  const { data: clientProposals = [], isLoading: clientProposalsLoading } = useGetProposalsByClient(clientId);
  const { data: statusProposals = [], isLoading: statusProposalsLoading } = useGetProposalsByStatus(
    statusFilter || ProposalStatus.pending
  );
  const { data: clients = [] } = useGetAllClients();

  const proposals = clientId ? clientProposals : statusFilter ? statusProposals : [];
  const isLoading = clientId ? clientProposalsLoading : statusProposalsLoading;

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.accepted:
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400';
      case ProposalStatus.rejected:
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400';
      case ProposalStatus.pending:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400';
    }
  };

  const getClientName = (clientId: bigint) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.name} (${client.company})` : 'Unknown Client';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No proposals found</p>
          <p className="text-sm text-muted-foreground">
            {clientId ? 'This client has no proposals yet' : 'No proposals match the selected filter'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <Card key={proposal.id.toString()} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-lg">{proposal.title}</CardTitle>
                {!clientId && (
                  <p className="text-sm text-muted-foreground">{getClientName(proposal.clientId)}</p>
                )}
              </div>
              <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{proposal.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">${Number(proposal.value).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(Number(proposal.createdAt) / 1_000_000).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
