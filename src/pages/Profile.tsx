import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MapPin, Calendar, Activity, FileText, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const patient = {
    name: "Margaret Johnson",
    age: 78,
    gender: "Female",
    bloodType: "O+",
    phone: "+1 (555) 123-4567",
    email: "margaret.j@email.com",
    address: "123 Elder Care Lane, Springfield, IL 62701",
    emergencyContact: {
      name: "Sarah Johnson (Daughter)",
      phone: "+1 (555) 987-6543"
    },
    medicalHistory: [
      { condition: "Hypertension", diagnosedDate: "2020-03-15", status: "Active" },
      { condition: "Type 2 Diabetes", diagnosedDate: "2019-08-22", status: "Active" },
      { condition: "Arthritis", diagnosedDate: "2018-11-10", status: "Active" },
    ],
    allergies: ["Penicillin", "Shellfish"],
    medications: 5,
    lastVisit: "2025-09-28",
    nextAppointment: "2025-10-01"
  };

  const vitalHistory = [
    { date: "2025-09-28", heartRate: 72, bloodPressure: "125/82", weight: "68kg", temperature: "98.4°F" },
    { date: "2025-09-21", heartRate: 75, bloodPressure: "128/85", weight: "68.5kg", temperature: "98.6°F" },
    { date: "2025-09-14", heartRate: 70, bloodPressure: "122/80", weight: "69kg", temperature: "98.5°F" },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Profile</h1>
          <p className="text-sm text-muted-foreground">View and manage patient information</p>
        </div>
        <Button className="gap-2">
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-elevated">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="text-2xl bg-gradient-medical text-primary-foreground">
                  MJ
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">Age: {patient.age} | {patient.gender}</p>
              <Badge variant="outline" className="mt-2">Blood Type: {patient.bloodType}</Badge>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium">{patient.address}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-muted-foreground mb-2">Emergency Contact</p>
              <p className="text-sm font-medium">{patient.emergencyContact.name}</p>
              <p className="text-sm">{patient.emergencyContact.phone}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.medicalHistory.map((condition, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{condition.condition}</p>
                      <p className="text-sm text-muted-foreground">
                        Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={condition.status === "Active" ? "default" : "secondary"}>
                      {condition.status}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium mb-2">Allergies</p>
                <div className="flex gap-2">
                  {patient.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive">{allergy}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vitalHistory.map((vital, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">{vital.date}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Heart Rate</p>
                        <p className="text-lg font-bold">{vital.heartRate}</p>
                        <p className="text-xs text-muted-foreground">bpm</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Blood Pressure</p>
                        <p className="text-lg font-bold">{vital.bloodPressure}</p>
                        <p className="text-xs text-muted-foreground">mmHg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="text-lg font-bold">{vital.weight}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Temperature</p>
                        <p className="text-lg font-bold">{vital.temperature}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-card hover-scale">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Last Visit</p>
                <p className="text-2xl font-bold text-foreground">{patient.lastVisit}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover-scale">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Next Appointment</p>
                <p className="text-2xl font-bold text-primary">{patient.nextAppointment}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}