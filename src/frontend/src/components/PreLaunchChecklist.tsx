import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const INITIAL_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'test-modules',
    title: 'Test all core modules',
    description: 'Verify Client Management, CRM, Task Tracker, and Dashboard analytics are working correctly',
    completed: false,
  },
  {
    id: 'verify-roles',
    title: 'Verify user roles and permissions',
    description: 'Ensure proper access control and authorization is functioning as expected',
    completed: false,
  },
  {
    id: 'confirm-branding',
    title: 'Confirm branding',
    description: 'Check logos, themes, color schemes, and footer text are correctly displayed',
    completed: false,
  },
  {
    id: 'load-sample-data',
    title: 'Load sample data for testing',
    description: 'Add test clients, proposals, and tasks to verify system functionality',
    completed: false,
  },
  {
    id: 'soft-launch',
    title: 'Conduct internal soft launch test',
    description: 'Perform end-to-end testing with team members before full deployment',
    completed: false,
  },
];

export default function PreLaunchChecklist() {
  const { identity } = useInternetIdentity();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST_ITEMS);

  const storageKey = `prelaunch-checklist-${identity?.getPrincipal().toString() || 'anonymous'}`;

  // Load checklist state from local storage on mount
  useEffect(() => {
    const savedChecklist = localStorage.getItem(storageKey);
    if (savedChecklist) {
      try {
        const parsed = JSON.parse(savedChecklist);
        setChecklistItems(parsed);
      } catch (error) {
        console.error('Failed to parse saved checklist:', error);
      }
    }
  }, [storageKey]);

  // Save checklist state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checklistItems));
  }, [checklistItems, storageKey]);

  const toggleItem = (id: string) => {
    setChecklistItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const resetChecklist = () => {
    setChecklistItems(INITIAL_CHECKLIST_ITEMS);
  };

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pre-Launch Checklist</h2>
          <p className="text-muted-foreground mt-1">
            Complete these steps before launching your consultancy management system
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetChecklist} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset Checklist
        </Button>
      </div>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>
                {completedCount} of {totalCount} tasks completed
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {completionPercentage === 100 ? (
                <CheckCircle2 className="h-8 w-8 text-success" />
              ) : (
                <Circle className="h-8 w-8 text-muted-foreground" />
              )}
              <span className="text-3xl font-bold">{completionPercentage}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {checklistItems.map((item, index) => (
          <Card
            key={item.id}
            className={`transition-all ${
              item.completed
                ? 'border-success/50 bg-success/5'
                : 'hover:border-primary/50'
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={item.id}
                      className={`text-base font-semibold cursor-pointer flex items-center gap-2 ${
                        item.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {index + 1}
                      </span>
                      {item.title}
                    </label>
                    <p
                      className={`text-sm ${
                        item.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
                {item.completed && (
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-1" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {completionPercentage === 100 && (
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-success">All tasks completed!</h3>
                <p className="text-sm text-muted-foreground">
                  Your system is ready for launch. Great work!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
