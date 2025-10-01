import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Pill, Users, AlertTriangle, Mic, Camera } from "lucide-react";

export const DashboardContent = () => {
  const todayAppointments = [
    { 
      id: 1, 
      patient: "Margaret Johnson", 
      time: "02:00 PM", 
      type: "Routine Checkup"
    },
  ];

  const medications = [
    { 
      medication: "Lisinopril", 
      dosage: "10mg",
      times: "08:00, 20:00",
      nextDose: "8:00 PM",
      remaining: 25,
      instructions: "Take with food"
    },
    { 
      medication: "Metformin", 
      dosage: "500mg",
      times: "08:00, 12:00, 18:00",
      nextDose: "6:00 PM",
      remaining: 30,
      instructions: "Take with meals"
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-sm">Caregiver</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <div className="w-10 h-10 bg-gradient-medical rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                <p className="text-3xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground mt-1">Next: Today 2:00 PM</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Medications</p>
                <p className="text-3xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground mt-1">2 due today</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Pill className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patients</p>
                <p className="text-3xl font-bold text-foreground">2</p>
                <p className="text-xs text-muted-foreground mt-1">Active care plans</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Alerts</p>
                <p className="text-3xl font-bold text-foreground">2</p>
                <p className="text-xs text-muted-foreground mt-1">Medication reminders</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No appointments found</p>
            ) : (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    {appointment.time}
                  </div>
                  <p className="font-medium">{appointment.patient}</p>
                  <p className="text-sm text-muted-foreground">{appointment.type}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Medication Reminders */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Medication Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medications.map((med, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <Pill className="w-4 h-4 text-primary" />
                      {med.medication}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">Dosage: <span className="font-medium">{med.dosage}</span></p>
                    <p className="text-sm text-muted-foreground">{med.instructions}</p>
                  </div>
                  <span className="text-lg font-semibold">{med.dosage}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Times:</span>
                    <span className="font-medium">{med.times}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next dose:</span>
                    <span className="font-medium text-primary">{med.nextDose}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="font-medium">{med.remaining} pills</span>
                    </div>
                    <Progress value={(med.remaining / 30) * 100} className="h-2" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Reminder
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
