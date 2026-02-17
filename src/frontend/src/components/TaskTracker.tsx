import { useState } from 'react';
import { useGetAllTasks, useGetTasksByAssignee, useUpdateTaskStatus } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { TaskStatus } from '../backend';

export default function TaskTracker() {
  const { identity } = useInternetIdentity();
  const { data: allTasks = [], isLoading: allTasksLoading } = useGetAllTasks();
  const { data: myTasks = [], isLoading: myTasksLoading } = useGetTasksByAssignee();
  const updateTaskStatus = useUpdateTaskStatus();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleStatusUpdate = async (taskId: bigint, newStatus: TaskStatus) => {
    setUpdatingTaskId(taskId.toString());
    try {
      await updateTaskStatus.mutateAsync({ taskId, newStatus });
      toast.success('Task status updated successfully');
    } catch (error) {
      toast.error('Failed to update task status');
      console.error(error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.completed:
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400';
      case TaskStatus.inProgress:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400';
      case TaskStatus.pending:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400';
    }
  };

  const isOverdue = (dueDate: bigint) => {
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    return dueDate < now;
  };

  const canUpdateTask = (task: any) => {
    if (!identity) return false;
    return task.assignee.toString() === identity.getPrincipal().toString();
  };

  const renderTaskCard = (task: any) => {
    const overdue = isOverdue(task.dueDate) && task.status !== TaskStatus.completed;
    const canUpdate = canUpdateTask(task);
    const isUpdating = updatingTaskId === task.id.toString();

    return (
      <Card key={task.id.toString()} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg flex-1">{task.title}</CardTitle>
            <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{task.description}</p>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(Number(task.dueDate) / 1_000_000).toLocaleDateString()}</span>
            </div>
            {overdue && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Overdue</span>
              </div>
            )}
          </div>

          {canUpdate && task.status !== TaskStatus.completed && (
            <div className="flex gap-2 pt-2 border-t">
              {task.status === TaskStatus.pending && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(task.id, TaskStatus.inProgress)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? 'Updating...' : 'Start Task'}
                </Button>
              )}
              {task.status === TaskStatus.inProgress && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(task.id, TaskStatus.completed)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? 'Updating...' : 'Mark Complete'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <img
            src="/assets/generated/task-icon-transparent.dim_64x64.png"
            alt="Tasks"
            className="h-8 w-8"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Task Tracker</h2>
          <p className="text-sm text-muted-foreground">Manage and track your team's tasks and assignments</p>
        </div>
      </div>

      <Tabs defaultValue="my-tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tasks" className="space-y-4">
          {myTasksLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No tasks assigned</p>
                <p className="text-sm text-muted-foreground">You don't have any tasks assigned to you</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myTasks.map(renderTaskCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all-tasks" className="space-y-4">
          {allTasksLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No tasks found</p>
                <p className="text-sm text-muted-foreground">No tasks have been created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allTasks.map(renderTaskCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
