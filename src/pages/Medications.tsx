import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pill, Clock, AlertCircle, Plus, Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MedicationUpload } from "@/components/MedicationUpload";
import { useState } from "react";
import { useVoiceReminder } from "@/hooks/useVoiceReminder";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Medications() {
  const { toast } = useToast();
  const { scheduleReminders, cancelReminders } = useVoiceReminder();
  const [enabledReminders, setEnabledReminders] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    times: "",
    instructions: "",
    remaining: "",
    total: ""
  });

  // Fetch medications from database
  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your medications.",
          variant: "destructive",
        });
        return [];
      }

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching medications:', error);
        toast({
          title: "Error",
          description: "Failed to load medications.",
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    }
  });

  const parseTimeToDate = (timeStr: string) => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null as any;
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const ap = match[3].toUpperCase();
    if (ap === 'PM' && hour !== 12) hour += 12;
    if (ap === 'AM' && hour === 12) hour = 0;
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const scheduleForMedication = (med: any) => {
    const today = new Date();
    const starts = med.start_date ? new Date(med.start_date) : today;
    if (starts > today) {
      scheduleReminders([], `med-${med.id}`);
      return;
    }
    const items = (med.times || [])
      .map((t: string) => parseTimeToDate(t))
      .filter((d: Date | null) => d && d.getTime() > Date.now())
      .map((d: Date) => ({
        at: d,
        message: `It's time to take ${med.name} ${med.dosage}. ${med.instructions || ''}`.trim(),
      }));
    scheduleReminders(items, `med-${med.id}`);
  };

  const onToggleReminder = (med: any) => {
    const key = med.id as string;
    const group = `med-${key}`;
    if (enabledReminders[key]) {
      cancelReminders(group);
      setEnabledReminders(prev => ({ ...prev, [key]: false }));
    } else {
      scheduleForMedication(med);
      setEnabledReminders(prev => ({ ...prev, [key]: true }));
    }
  };

  const activeCount = medications.length;
  const dueToday = medications.filter(m => m.times && m.times.length > 0).length;
  const lowStock = medications.filter(m => m.remaining < 10).length;

  const handleAddMedication = async () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast({
        title: "Missing Information",
        description: "Please fill in medication name and dosage.",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add medications.",
        variant: "destructive",
      });
      return;
    }

    const timesArray = newMedication.times ? newMedication.times.split(',').map(t => t.trim()) : [];
    
    const { error } = await supabase.from('medications').insert({
      user_id: user.id,
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency || 'As needed',
      times: timesArray,
      instructions: newMedication.instructions,
      remaining: parseInt(newMedication.remaining) || 30,
      total: parseInt(newMedication.total) || 30,
      start_date: new Date().toISOString().split('T')[0]
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add medication.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Medication Added",
      description: `${newMedication.name} has been added successfully.`,
    });
    
    setDialogOpen(false);
    setNewMedication({ name: "", dosage: "", frequency: "", times: "", instructions: "", remaining: "", total: "" });
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medications</h1>
          <p className="text-sm text-muted-foreground">Track and manage patient medications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name *</Label>
                <Input
                  id="name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  placeholder="e.g., Aspirin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  placeholder="e.g., 100mg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  placeholder="e.g., Twice daily"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="times">Times (comma-separated)</Label>
                <Input
                  id="times"
                  value={newMedication.times}
                  onChange={(e) => setNewMedication({...newMedication, times: e.target.value})}
                  placeholder="e.g., 8:00 AM, 8:00 PM"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="remaining">Remaining Pills</Label>
                  <Input
                    id="remaining"
                    type="number"
                    value={newMedication.remaining}
                    onChange={(e) => setNewMedication({...newMedication, remaining: e.target.value})}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total">Total Pills</Label>
                  <Input
                    id="total"
                    type="number"
                    value={newMedication.total}
                    onChange={(e) => setNewMedication({...newMedication, total: e.target.value})}
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                  placeholder="e.g., Take with food"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMedication}>Add Medication</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-card border hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Medications</p>
                <p className="text-3xl font-bold text-foreground">{activeCount}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pill className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-3xl font-bold text-foreground">{dueToday}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-3xl font-bold text-foreground">{lowStock}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {medications.length === 0 ? (
        <Card className="shadow-elevated">
          <CardContent className="p-12 text-center">
            <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Medications Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a photo of your medication to get started
            </p>
            <MedicationUpload />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {medications.map((med) => (
            <Card key={med.id} className="shadow-elevated">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="w-5 h-5 text-primary" />
                      {med.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{med.dosage}</p>
                  </div>
                  <Badge variant="default">active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">{med.frequency}</span>
                  </div>
                  {med.times && med.times.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Times:</span>
                      <span className="font-medium">{med.times.join(", ")}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{new Date(med.start_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {med.instructions && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Instructions</p>
                    <p className="text-sm font-medium">{med.instructions}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className="font-medium">{med.remaining} of {med.total} pills</span>
                  </div>
                  <Progress value={(med.remaining / med.total) * 100} className="h-2" />
                  {med.remaining < 10 && (
                    <p className="text-xs text-warning flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Low stock - refill needed soon
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant={enabledReminders[med.id] ? "secondary" : "outline"}
                    className="flex-1"
                    onClick={() => onToggleReminder(med)}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {enabledReminders[med.id] ? "Disable Voice Reminder" : "Enable Voice Reminder"}
                  </Button>
                  <MedicationUpload />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}