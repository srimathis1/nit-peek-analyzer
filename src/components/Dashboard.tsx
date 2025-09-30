import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Heart, Pill, Users, AlertTriangle, CheckCircle, MapPin, Phone, MessageSquare, Activity, FileText, TrendingUp, Bell } from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const todayAppointments = [
    { 
      id: 1, 
      patient: "Margaret Johnson", 
      time: "09:00 AM", 
      type: "Routine Checkup", 
      status: "confirmed",
      duration: "30 min",
      location: "Room 101",
      notes: "Annual wellness exam"
    },
    { 
      id: 2, 
      patient: "Robert Chen", 
      time: "10:30 AM", 
      type: "Medication Review", 
      status: "pending",
      duration: "20 min",
      location: "Room 102",
      notes: "Diabetes medication adjustment"
    },
    { 
      id: 3, 
      patient: "Dorothy Williams", 
      time: "02:00 PM", 
      type: "Physical Therapy", 
      status: "confirmed",
      duration: "45 min",
      location: "PT Room",
      notes: "Post-surgery rehabilitation"
    },
    { 
      id: 4, 
      patient: "James Miller", 
      time: "03:30 PM", 
      type: "Follow-up", 
      status: "urgent",
      duration: "25 min",
      location: "Room 103",
      notes: "Blood pressure monitoring"
    },
  ];

  const medications = [
    { 
      patient: "Margaret Johnson", 
      medication: "Lisinopril 10mg", 
      nextDose: "2:00 PM", 
      status: "due",
      frequency: "Once daily",
      remaining: 15
    },
    { 
      patient: "Robert Chen", 
      medication: "Metformin 500mg", 
      nextDose: "6:00 PM", 
      status: "scheduled",
      frequency: "Twice daily",
      remaining: 28
    },
    { 
      patient: "Dorothy Williams", 
      medication: "Calcium 600mg", 
      nextDose: "8:00 PM", 
      status: "scheduled",
      frequency: "Once daily",
      remaining: 7
    },
  ];

  const vitals = [
    { 
      patient: "Margaret Johnson", 
      heartRate: 72, 
      bloodPressure: "120/80", 
      temperature: "98.6°F", 
      status: "normal",
      oxygen: "98%",
      weight: "145 lbs",
      lastUpdated: "2 hours ago"
    },
    { 
      patient: "Robert Chen", 
      heartRate: 88, 
      bloodPressure: "140/90", 
      temperature: "99.1°F", 
      status: "attention",
      oxygen: "96%",
      weight: "180 lbs",
      lastUpdated: "30 min ago"
    },
    { 
      patient: "Dorothy Williams", 
      heartRate: 68, 
      bloodPressure: "115/75", 
      temperature: "98.4°F", 
      status: "normal",
      oxygen: "99%",
      weight: "130 lbs",
      lastUpdated: "1 hour ago"
    },
  ];

  const alerts = [
    {
      id: 1,
      patient: "Robert Chen",
      type: "Blood Pressure",
      message: "Blood pressure elevated (140/90)",
      severity: "high",
      time: "10 min ago"
    },
    {
      id: 2,
      patient: "Dorothy Williams",
      type: "Medication",
      message: "Low medication supply (7 days remaining)",
      severity: "medium",
      time: "2 hours ago"
    }
  ];

  const weeklyProgress = [
    { day: "Mon", appointments: 8, completed: 7 },
    { day: "Tue", appointments: 6, completed: 6 },
    { day: "Wed", appointments: 9, completed: 8 },
    { day: "Thu", appointments: 7, completed: 7 },
    { day: "Fri", appointments: 5, completed: 4 },
    { day: "Sat", appointments: 3, completed: 3 },
    { day: "Sun", appointments: 2, completed: 2 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "urgent": return "bg-destructive text-destructive-foreground";
      case "attention": return "bg-warning text-warning-foreground";
      case "due": return "bg-warning text-warning-foreground";
      case "confirmed": return "bg-secondary text-secondary-foreground";
      case "normal": return "bg-secondary text-secondary-foreground";
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="animate-scale-in">
            <h1 className="text-3xl font-bold text-foreground">ElderCare Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive elderly care management • {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
            <div className="text-right">
              <p className="font-medium">Dr. Sarah Mitchell</p>
              <p className="text-sm text-muted-foreground">Care Coordinator</p>
            </div>
            <div className="w-12 h-12 bg-gradient-medical rounded-full flex items-center justify-center shadow-medical">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="shadow-card border-l-4 border-l-primary hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold text-primary">4</p>
                  <p className="text-xs text-muted-foreground mt-1">3 confirmed, 1 pending</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-secondary hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                  <p className="text-2xl font-bold text-secondary">12</p>
                  <p className="text-xs text-muted-foreground mt-1">2 new this week</p>
                </div>
                <Heart className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-warning hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medications Due</p>
                  <p className="text-2xl font-bold text-warning">3</p>
                  <p className="text-xs text-muted-foreground mt-1">1 overdue</p>
                </div>
                <Pill className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-accent hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-accent">2</p>
                  <p className="text-xs text-muted-foreground mt-1">1 high priority</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-primary hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-primary">92%</p>
                  <p className="text-xs text-muted-foreground mt-1">This week</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card className="shadow-elevated border-l-4 border-l-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                    <div>
                      <p className="font-medium text-destructive">{alert.patient}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-medical border hover:border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {appointment.time} • {appointment.duration}
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {appointment.location}
                      </span>
                      <span>{appointment.notes}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}
              <Button className="w-full bg-gradient-medical text-primary-foreground hover:opacity-90">
                View All Appointments
              </Button>
            </CardContent>
          </Card>

          {/* Medication Schedule */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-secondary" />
                Medication Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.map((med, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-medical border hover:border-secondary/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{med.patient}</p>
                      <p className="text-sm text-muted-foreground">{med.medication}</p>
                    </div>
                    <Badge className={getStatusColor(med.status)}>
                      {med.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <p>Next Dose: <span className="font-medium">{med.nextDose}</span></p>
                      <p>Frequency: <span className="font-medium">{med.frequency}</span></p>
                    </div>
                    <div>
                      <p>Remaining: <span className="font-medium">{med.remaining} days</span></p>
                      <Progress value={(med.remaining / 30) * 100} className="mt-1 h-1" />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-gradient-health hover:text-secondary-foreground">
                Manage Medications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Patient Vitals */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              Recent Vitals & Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vitals.map((vital, index) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-care/10 border border-accent/20 hover:border-accent/40 transition-medical">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{vital.patient}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(vital.status)}>
                        {vital.status}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Activity className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Heart Rate:</span>
                        <span className="font-medium">{vital.heartRate} bpm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Blood Pressure:</span>
                        <span className="font-medium">{vital.bloodPressure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span className="font-medium">{vital.temperature}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Oxygen:</span>
                        <span className="font-medium">{vital.oxygen}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="font-medium">{vital.weight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span className="font-medium text-xs">{vital.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Appointment Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium mb-2">{day.day}</p>
                  <div className="bg-muted rounded-lg p-3 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {day.completed}/{day.appointments}
                    </p>
                    <Progress 
                      value={getProgressPercentage(day.completed, day.appointments)} 
                      className="h-2"
                    />
                    <p className="text-xs font-medium">
                      {getProgressPercentage(day.completed, day.appointments)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;