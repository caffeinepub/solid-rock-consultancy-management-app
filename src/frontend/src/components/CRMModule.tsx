import { useState } from 'react';
import { useGetAllClients } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import ProposalsList from './ProposalsList';
import { ProposalStatus } from '../backend';

export default function CRMModule() {
  const { data: clients = [], isLoading: clientsLoading } = useGetAllClients();
  const [selectedClient, setSelectedClient] = useState<bigint | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <img
            src="/assets/generated/crm-icon-transparent.dim_64x64.png"
            alt="CRM"
            className="h-8 w-8"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold">CRM Module</h2>
          <p className="text-sm text-muted-foreground">Track proposals, projects, and client interactions</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : clients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No clients available</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id.toString()}
                    onClick={() => setSelectedClient(client.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedClient === client.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-accent border-border'
                    }`}
                  >
                    <p className="font-medium truncate">{client.name}</p>
                    <p className="text-xs opacity-80 truncate">{client.company}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {selectedClient ? (
            <ProposalsList clientId={selectedClient} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Select a client</p>
                <p className="text-sm text-muted-foreground">Choose a client to view their proposals</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Proposals</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ProposalsList clientId={null} />
        </TabsContent>
        <TabsContent value="pending">
          <ProposalsList clientId={null} statusFilter={ProposalStatus.pending} />
        </TabsContent>
        <TabsContent value="accepted">
          <ProposalsList clientId={null} statusFilter={ProposalStatus.accepted} />
        </TabsContent>
        <TabsContent value="rejected">
          <ProposalsList clientId={null} statusFilter={ProposalStatus.rejected} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
