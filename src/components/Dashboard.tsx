import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Heart, Pill, Users, AlertTriangle, CheckCircle, MapPin } from "lucide-react";

const Dashboard = () => {
  const todayAppointments = [
    { id: 1, patient: "Margaret Johnson", time: "09:00 AM", type: "Routine Checkup", status: "confirmed" },
    { id: 2, patient: "Robert Chen", time: "10:30 AM", type: "Medication Review", status: "pending" },
    { id: 3, patient: "Dorothy Williams", time: "02:00 PM", type: "Physical Therapy", status: "confirmed" },
    { id: 4, patient: "James Miller", time: "03:30 PM", type: "Follow-up", status: "urgent" },
  ];

  const medications = [
    { patient: "Margaret Johnson", medication: "Lisinopril", nextDose: "2:00 PM", status: "due" },
    { patient: "Robert Chen", medication: "Metformin", nextDose: "6:00 PM", status: "scheduled" },
    { patient: "Dorothy Williams", medication: "Calcium", nextDose: "8:00 PM", status: "scheduled" },
  ];

  const vitals = [
    { patient: "Margaret Johnson", heartRate: 72, bloodPressure: "120/80", temperature: "98.6°F", status: "normal" },
    { patient: "Robert Chen", heartRate: 88, bloodPressure: "140/90", temperature: "99.1°F", status: "attention" },
    { patient: "Dorothy Williams", heartRate: 68, bloodPressure: "115/75", temperature: "98.4°F", status: "normal" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "urgent": return "bg-destructive text-destructive-foreground";
      case "attention": return "bg-warning text-warning-foreground";
      case "due": return "bg-warning text-warning-foreground";
      case "confirmed": return "bg-secondary text-secondary-foreground";
      case "normal": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ElderCare Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive elderly care management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">Dr. Sarah Mitchell</p>
              <p className="text-sm text-muted-foreground">Care Coordinator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-medical rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold text-primary">4</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-secondary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                  <p className="text-2xl font-bold text-secondary">12</p>
                </div>
                <Heart className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-warning">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medications Due</p>
                  <p className="text-2xl font-bold text-warning">3</p>
                </div>
                <Pill className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-l-4 border-l-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                  <p className="text-2xl font-bold text-accent">1</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

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
                <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-medical">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {appointment.time}
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
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
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-medical">
                  <div>
                    <p className="font-medium">{med.patient}</p>
                    <p className="text-sm text-muted-foreground">{med.medication}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{med.nextDose}</p>
                    <Badge className={getStatusColor(med.status)}>
                      {med.status}
                    </Badge>
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
              Recent Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vitals.map((vital, index) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-care/10 border border-accent/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{vital.patient}</h3>
                    <Badge className={getStatusColor(vital.status)}>
                      {vital.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
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