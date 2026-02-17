import { useGetAllClients, useGetAllTasks, useGetTaskStatusCount } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsDashboard() {
  const { data: clients = [], isLoading: clientsLoading } = useGetAllClients();
  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();
  const { data: taskStatusCount = [], isLoading: statusLoading } = useGetTaskStatusCount();

  const completedTasks = taskStatusCount.find(([status]) => status === 'completed')?.[1] || BigInt(0);
  const pendingTasks = taskStatusCount.find(([status]) => status === 'pending')?.[1] || BigInt(0);
  const inProgressTasks = taskStatusCount.find(([status]) => status === 'inProgress')?.[1] || BigInt(0);

  const overdueTasks = tasks.filter(task => {
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    return task.dueDate < now && task.status !== 'completed';
  }).length;

  const stats = [
    {
      title: 'Total Clients',
      value: clients.length,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      loading: clientsLoading,
    },
    {
      title: 'Total Tasks',
      value: tasks.length,
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
      loading: tasksLoading,
    },
    {
      title: 'Completed Tasks',
      value: Number(completedTasks),
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950',
      loading: statusLoading,
    },
    {
      title: 'Overdue Tasks',
      value: overdueTasks,
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-950',
      loading: tasksLoading,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <img
            src="/assets/generated/analytics-icon-transparent.dim_64x64.png"
            alt="Analytics"
            className="h-8 w-8"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-sm text-muted-foreground">Key metrics and insights for your consultancy</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {stat.loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusLoading ? (
              <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <span className="text-2xl font-bold">{Number(pendingTasks)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">In Progress</span>
                  </div>
                  <span className="text-2xl font-bold">{Number(inProgressTasks)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <span className="text-2xl font-bold">{Number(completedTasks)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Clients</span>
              <span className="text-lg font-semibold">{clients.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Tasks</span>
              <span className="text-lg font-semibold">{tasks.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <span className="text-lg font-semibold">
                {tasks.length > 0
                  ? `${Math.round((Number(completedTasks) / tasks.length) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
