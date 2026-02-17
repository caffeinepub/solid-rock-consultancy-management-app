import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Users, FileText, CheckSquare, ClipboardCheck } from 'lucide-react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ClientDatabase from '../components/ClientDatabase';
import CRMModule from '../components/CRMModule';
import TaskTracker from '../components/TaskTracker';
import PreLaunchChecklist from '../components/PreLaunchChecklist';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="container py-6 px-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your consultancy operations from one central location
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-auto">
          <TabsTrigger value="analytics" className="gap-2 py-3">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-2 py-3">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Clients</span>
          </TabsTrigger>
          <TabsTrigger value="crm" className="gap-2 py-3">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">CRM</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2 py-3">
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2 py-3">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Checklist</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <ClientDatabase />
        </TabsContent>

        <TabsContent value="crm" className="space-y-6">
          <CRMModule />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TaskTracker />
        </TabsContent>

        <TabsContent value="checklist" className="space-y-6">
          <PreLaunchChecklist />
        </TabsContent>
      </Tabs>
    </div>
  );
}
