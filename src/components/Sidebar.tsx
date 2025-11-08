import { Calendar, Pill, User, Bell, Settings, LayoutDashboard, Mic, Phone, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useVoiceReminder } from "@/hooks/useVoiceReminder";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Voice Assistant", url: "/voice-assistant", icon: Phone },
  { title: "Smart Health", url: "/ai-insights", icon: Mic },
  { title: "Appointments", url: "/appointments", icon: Calendar },
  { title: "Medications", url: "/medications", icon: Pill },
  { title: "Patient Profile", url: "/profile", icon: User },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { toast } = useToast();
  const { scheduleReminders, cancelReminders } = useVoiceReminder();
  const [enabledReminders, setEnabledReminders] = useState<Set<string>>(new Set());

  // Fetch medications from database
  const { data: medications = [], refetch } = useQuery({
    queryKey: ['sidebar-medications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching medications:', error);
        return [];
      }

      return data || [];
    }
  });

  const parseTimeToDate = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const scheduleForMedication = (medication: any) => {
    if (!medication.times || medication.times.length === 0) return;
    const reminders = medication.times.map((time: string) => ({
      at: parseTimeToDate(time),
      message: `Time to take your ${medication.name} - ${medication.dosage}`
    }));
    scheduleReminders(reminders, medication.id);
  };

  const handleToggleVoiceReminder = (medication: any) => {
    const medId = medication.id;
    if (enabledReminders.has(medId)) {
      cancelReminders(medId);
      setEnabledReminders(prev => {
        const next = new Set(prev);
        next.delete(medId);
        return next;
      });
      toast({
        title: "Voice Reminders Disabled",
        description: `Voice reminders for ${medication.name} turned off.`
      });
    } else {
      scheduleForMedication(medication);
      setEnabledReminders(prev => new Set(prev).add(medId));
      toast({
        title: "Voice Reminders Enabled",
        description: `Voice reminders scheduled for ${medication.name}.`
      });
    }
  };

  const handleDeleteMedication = async (medicationId: string, medicationName: string) => {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', medicationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete medication.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Medication Deleted",
      description: `${medicationName} has been removed.`,
    });
    
    refetch();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarContent>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-medical flex items-center justify-center">
              <span className="text-primary-foreground font-bold">E</span>
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-foreground">ElderCare</span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 p-4">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-medical ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="flex-1">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Medications Section */}
        {!isCollapsed && medications.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Medications
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-[300px] px-4">
                <div className="space-y-3 py-2">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {med.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {med.dosage}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant={enabledReminders.has(med.id) ? "default" : "outline"}
                          className="flex-1 h-7 text-xs"
                          onClick={() => handleToggleVoiceReminder(med)}
                        >
                          <Mic className="w-3 h-3 mr-1" />
                          {enabledReminders.has(med.id) ? "On" : "Reminder"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2"
                          onClick={() => handleDeleteMedication(med.id, med.name)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
