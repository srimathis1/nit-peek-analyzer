import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pill, Clock, AlertCircle, Plus, Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MedicationUpload } from "@/components/MedicationUpload";

export default function Medications() {
  const medications = [
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Twice daily",
      times: ["08:00 AM", "08:00 PM"],
      nextDose: "8:00 PM",
      remaining: 25,
      total: 30,
      instructions: "Take with food",
      prescribedBy: "Dr. Sarah Williams",
      startDate: "2025-09-01",
      status: "active"
    },
    {
      id: 2,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Three times daily",
      times: ["08:00 AM", "12:00 PM", "06:00 PM"],
      nextDose: "6:00 PM",
      remaining: 30,
      total: 30,
      instructions: "Take with meals",
      prescribedBy: "Dr. Sarah Williams",
      startDate: "2025-09-01",
      status: "active"
    },
    {
      id: 3,
      name: "Aspirin",
      dosage: "81mg",
      frequency: "Once daily",
      times: ["08:00 AM"],
      nextDose: "Tomorrow 8:00 AM",
      remaining: 28,
      total: 30,
      instructions: "Take in the morning",
      prescribedBy: "Dr. Michael Chen",
      startDate: "2025-09-15",
      status: "active"
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medications</h1>
          <p className="text-sm text-muted-foreground">Track and manage patient medications</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Medication
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-card border hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Medications</p>
                <p className="text-3xl font-bold text-foreground">5</p>
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
                <p className="text-3xl font-bold text-foreground">3</p>
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
                <p className="text-3xl font-bold text-foreground">1</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <Badge variant="default">{med.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="font-medium">{med.frequency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Times:</span>
                  <span className="font-medium">{med.times.join(", ")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next dose:</span>
                  <span className="font-medium text-primary">{med.nextDose}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prescribed by:</span>
                  <span className="font-medium">{med.prescribedBy}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Instructions</p>
                <p className="text-sm font-medium">{med.instructions}</p>
              </div>

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
                <Button size="sm" variant="outline" className="flex-1">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Reminder
                </Button>
                <MedicationUpload />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}